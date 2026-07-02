"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: true } | { error: string };

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

function computeInitials(name: string): string {
  return name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase();
}

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createTeamMember(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const name      = formData.get("name")?.toString().trim();
  const role      = formData.get("role")?.toString().trim();
  const bio       = formData.get("bio")?.toString().trim() || null;
  const initials  = formData.get("initials")?.toString().trim() || computeInitials(name ?? "");
  const is_active = formData.get("is_active") !== "false";

  if (!name || !role) {
    return { error: "Nombre y rol son obligatorios." };
  }

  // Obtener el order_index más alto actual
  const { data: last } = await supabase
    .from("team_members")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const order_index = (last?.order_index ?? 0) + 1;

  const { data, error } = await supabase
    .from("team_members")
    .insert({ name, role, initials, bio, order_index, is_active })
    .select("id")
    .single();

  if (error || !data) {
    return { error: `Error al crear miembro: ${error?.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "created_team_member",
    "team_member",
    `Agregó al equipo: ${name} (${role})`,
    data.id,
  );

  revalidatePath("/admin/equipo");
  revalidatePath("/");
  return { success: true };
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateTeamMember(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const name      = formData.get("name")?.toString().trim();
  const role      = formData.get("role")?.toString().trim();
  const bio       = formData.get("bio")?.toString().trim() || null;
  const initials  = formData.get("initials")?.toString().trim() || computeInitials(name ?? "");
  const is_active = formData.get("is_active") !== "false";

  if (!name || !role) {
    return { error: "Nombre y rol son obligatorios." };
  }

  const { error } = await supabase
    .from("team_members")
    .update({ name, role, initials, bio, is_active, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: `Error al actualizar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "updated_team_member",
    "team_member",
    `Actualizó miembro del equipo: ${name}`,
    id,
  );

  revalidatePath("/admin/equipo");
  revalidatePath("/");
  return { success: true };
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteTeamMember(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const { error } = await supabase.from("team_members").delete().eq("id", id);
  if (error) {
    return { error: `Error al eliminar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "deleted_team_member",
    "team_member",
    `Eliminó un miembro del equipo (ID: ${id})`,
    id,
  );

  revalidatePath("/admin/equipo");
  revalidatePath("/");
  return { success: true };
}
