-- ============================================================
-- SendHope Venezuela — Migración 9
-- Configuración de Supabase Storage (Instrucciones)
-- ============================================================
-- 
-- IMPORTANT:
-- Debido a las recientes restricciones de seguridad en Supabase, el rol `postgres`
-- en el SQL Editor no tiene permisos para crear políticas directas sobre `storage.objects`
-- vía código, arrojando el error "must be owner of table objects".
--
-- Por lo tanto, las políticas de almacenamiento deben configurarse visualmente
-- desde el Supabase Dashboard en menos de 30 segundos:
--
-- ------------------------------------------------------------
-- INSTRUCCIONES PASO A PASO (En el Dashboard de Supabase):
-- ------------------------------------------------------------
--
-- 1. Ve a la sección de "Storage" en el menú lateral izquierdo de Supabase.
-- 2. Haz clic en "Policies" (debajo del menú de Storage).
-- 3. Verás tus buckets creados: "purchase-photos" y "payment-proofs".
--
-- 4. Para el bucket "purchase-photos" (Fotos del Muro):
--    - Haz clic en "New Policy" > "For full customization (ALL operations)".
--    - Ponle un nombre descriptivo (ej: "Permitir todo a admins y anónimos").
--    - En "Allowed Operations", selecciona las casillas: SELECT, INSERT, UPDATE, DELETE.
--    - En "Target roles", selecciona: anon, authenticated, service_role.
--    - En "Policy definition" (USING expression y WITH CHECK expression), escribe:
--      bucket_id = 'purchase-photos'
--    - Guarda la política.
--
-- 5. Para el bucket "payment-proofs" (Comprobantes de Donación):
--    - Haz clic en "New Policy" > "For full customization (ALL operations)".
--    - Ponle un nombre descriptivo (ej: "Permitir todo para comprobantes").
--    - En "Allowed Operations", selecciona las casillas: SELECT, INSERT, UPDATE, DELETE.
--    - En "Target roles", selecciona: anon, authenticated, service_role.
--    - En "Policy definition" (USING expression y WITH CHECK expression), escribe:
--      bucket_id = 'payment-proofs'
--    - Guarda la política.
--
-- ------------------------------------------------------------
-- Snippet de creación de buckets (este sí se puede ejecutar por SQL):
-- ------------------------------------------------------------
insert into storage.buckets (id, name, public)
values
  ('purchase-photos', 'purchase-photos', true),
  ('payment-proofs', 'payment-proofs', true)
on conflict (id) do update set public = true;
