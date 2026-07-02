-- ============================================================
-- SendHope Venezuela — Migración 8
-- Conversión automática VES → USD en tabla donations
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

alter table public.donations
  add column if not exists original_amount    numeric(12,2),
  add column if not exists original_currency  text,
  add column if not exists exchange_rate_used numeric(14,6);

comment on column public.donations.original_amount    is 'Monto en la moneda original antes de convertir a USD.';
comment on column public.donations.original_currency  is 'Moneda original de la donación (ej. VES).';
comment on column public.donations.exchange_rate_used is 'Tasa oficial VES/USD usada en el momento del registro.';
