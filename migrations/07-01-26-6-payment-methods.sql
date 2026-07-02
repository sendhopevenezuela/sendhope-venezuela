-- ============================================================
-- SendHope Venezuela — Migración 6
-- Métodos de Pago Dinámicos & Módulo de Inventario
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLA: payment_methods
-- ------------------------------------------------------------
create table if not exists public.payment_methods (
  id          uuid primary key default gen_random_uuid(),
  type        text not null check (type in ('zelle', 'pago_movil', 'transfer', 'paypal', 'otros')),
  title       text not null,
  details     jsonb not null,
  order_index int not null default 0,
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.payment_methods is 'Métodos de pago dinámicos para el frente público.';

-- ------------------------------------------------------------
-- 2. TABLA: inventory_items
-- ------------------------------------------------------------
create table if not exists public.inventory_items (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  quantity    numeric(10,2) not null default 0 check (quantity >= 0),
  unit        text not null default 'unidades',
  notes       text,
  updated_at  timestamptz not null default now(),
  created_at  timestamptz not null default now()
);

comment on table public.inventory_items is 'Inventario de insumos y recursos en almacén.';

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY (RLS)
-- ------------------------------------------------------------
alter table public.payment_methods enable row level security;
alter table public.inventory_items enable row level security;

-- Lectura pública para métodos de pago activos
create policy "Public can read active payment methods"
  on public.payment_methods
  for select
  to anon, authenticated
  using (is_active = true);

-- El inventario es sólo administrativo (no se definen políticas SELECT públicas,
-- por ende queda denegado para anon y authenticated por defecto).

-- ------------------------------------------------------------
-- 4. GRANTS
-- ------------------------------------------------------------
grant select on public.payment_methods to anon, authenticated;
grant select, insert, update, delete on public.payment_methods to service_role;
grant select, insert, update, delete on public.inventory_items to service_role;

-- ------------------------------------------------------------
-- 5. MIGRACIÓN DE DATOS (De payment_config a payment_methods)
-- ------------------------------------------------------------
-- Migrar Zelle
insert into public.payment_methods (type, title, details, order_index, is_active)
select
  'zelle' as type,
  'Zelle Principal' as title,
  jsonb_build_object('contact', zelle_contact, 'name', zelle_name) as details,
  1 as order_index,
  true as is_active
from public.payment_config
where id = 1 and zelle_contact is not null and zelle_contact <> ''
on conflict do nothing;

-- Migrar Pago Móvil
insert into public.payment_methods (type, title, details, order_index, is_active)
select
  'pago_movil' as type,
  'Pago Móvil' as title,
  jsonb_build_object('phone', pago_movil_phone, 'bank', pago_movil_bank, 'cedula', pago_movil_cedula) as details,
  2 as order_index,
  true as is_active
from public.payment_config
where id = 1 and pago_movil_phone is not null and pago_movil_phone <> ''
on conflict do nothing;

-- Migrar Transferencia
insert into public.payment_methods (type, title, details, order_index, is_active)
select
  'transfer' as type,
  'Transferencia Bancaria' as title,
  jsonb_build_object('bank', transfer_bank, 'account', transfer_account) as details,
  3 as order_index,
  true as is_active
from public.payment_config
where id = 1 and transfer_bank is not null and transfer_bank <> ''
on conflict do nothing;

-- ------------------------------------------------------------
-- 6. SEMILLAS (SEED) DE RESPALDO (si la tabla sigue vacía)
-- ------------------------------------------------------------
insert into public.payment_methods (type, title, details, order_index, is_active)
select 'zelle', 'Zelle Oficial', '{"contact": "donaciones@sendhope.org", "name": "SendHope Venezuela"}'::jsonb, 1, true
where not exists (select 1 from public.payment_methods);

insert into public.payment_methods (type, title, details, order_index, is_active)
select 'pago_movil', 'Pago Móvil Banesco', '{"phone": "0412-123-4567", "bank": "Banco de Venezuela", "cedula": "J-12345678-9"}'::jsonb, 2, true
where not exists (select 1 from public.payment_methods where type = 'pago_movil');

insert into public.payment_methods (type, title, details, order_index, is_active)
select 'transfer', 'Banesco Corriente', '{"bank": "Banesco", "account": "0134-1234-56-1234567890"}'::jsonb, 3, true
where not exists (select 1 from public.payment_methods where type = 'transfer');
