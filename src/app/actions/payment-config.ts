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

export async function updatePaymentConfig(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const payload = {
    id: 1,
    zelle_contact:     formData.get("zelle_contact")?.toString().trim() || null,
    zelle_name:        formData.get("zelle_name")?.toString().trim() || null,
    pago_movil_phone:  formData.get("pago_movil_phone")?.toString().trim() || null,
    pago_movil_bank:   formData.get("pago_movil_bank")?.toString().trim() || null,
    pago_movil_cedula: formData.get("pago_movil_cedula")?.toString().trim() || null,
    transfer_bank:     formData.get("transfer_bank")?.toString().trim() || null,
    transfer_account:  formData.get("transfer_account")?.toString().trim() || null,
    updated_at:        new Date().toISOString(),
  };

  const { error } = await supabase
    .from("payment_config")
    .upsert(payload, { onConflict: "id" });

  if (error) {
    return { error: `Error al guardar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "updated_payment_config",
    "payment_config",
    "Actualizó los datos de métodos de pago",
    null,
  );

  revalidatePath("/admin/pagos");
  revalidatePath("/donar");
  return { success: true };
}
