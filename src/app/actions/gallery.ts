"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { uploadGalleryPhoto } from "@/lib/storage";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { logActivity } from "@/lib/activity";

export type GalleryActionResult = { success: true } | { error: string };

type GalleryPhoto = {
  id: string;
  photo_url: string;
  caption: string | null;
  location: string | null;
  taken_at: string | null;
  display_order: number;
  created_at: string;
};

/** Lee el nombre del admin desde la sesión activa */
async function getAdminName(): Promise<string> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sendhope_admin_session")?.value;
    if (!token) return "Administrador";
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("admin_sessions")
      .select("admin_users(username)")
      .eq("token", token)
      .single();
    // @ts-expect-error – join inference
    return data?.admin_users?.username ?? "Administrador";
  } catch {
    return "Administrador";
  }
}

export async function getGalleryPhotos(): Promise<GalleryPhoto[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("gallery_photos")
    .select("*")
    .order("display_order", { ascending: true })
    .order("created_at", { ascending: false });
  return (data ?? []) as GalleryPhoto[];
}

export async function createGalleryPhoto(formData: FormData): Promise<GalleryActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();
  const file = formData.get("photo") as File | null;
  const caption = formData.get("caption")?.toString().trim() || null;
  const location = formData.get("location")?.toString().trim() || null;
  const taken_at = formData.get("taken_at")?.toString().trim() || null;
  const display_order = parseInt(formData.get("display_order")?.toString() ?? "0", 10);

  if (!file || file.size === 0) {
    return { error: "Debes adjuntar una foto." };
  }

  const uploadResult = await uploadGalleryPhoto(file);
  if ("error" in uploadResult) {
    return { error: uploadResult.error };
  }

  const { data: newPhoto, error } = await supabase
    .from("gallery_photos")
    .insert({
      photo_url: uploadResult.url,
      caption,
      location,
      taken_at: taken_at || null,
      display_order: isNaN(display_order) ? 0 : display_order,
    })
    .select("id")
    .single();

  if (error) {
    return { error: `Error al guardar: ${error.message}` };
  }

  // Registrar en el log de actividad
  await logActivity(
    supabase,
    adminName,
    "created_gallery_photo",
    "gallery_photo",
    `Subió foto a la galería${caption ? `: "${caption}"` : ""}${location ? ` en ${location}` : ""}`,
    newPhoto?.id || null
  );

  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
  return { success: true };
}

export async function deleteGalleryPhoto(id: string, photoUrl: string): Promise<GalleryActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  // Extraer path del bucket
  const marker = "/public/gallery-photos/";
  const idx = photoUrl.indexOf(marker);
  if (idx !== -1) {
    const path = photoUrl.slice(idx + marker.length);
    const { error: storageError } = await supabase.storage.from("gallery-photos").remove([path]);
    if (storageError) {
      console.warn("[Gallery] Storage delete error:", storageError.message);
    }
  }

  // Obtener caption para el log de actividad antes de eliminar
  const { data: photoData } = await supabase
    .from("gallery_photos")
    .select("caption")
    .eq("id", id)
    .maybeSingle();

  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) return { error: `Error al eliminar: ${error.message}` };

  // Registrar en el log de actividad
  await logActivity(
    supabase,
    adminName,
    "deleted_gallery_photo",
    "gallery_photo",
    `Eliminó foto de la galería${photoData?.caption ? `: "${photoData.caption}"` : ""}`,
    id
  );

  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
  return { success: true };
}

export async function createGalleryPhotosBulk(formData: FormData): Promise<GalleryActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();
  const files = formData.getAll("photos") as File[];
  const caption = formData.get("caption")?.toString().trim() || null;
  const location = formData.get("location")?.toString().trim() || null;
  const taken_at = formData.get("taken_at")?.toString().trim() || null;
  const display_order_start = parseInt(formData.get("display_order")?.toString() ?? "0", 10);

  if (!files || files.length === 0 || (files.length === 1 && files[0].size === 0)) {
    return { error: "Debes adjuntar al menos una foto." };
  }

  const uploadedRows = [];

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    if (file.size === 0) continue;

    const uploadResult = await uploadGalleryPhoto(file);
    if ("error" in uploadResult) {
      return { error: `Error subiendo la foto ${file.name}: ${uploadResult.error}` };
    }

    uploadedRows.push({
      photo_url: uploadResult.url,
      caption: caption,
      location,
      taken_at: taken_at || null,
      display_order: isNaN(display_order_start) ? 0 : display_order_start + i,
    });
  }

  if (uploadedRows.length > 0) {
    const { error } = await supabase.from("gallery_photos").insert(uploadedRows);
    if (error) {
      return { error: `Error al guardar fotos en la base de datos: ${error.message}` };
    }

    // Registrar en el log de actividad
    await logActivity(
      supabase,
      adminName,
      "created_gallery_photo",
      "gallery_photo",
      `Subió ${uploadedRows.length} fotos a la galería (Álbum)${location ? ` en ${location}` : ""}`
    );
  }

  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
  return { success: true };
}

