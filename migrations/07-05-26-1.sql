-- ============================================================
-- SendHope Venezuela — Esquema inicial de base de datos
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================
-- Cobertura: Muro de Transparencia (compras + fotos) y Donaciones
-- (pasarela automática + confirmación manual).
-- No incluye tablas de usuarios: el backoffice usa credencial
-- compartida validada server-side, no Supabase Auth.
-- ============================================================


-- ------------------------------------------------------------
-- 1. EXTENSIONES
-- ------------------------------------------------------------
create extension if not exists "pgcrypto"; -- para gen_random_uuid()


-- ------------------------------------------------------------
-- 2. TABLA: purchases
--    Registro manual de cada compra hecha para los refugios.
--    Es la unidad base del Muro de Transparencia.
-- ------------------------------------------------------------
create table public.purchases (
  id uuid primary key default gen_random_uuid(),
  item_description text not null,           -- ej. "20 cajas de agua potable"
  category text,                            -- ej. 'alimentos', 'medicinas', 'agua', 'aseo', 'otros'
  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',
  shelter_name text not null,               -- refugio/destino de la compra
  purchase_date date not null default current_date,
  notes text,
  created_by text,                          -- nombre de quien registró (texto libre, sin FK a auth)
  created_at timestamptz not null default now()
);

comment on table public.purchases is 'Compras registradas manualmente por el equipo para los refugios.';


-- ------------------------------------------------------------
-- 3. TABLA: purchase_photos
--    Fotos asociadas a una compra: recibo, producto, entrega.
--    Una compra puede tener varias fotos (masonry grid).
-- ------------------------------------------------------------
create table public.purchase_photos (
  id uuid primary key default gen_random_uuid(),
  purchase_id uuid not null references public.purchases(id) on delete cascade,
  photo_url text not null,                  -- URL pública desde Supabase Storage
  photo_type text not null check (photo_type in ('receipt', 'product', 'delivery')),
  caption text,
  display_order int not null default 0,
  created_at timestamptz not null default now()
);

comment on table public.purchase_photos is 'Fotos (recibo, producto, entrega) ligadas a una compra, usadas en el Muro de Transparencia.';

create index idx_purchase_photos_purchase_id on public.purchase_photos(purchase_id);


-- ------------------------------------------------------------
-- 4. TABLA: donations
--    Donaciones directas: por pasarela (Stripe/PayPal, vía webhook)
--    o manuales (pago móvil / transferencia, confirmadas a mano).
-- ------------------------------------------------------------
create table public.donations (
  id uuid primary key default gen_random_uuid(),

  donor_name text,                          -- nullable: donante puede ser anónimo
  donor_email text,

  amount numeric(12,2) not null check (amount >= 0),
  currency text not null default 'USD',

  method text not null check (method in ('gateway', 'manual')),

  -- Campos específicos de pasarela (nulos si method = 'manual')
  gateway_provider text,                    -- ej. 'stripe', 'paypal'
  gateway_payment_id text,                  -- id de la transacción en el proveedor

  -- Campos específicos de confirmación manual (nulos si method = 'gateway')
  reference_note text,                      -- ej. últimos 4 dígitos, referencia de pago móvil
  proof_image_url text,                     -- comprobante subido por el donante o el equipo

  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'rejected')),

  confirmed_by text,                        -- nombre de quien confirmó manualmente (texto libre)
  confirmed_at timestamptz,

  created_at timestamptz not null default now()
);

comment on table public.donations is 'Donaciones directas, vía pasarela de pago o confirmación manual del equipo.';

-- Evita duplicar el mismo pago de pasarela si el webhook se reintenta
create unique index idx_donations_gateway_payment_id
  on public.donations(gateway_provider, gateway_payment_id)
  where gateway_payment_id is not null;

create index idx_donations_status on public.donations(status);


-- ------------------------------------------------------------
-- 5. VISTA PÚBLICA: public_donation_stats
--    Expone solo el agregado (total recaudado, nº de donantes),
--    nunca donantes individuales ni sus datos.
-- ------------------------------------------------------------
create view public.public_donation_stats as
select
  coalesce(sum(amount), 0)::numeric(12,2) as total_confirmed,
  count(*) as donor_count,
  max(confirmed_at) as last_updated
from public.donations
where status = 'confirmed';

comment on view public.public_donation_stats is 'Agregado público de donaciones confirmadas, sin exponer datos individuales de donantes.';


-- ------------------------------------------------------------
-- 6. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
-- Regla general: el backoffice escribe usando la service role key
-- desde Server Actions (bypassa RLS por diseño de Supabase).
-- RLS aquí controla exclusivamente lo que el navegador (anon key)
-- puede leer directamente desde el frente público.

alter table public.purchases enable row level security;
alter table public.purchase_photos enable row level security;
alter table public.donations enable row level security;

-- Muro de Transparencia: lectura pública de compras y fotos
create policy "Public can read purchases"
  on public.purchases
  for select
  to anon, authenticated
  using (true);

create policy "Public can read purchase photos"
  on public.purchase_photos
  for select
  to anon, authenticated
  using (true);

-- Donaciones: SIN lectura pública directa (privacidad del donante).
-- El público solo accede al agregado vía la vista public_donation_stats.
-- (No se crea ninguna policy de SELECT para anon/authenticated en 'donations',
-- por lo que con RLS habilitado queda denegado por defecto).

-- La vista hereda los privilegios de quien la consulta; se otorga
-- SELECT explícito sobre la vista al rol anónimo.
grant select on public.public_donation_stats to anon, authenticated;


-- ------------------------------------------------------------
-- 7. STORAGE — buckets (ejecutar en Storage > New bucket, o vía SQL)
-- ------------------------------------------------------------
-- Se recomienda crear dos buckets públicos desde el dashboard:
--   - "purchase-photos"  -> fotos de recibos/productos/entregas
--   - "payment-proofs"   -> comprobantes de pago móvil/transferencia
--
-- Si prefieres crearlos por SQL en lugar de la UI, este es el snippet
-- equivalente (ambos marcados como públicos para poder mostrar las
-- imágenes directamente en el Muro de Transparencia):

insert into storage.buckets (id, name, public)
values
  ('purchase-photos', 'purchase-photos', true),
  ('payment-proofs', 'payment-proofs', true)
on conflict (id) do nothing;