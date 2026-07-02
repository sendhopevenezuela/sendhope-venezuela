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

export async function createPaymentMethod(formData: FormData): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const type  = formData.get("type")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const isActive = formData.get("is_active") !== "false";

  if (!type || !title) {
    return { error: "El tipo y el título son obligatorios." };
  }

  // Construir details según el tipo de método
  let details: Record<string, string> = {};

  if (type === "zelle") {
    const contact = formData.get("zelle_contact")?.toString().trim();
    const name    = formData.get("zelle_name")?.toString().trim();
    if (!contact || !name) return { error: "Completa el email y el titular de Zelle." };
    details = { contact, name };
  } else if (type === "pago_movil") {
    const phone  = formData.get("pago_movil_phone")?.toString().trim();
    const bank   = formData.get("pago_movil_bank")?.toString().trim();
    const cedula = formData.get("pago_movil_cedula")?.toString().trim();
    if (!phone || !bank || !cedula) return { error: "Completa el teléfono, banco y cédula para Pago Móvil." };
    details = { phone, bank, cedula };
  } else if (type === "transfer") {
    const bank    = formData.get("transfer_bank")?.toString().trim();
    const account = formData.get("transfer_account")?.toString().trim();
    const name    = formData.get("transfer_name")?.toString().trim() || "";
    const cedula  = formData.get("transfer_cedula")?.toString().trim() || "";
    if (!bank || !account) return { error: "Completa el banco y número de cuenta." };
    details = { bank, account, name, cedula };
  } else if (type === "paypal") {
    const contact = formData.get("paypal_email")?.toString().trim();
    const name    = formData.get("paypal_name")?.toString().trim();
    if (!contact || !name) return { error: "Completa el email y el titular de PayPal." };
    details = { contact, name };
  } else if (type === "otros") {
    const instructions = formData.get("otros_instructions")?.toString().trim();
    if (!instructions) return { error: "Por favor describe las instrucciones para el método Otros." };
    details = { instructions };
  } else {
    return { error: "Tipo de método de pago inválido." };
  }

  // Obtener el order_index más alto
  const { data: last } = await supabase
    .from("payment_methods")
    .select("order_index")
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();

  const order_index = (last?.order_index ?? 0) + 1;

  const { data, error } = await supabase
    .from("payment_methods")
    .insert({ type, title, details, order_index, is_active: isActive })
    .select("id")
    .single();

  if (error || !data) {
    return { error: `Error al crear método de pago: ${error?.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "created_payment_method",
    "payment_method",
    `Creó método de pago: ${title} (${type})`,
    data.id,
  );

  revalidatePath("/admin/pagos");
  revalidatePath("/donar");
  revalidatePath("/");
  return { success: true };
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updatePaymentMethod(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const type  = formData.get("type")?.toString().trim();
  const title = formData.get("title")?.toString().trim();
  const isActive = formData.get("is_active") !== "false";

  if (!type || !title) {
    return { error: "El tipo y el título son obligatorios." };
  }

  let details: Record<string, string> = {};

  if (type === "zelle") {
    const contact = formData.get("zelle_contact")?.toString().trim();
    const name    = formData.get("zelle_name")?.toString().trim();
    if (!contact || !name) return { error: "Completa el email y el titular de Zelle." };
    details = { contact, name };
  } else if (type === "pago_movil") {
    const phone  = formData.get("pago_movil_phone")?.toString().trim();
    const bank   = formData.get("pago_movil_bank")?.toString().trim();
    const cedula = formData.get("pago_movil_cedula")?.toString().trim();
    if (!phone || !bank || !cedula) return { error: "Completa el teléfono, banco y cédula para Pago Móvil." };
    details = { phone, bank, cedula };
  } else if (type === "transfer") {
    const bank    = formData.get("transfer_bank")?.toString().trim();
    const account = formData.get("transfer_account")?.toString().trim();
    const name    = formData.get("transfer_name")?.toString().trim() || "";
    const cedula  = formData.get("transfer_cedula")?.toString().trim() || "";
    if (!bank || !account) return { error: "Completa el banco y número de cuenta." };
    details = { bank, account, name, cedula };
  } else if (type === "paypal") {
    const contact = formData.get("paypal_email")?.toString().trim();
    const name    = formData.get("paypal_name")?.toString().trim();
    if (!contact || !name) return { error: "Completa el email y el titular de PayPal." };
    details = { contact, name };
  } else if (type === "otros") {
    const instructions = formData.get("otros_instructions")?.toString().trim();
    if (!instructions) return { error: "Por favor describe las instrucciones para el método Otros." };
    details = { instructions };
  }

  const { error } = await supabase
    .from("payment_methods")
    .update({ title, details, is_active: isActive, updated_at: new Date().toISOString() })
    .eq("id", id);

  if (error) {
    return { error: `Error al actualizar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "updated_payment_method",
    "payment_method",
    `Actualizó método de pago: ${title}`,
    id,
  );

  revalidatePath("/admin/pagos");
  revalidatePath("/donar");
  revalidatePath("/");
  return { success: true };
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deletePaymentMethod(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const { error } = await supabase.from("payment_methods").delete().eq("id", id);
  if (error) {
    return { error: `Error al eliminar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "deleted_payment_method",
    "payment_method",
    `Eliminó un método de pago (ID: ${id})`,
    id,
  );

  revalidatePath("/admin/pagos");
  revalidatePath("/donar");
  revalidatePath("/");
  return { success: true };
}

// ── TOGGLE STATUS ─────────────────────────────────────────────────────────────

export async function togglePaymentMethodStatus(
  id: string,
  isActive: boolean,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const { error } = await supabase
    .from("payment_methods")
    .update({ is_active: isActive })
    .eq("id", id);

  if (error) return { error: error.message };

  await logActivity(
    supabase,
    adminName,
    "toggle_payment_method",
    "payment_method",
    `Cambió estado de método de pago (ID: ${id}) a ${isActive ? "Activo" : "Inactivo"}`,
    id,
  );

  revalidatePath("/admin/pagos");
  revalidatePath("/donar");
  revalidatePath("/");
  return { success: true };
}
