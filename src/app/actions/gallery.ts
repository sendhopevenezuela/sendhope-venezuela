"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { uploadGalleryPhoto } from "@/lib/storage";
import { revalidatePath } from "next/cache";

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

  const { error } = await supabase.from("gallery_photos").insert({
    photo_url: uploadResult.url,
    caption,
    location,
    taken_at: taken_at || null,
    display_order: isNaN(display_order) ? 0 : display_order,
  });

  if (error) {
    return { error: `Error al guardar: ${error.message}` };
  }

  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
  return { success: true };
}

export async function deleteGalleryPhoto(id: string, photoUrl: string): Promise<GalleryActionResult> {
  const supabase = createAdminClient();

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

  const { error } = await supabase.from("gallery_photos").delete().eq("id", id);
  if (error) return { error: `Error al eliminar: ${error.message}` };

  revalidatePath("/galeria");
  revalidatePath("/admin/galeria");
  return { success: true };
}
