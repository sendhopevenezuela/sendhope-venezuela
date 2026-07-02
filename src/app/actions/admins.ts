"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: true } | { error: string };

async function getAdminInfo(): Promise<{ name: string; id: string | null }> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("sendhope_admin_session")?.value;
    if (!token) return { name: "Administrador", id: null };
    const supabase = createAdminClient();
    const { data } = await supabase
      .from("admin_sessions")
      .select("user_id, admin_users(username)")
      .eq("token", token)
      .single();
    // @ts-expect-error – join inference
    return { name: data?.admin_users?.username ?? "Administrador", id: data?.user_id ?? null };
  } catch {
    return { name: "Administrador", id: null };
  }
}

export async function deleteAdminUser(targetId: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { name: adminName, id: currentId } = await getAdminInfo();

  // Protección: no puede eliminarse a sí mismo
  if (currentId === targetId) {
    return { error: "No puedes eliminar tu propia cuenta de administrador." };
  }

  const { error } = await supabase
    .from("admin_users")
    .delete()
    .eq("id", targetId);

  if (error) {
    return { error: `Error al eliminar administrador: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "deleted_admin_user",
    "admin_user",
    `Eliminó una cuenta de administrador (ID: ${targetId})`,
    targetId,
  );

  revalidatePath("/admin/administradores");
  return { success: true };
}
