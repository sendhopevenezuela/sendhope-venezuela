-- ============================================================
-- SendHope Venezuela — Migración 7
-- Añadir tipos paypal y otros a los métodos de pago
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Dropear la constraint check anterior si existe
alter table public.payment_methods 
  drop constraint if exists payment_methods_type_check;

-- Añadir la nueva constraint check que incluye paypal y otros
alter table public.payment_methods
  add constraint payment_methods_type_check 
  check (type in ('zelle', 'pago_movil', 'transfer', 'paypal', 'otros'));
