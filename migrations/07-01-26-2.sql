-- ============================================================
-- SendHope Venezuela — Migración 2
-- Tabla de configuración de métodos de pago
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLA: payment_config
--    Singleton (una sola fila garantizada por el constraint).
--    Contiene los datos de pago que se muestran en /donar.
--    El backoffice actualiza esta fila; el frente la lee vía anon key.
-- ------------------------------------------------------------
create table public.payment_config (
  id            int primary key default 1,
  -- Zelle
  zelle_contact text,           -- email o teléfono Zelle
  zelle_name    text,           -- nombre del titular de la cuenta
  -- Pago Móvil
  pago_movil_phone   text,      -- teléfono
  pago_movil_bank    text,      -- banco
  pago_movil_cedula  text,      -- RIF / cédula
  -- Transferencia bancaria
  transfer_bank      text,      -- nombre del banco
  transfer_account   text,      -- número de cuenta
  -- Meta
  updated_at    timestamptz not null default now(),
  -- Garantiza que jamás exista más de una fila
  constraint single_row check (id = 1)
);

comment on table public.payment_config is
  'Configuración singleton de métodos de pago mostrados en /donar. Actualizar desde el backoffice.';

-- ------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
--    Lectura pública (anon key) — son datos que cualquier donante
--    necesita ver.
--    Escritura solo vía service role (backoffice), sin policy de
--    INSERT/UPDATE para anon/authenticated.
-- ------------------------------------------------------------
alter table public.payment_config enable row level security;

create policy "Public can read payment config"
  on public.payment_config
  for select
  to anon, authenticated
  using (true);

-- Concede permisos explícitos de lectura a los roles anónimo y autenticado
grant select on public.payment_config to anon, authenticated;

-- ------------------------------------------------------------
-- 3. FILA INICIAL
--    Inserta la fila vacía para que la tabla exista y las queries
--    del frente no devuelvan null inesperado.
--    Reemplaza los valores null con tus datos reales desde el
--    backoffice o directamente aquí antes de correr la migración.
-- ------------------------------------------------------------
insert into public.payment_config (
  id,
  zelle_contact,
  zelle_name,
  pago_movil_phone,
  pago_movil_bank,
  pago_movil_cedula,
  transfer_bank,
  transfer_account
) values (
  1,
  null,   -- ej. 'info@sendhope.org' o '+1-555-555-5555'
  'SendHope Venezuela',
  null,   -- ej. '0412-555-5555'
  null,   -- ej. 'Banco de Venezuela'
  null,   -- ej. 'J-12345678-9'
  null,   -- ej. 'BBVA Provincial'
  null    -- ej. '0108-0000-00-0000000000'
)
on conflict (id) do nothing;
