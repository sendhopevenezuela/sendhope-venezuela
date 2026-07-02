-- ============================================================
-- SendHope Venezuela — Migración 5
-- Conversión automática VES → USD en tabla purchases
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Añade columnas para guardar el monto original (antes de convertir)
-- y la tasa usada en el momento del registro.
-- La columna `amount` existente siempre contendrá el equivalente en USD.

alter table public.purchases
  add column if not exists original_amount   numeric(12,2),
  add column if not exists original_currency text,
  add column if not exists exchange_rate_used numeric(14,6);

comment on column public.purchases.original_amount    is 'Monto en la moneda original antes de convertir a USD.';
comment on column public.purchases.original_currency  is 'Moneda original de la compra (ej. VES).';
comment on column public.purchases.exchange_rate_used is 'Tasa oficial VES/USD usada en el momento del registro.';
