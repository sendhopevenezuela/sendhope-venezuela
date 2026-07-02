-- ============================================================
-- SendHope Venezuela — Migración 3
-- Esquema para Autenticación Administrativa (Backoffice)
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Asegura que pgcrypto esté disponible para gen_random_uuid y crypt/gen_salt
create extension if not exists "pgcrypto";

-- ------------------------------------------------------------
-- 1. TABLA: admin_users
--    Usuarios administradores (acceso al backoffice).
--    Sin correo. Login vía username + password.
-- ------------------------------------------------------------
create table public.admin_users (
  id            uuid primary key default gen_random_uuid(),
  username      text unique not null,
  password_hash text not null,
  created_at    timestamptz not null default now()
);

comment on table public.admin_users is 'Usuarios administradores del panel de control.';

-- ------------------------------------------------------------
-- 2. TABLA: admin_sessions
--    Sesiones activas de administradores.
--    Almacena tokens de sesión únicos expuestos vía cookies seguras.
-- ------------------------------------------------------------
create table public.admin_sessions (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.admin_users(id) on delete cascade,
  token         text unique not null default encode(gen_random_bytes(32), 'hex'),
  expires_at    timestamptz not null,
  created_at    timestamptz not null default now()
);

comment on table public.admin_sessions is 'Sesiones activas de administradores (identificación por cookies).';

create index idx_admin_sessions_token on public.admin_sessions(token);
create index idx_admin_sessions_expires_at on public.admin_sessions(expires_at);

-- ------------------------------------------------------------
-- 3. SEGURIDAD (RLS)
--    Habilitamos RLS en ambas tablas.
--    NO se crean políticas SELECT/INSERT/UPDATE para anon ni authenticated.
--    Esto significa que el navegador (cliente) no puede acceder a estas
--    tablas directamente bajo ningún concepto.
--    Todo acceso se realiza desde el servidor mediante createAdminClient().
-- ------------------------------------------------------------
alter table public.admin_users enable row level security;
alter table public.admin_sessions enable row level security;

-- Concede privilegios completos a la service_role key para operar en el servidor
grant select, insert, update, delete on public.admin_users to service_role;
grant select, insert, update, delete on public.admin_sessions to service_role;

-- ------------------------------------------------------------
-- 4. FUNCIÓN RPC: verify_admin_password
--    Verifica si las credenciales de un administrador son correctas.
--    Al usar "security definer", corre con privilegios elevados para
--    poder consultar la tabla sin necesidad de políticas públicas de RLS.
-- ------------------------------------------------------------
create or replace function public.verify_admin_password(p_username text, p_password text)
returns table (user_id uuid, username text)
security definer
language plpgsql
as $$
begin
  return query
  select id, admin_users.username
  from public.admin_users
  where admin_users.username = p_username
    and admin_users.password_hash = crypt(p_password, admin_users.password_hash);
end;
$$;

-- Revocamos ejecución a PUBLIC y la concedemos a los roles necesarios
revoke execute on function public.verify_admin_password(text, text) from public;
grant execute on function public.verify_admin_password(text, text) to service_role, authenticated, anon;


-- ------------------------------------------------------------
-- 5. FUNCIÓN RPC: register_admin_user
--    Registra un nuevo administrador en la base de datos aplicando
--    hashing mediante pgcrypto.
--    security definer permite insertar registros saltándose RLS.
-- ------------------------------------------------------------
create or replace function public.register_admin_user(p_username text, p_password text)
returns uuid
security definer
language plpgsql
as $$
declare
  v_user_id uuid;
begin
  insert into public.admin_users (username, password_hash)
  values (p_username, crypt(p_password, gen_salt('bf')))
  returning id into v_user_id;
  
  return v_user_id;
end;
$$;

-- Revocamos ejecución a PUBLIC y la concedemos a los roles necesarios
revoke execute on function public.register_admin_user(text, text) from public;
grant execute on function public.register_admin_user(text, text) to service_role, authenticated, anon;



-- ------------------------------------------------------------
-- 4. REGISTRO DEL PRIMER ADMINISTRADOR (PLANTILLA)
--    Ejecuta el siguiente snippet reemplazando 'admin' y 'cambiame'
--    con tu usuario y contraseña reales para registrarte:
-- ------------------------------------------------------------
-- insert into public.admin_users (username, password_hash)
-- values (
--   'admin',
--   crypt('cambiame', gen_salt('bf'))
-- )
-- on conflict (username) do nothing;
