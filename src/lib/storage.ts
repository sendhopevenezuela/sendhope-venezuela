import { createAdminClient } from "@/lib/supabase/admin";

const PURCHASE_PHOTOS_BUCKET = "purchase-photos";
const PAYMENT_PROOFS_BUCKET = "payment-proofs";

/**
 * Sube una foto de compra a Supabase Storage.
 * Retorna la URL pública del archivo subido.
 */
export async function uploadPurchasePhoto(
  file: File,
  purchaseId: string,
  photoType: "receipt" | "product" | "delivery",
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createAdminClient();

  // Generar path único: {purchaseId}/{type}/{timestamp}-{filename}
  const timestamp = Date.now();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${purchaseId}/${photoType}/${timestamp}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(PURCHASE_PHOTOS_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    return { error: `Error al subir foto: ${error.message}` };
  }

  const { data: publicUrlData } = supabase.storage
    .from(PURCHASE_PHOTOS_BUCKET)
    .getPublicUrl(path);

  return { url: publicUrlData.publicUrl, path };
}

/**
 * Sube un comprobante de pago (donación manual) a Supabase Storage.
 */
export async function uploadPaymentProof(
  file: File,
  donationId: string,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createAdminClient();

  const timestamp = Date.now();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${donationId}/${timestamp}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    return { error: `Error al subir comprobante: ${error.message}` };
  }

  const { data: publicUrlData } = supabase.storage
    .from(PAYMENT_PROOFS_BUCKET)
    .getPublicUrl(path);

  return { url: publicUrlData.publicUrl, path };
}

/**
 * Elimina un archivo de Supabase Storage dado el bucket y el path.
 * El path se extrae de la URL pública (todo lo que viene después de /public/{bucket}/).
 */
export async function deleteStorageFile(
  bucket: "purchase-photos" | "payment-proofs",
  fileUrlOrPath: string,
): Promise<void> {
  const supabase = createAdminClient();

  // Si se recibe una URL completa, extraer solo el path
  let path = fileUrlOrPath;
  const marker = `/public/${bucket}/`;
  const idx = fileUrlOrPath.indexOf(marker);
  if (idx !== -1) {
    path = fileUrlOrPath.slice(idx + marker.length);
  }

  const { error } = await supabase.storage.from(bucket).remove([path]);
  if (error) {
    console.warn(`[Storage] Could not delete ${path}:`, error.message);
  }
}

/**
 * Sube una foto a la galería de labor del equipo.
 */
export async function uploadGalleryPhoto(
  file: File,
): Promise<{ url: string; path: string } | { error: string }> {
  const supabase = createAdminClient();

  const timestamp = Date.now();
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${timestamp}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);

  const { error } = await supabase.storage
    .from("gallery-photos")
    .upload(path, buffer, {
      contentType: file.type || "image/jpeg",
      upsert: false,
    });

  if (error) {
    return { error: `Error al subir foto de galería: ${error.message}` };
  }

  const { data: publicUrlData } = supabase.storage
    .from("gallery-photos")
    .getPublicUrl(path);

  return { url: publicUrlData.publicUrl, path };
}

