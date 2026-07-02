-- ============================================================
-- SendHope Venezuela — Migración 11
-- Galería de Labor del Equipo (página pública /galeria)
-- Pegar manualmente en: Supabase Dashboard > SQL Editor > New query
-- ============================================================

-- 1. Tabla gallery_photos
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  photo_url     text NOT NULL,
  caption       text,
  location      text,                         -- ej. "Refugio San Judas, Barquisimeto"
  taken_at      date,                         -- fecha real de la foto
  display_order int  NOT NULL DEFAULT 0,      -- control de orden
  created_at    timestamptz NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.gallery_photos IS
  'Fotos documentales de la labor del equipo SendHope, independientes del Muro de Transparencia.';

CREATE INDEX IF NOT EXISTS idx_gallery_photos_order
  ON public.gallery_photos(display_order, created_at DESC);

-- 2. RLS
ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

-- Lectura pública
CREATE POLICY "Lectura pública de galería"
  ON public.gallery_photos FOR SELECT
  TO anon, authenticated
  USING (true);

-- Escritura solo desde service_role (backoffice server-side)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.gallery_photos TO service_role;
GRANT SELECT ON public.gallery_photos TO anon, authenticated;

-- 3. Bucket gallery-photos (público, separado del bucket de compras)
--    Ejecuta primero este INSERT, y luego configura las Storage Policies
--    visualmente en Supabase Dashboard > Storage > Policies
--    (siguiendo el mismo procedimiento que los otros buckets)
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery-photos', 'gallery-photos', true)
ON CONFLICT (id) DO UPDATE SET public = true;
