-- ============================================================
-- SendHope Venezuela — Migración 10
-- Sistema de Credencial de Rastreo para Donantes
-- + Tabla de vinculación Compras ↔ Donaciones
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Columna tracking_code en donations
ALTER TABLE public.donations
  ADD COLUMN IF NOT EXISTS tracking_code text;

-- Índice único para búsqueda rápida
CREATE UNIQUE INDEX IF NOT EXISTS idx_donations_tracking_code
  ON public.donations(tracking_code)
  WHERE tracking_code IS NOT NULL;

-- 2. Tabla de relación M:N Compras ↔ Donaciones
--    Una compra puede tener varias donaciones vinculadas.
--    Una donación puede vincularse a una compra.
--    No se expone públicamente en el muro — solo para resolución de tracking_code.
CREATE TABLE IF NOT EXISTS public.purchase_donations (
  purchase_id uuid NOT NULL REFERENCES public.purchases(id) ON DELETE CASCADE,
  donation_id uuid NOT NULL REFERENCES public.donations(id) ON DELETE CASCADE,
  linked_by   text,
  linked_at   timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (purchase_id, donation_id)
);

COMMENT ON TABLE public.purchase_donations IS
  'Relación M:N entre compras y donaciones. Permite al admin vincular qué donaciones financiaron qué compra.';

CREATE INDEX IF NOT EXISTS idx_purchase_donations_donation_id
  ON public.purchase_donations(donation_id);

CREATE INDEX IF NOT EXISTS idx_purchase_donations_purchase_id
  ON public.purchase_donations(purchase_id);

-- 3. RLS en purchase_donations
--    Solo acceso desde server (service_role). Sin lectura pública.
ALTER TABLE public.purchase_donations ENABLE ROW LEVEL SECURITY;

GRANT SELECT, INSERT, UPDATE, DELETE ON public.purchase_donations TO service_role;

-- 4. Función helper para generar tracking codes únicos (SH-XXXXXX)
--    Úsala opcionalmente desde el SQL editor para actualizar donaciones existentes:
--    UPDATE public.donations SET tracking_code = 'SH-' || upper(substring(encode(gen_random_bytes(4), 'hex'), 1, 6)) WHERE tracking_code IS NULL;
