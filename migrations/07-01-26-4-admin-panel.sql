-- ============================================================
-- SendHope Venezuela — Migración 4
-- Panel de Administración: equipo y log de actividad
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLA: team_members
--    Miembros del equipo mostrados en la sección pública /equipo.
--    Administrados desde el backoffice.
-- ------------------------------------------------------------
create table if not exists public.team_members (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  role        text not null,
  initials    text not null,           -- ej. "IM" para Ignacio Mendoza
  bio         text,
  order_index int not null default 0,  -- controla el orden de aparición
  is_active   boolean not null default true,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

comment on table public.team_members is
  'Miembros del equipo SendHope Venezuela, gestionados desde el backoffice.';

create index if not exists idx_team_members_order
  on public.team_members(order_index)
  where is_active = true;

-- ------------------------------------------------------------
-- 2. TABLA: activity_log
--    Registro de acciones realizadas en el backoffice.
--    Proporciona trazabilidad sin depender de Supabase Auth.
-- ------------------------------------------------------------
create table if not exists public.activity_log (
  id          uuid primary key default gen_random_uuid(),
  admin_id    uuid references public.admin_users(id) on delete set null,
  admin_name  text not null,
  action      text not null,           -- ej. "created_purchase", "confirmed_donation"
  entity_type text not null,           -- ej. "purchase", "donation", "team_member"
  entity_id   uuid,                    -- nullable: algunas acciones no tienen entidad
  description text not null,           -- descripción legible para humanos
  created_at  timestamptz not null default now()
);

comment on table public.activity_log is
  'Log de actividad del backoffice: quién hizo qué y cuándo.';

create index if not exists idx_activity_log_created_at
  on public.activity_log(created_at desc);

create index if not exists idx_activity_log_admin_id
  on public.activity_log(admin_id);

-- ------------------------------------------------------------
-- 3. ROW LEVEL SECURITY
--    Ambas tablas se acceden exclusivamente desde el servidor.
--    La tabla team_members tiene lectura pública (anon) para
--    el frente público. activity_log es solo server-side.
-- ------------------------------------------------------------
alter table public.team_members enable row level security;
alter table public.activity_log  enable row level security;

-- team_members: lectura pública para el frente
create policy "Public can read active team members"
  on public.team_members
  for select
  to anon, authenticated
  using (is_active = true);

-- Grants explícitos para service_role (backoffice server-side)
grant select, insert, update, delete on public.team_members to service_role;
grant select, insert, update, delete on public.activity_log  to service_role;

-- Lectura pública de team_members
grant select on public.team_members to anon, authenticated;

-- ------------------------------------------------------------
-- 4. GRANTS ADICIONALES PARA TABLAS EXISTENTES
--    Por si no se ejecutó correctamente la migración 3,
--    garantizamos que service_role tenga acceso a purchases,
--    purchase_photos y donations también.
-- ------------------------------------------------------------
grant select, insert, update, delete on public.purchases        to service_role;
grant select, insert, update, delete on public.purchase_photos  to service_role;
grant select, insert, update, delete on public.donations        to service_role;
grant select, insert, update, delete on public.payment_config   to service_role;

-- ------------------------------------------------------------
-- 5. SEED: miembros del equipo (datos actuales de TeamSection.tsx)
--    Insertar solo si la tabla está vacía para evitar duplicados.
-- ------------------------------------------------------------
insert into public.team_members (name, role, initials, bio, order_index, is_active)
select name, role, initials, bio, order_index, true
from (values
  ('Ignacio Mendoza',  'Fundador · Coordinación general', 'IM', 'Barquisimeto, Lara. Organiza el equipo y mantiene el proyecto corriendo desde el primer día.', 1),
  ('María Fernández',  'Coordinadora de campo',           'MF', 'Se encarga del contacto directo con los refugios y de priorizar qué se compra cada día.', 2),
  ('Carlos Rondón',    'Logística y compras',             'CR', 'Va al mercado, negocia precios, trae el recibo y lo escanea antes de que anochezca.', 3),
  ('Valentina Herrera','Comunicaciones',                  'VH', 'Documenta cada entrega con foto y mantiene al público informado en redes.', 4),
  ('Roberto Pérez',    'Finanzas y transparencia',        'RP', 'Revisa cada número, cuadra los recibos y publica el estado de cuentas semanalmente.', 5),
  ('Ana González',     'Coordinadora de refugios',        'AG', 'Mantiene el mapa actualizado de refugios activos y coordina las entregas con sus líderes.', 6),
  ('David Castillo',   'Tecnología',                      'DC', 'Construye y mantiene la plataforma para que donantes y equipo siempre tengan información en tiempo real.', 7)
) as v(name, role, initials, bio, order_index)
where not exists (select 1 from public.team_members limit 1);
