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

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createInventoryItem(formData: FormData): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const name     = formData.get("name")?.toString().trim();
  const quantity = parseFloat(formData.get("quantity")?.toString() ?? "0");
  const unit     = formData.get("unit")?.toString().trim() || "unidades";
  const notes    = formData.get("notes")?.toString().trim() || null;

  if (!name || isNaN(quantity) || quantity < 0) {
    return { error: "El nombre y una cantidad válida (>= 0) son obligatorios." };
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({ name, quantity, unit, notes })
    .select("id")
    .single();

  if (error || !data) {
    return { error: `Error al crear artículo: ${error?.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "created_inventory_item",
    "inventory_item",
    `Agregó al inventario: ${quantity} ${unit} de "${name}"`,
    data.id,
  );

  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  return { success: true };
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updateInventoryItem(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const name     = formData.get("name")?.toString().trim();
  const quantity = parseFloat(formData.get("quantity")?.toString() ?? "0");
  const unit     = formData.get("unit")?.toString().trim() || "unidades";
  const notes    = formData.get("notes")?.toString().trim() || null;

  if (!name || isNaN(quantity) || quantity < 0) {
    return { error: "El nombre y una cantidad válida (>= 0) son obligatorios." };
  }

  const { error } = await supabase
    .from("inventory_items")
    .update({ name, quantity, unit, notes, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: `Error al actualizar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "updated_inventory_item",
    "inventory_item",
    `Actualizó artículo de inventario: "${name}" (${quantity} ${unit})`,
    id,
  );

  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  return { success: true };
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deleteInventoryItem(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const { error } = await supabase.from("inventory_items").delete().eq("id", id);
  if (error) {
    return { error: `Error al eliminar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "deleted_inventory_item",
    "inventory_item",
    `Eliminó artículo de inventario (ID: ${id})`,
    id,
  );

  revalidatePath("/admin/inventario");
  revalidatePath("/admin");
  return { success: true };
}
