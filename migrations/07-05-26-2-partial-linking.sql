-- ============================================================
-- SendHope Venezuela — Migración 12
-- Sistema de Vinculación Parcial Compras ↔ Donaciones
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- Agregar columna de monto asignado a la tabla de relación
ALTER TABLE public.purchase_donations 
  ADD COLUMN IF NOT EXISTS amount_allocated numeric(12,2) NOT NULL DEFAULT 0.00;

COMMENT ON COLUMN public.purchase_donations.amount_allocated IS 
  'Monto de la donación en USD asignado para financiar esta compra específica.';
