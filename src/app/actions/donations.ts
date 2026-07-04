"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { uploadPaymentProof } from "@/lib/storage";
import { logActivity } from "@/lib/activity";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import { getOfficialExchangeRate, vesToUSD } from "@/lib/exchange-rate";

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

// ── CREATE MANUAL DONATION ───────────────────────────────────────────────────

export async function createManualDonation(
  formData: FormData,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const donor_name     = formData.get("donor_name")?.toString().trim() || null;
  const donor_email    = formData.get("donor_email")?.toString().trim() || null;
  const amount         = parseFloat(formData.get("amount")?.toString() ?? "0");
  const currency       = formData.get("currency")?.toString().trim() || "USD";
  const reference_note = formData.get("reference_note")?.toString().trim() || null;
  const payMethod      = formData.get("pay_method")?.toString().trim() || "Transferencia";

  if (isNaN(amount) || amount <= 0) {
    return { error: "El monto debe ser mayor a 0." };
  }

  // Subir comprobante si se adjuntó
  let proof_image_url: string | null = null;
  const proofFile = formData.get("proof_image") as File | null;
  if (proofFile && proofFile.size > 0) {
    const tempId = crypto.randomUUID();
    const result = await uploadPaymentProof(proofFile, tempId);
    if ("error" in result) {
      console.warn("[Donations] Proof upload failed:", result.error);
    } else {
      proof_image_url = result.url;
    }
  }

  // Conversión automática VES → USD
  let storedAmount      = amount;
  let storedCurrency    = currency;
  let originalAmount: number | null = null;
  let originalCurrency: string | null = null;
  let exchangeRateUsed: number | null = null;

  if (currency === "VES") {
    const rateData = await getOfficialExchangeRate();
    if (rateData) {
      originalAmount   = amount;
      originalCurrency = "VES";
      exchangeRateUsed = rateData.rate;
      storedAmount     = vesToUSD(amount, rateData.rate);
      storedCurrency   = "USD";
    }
  }

  const { data: donation, error } = await supabase
    .from("donations")
    .insert({
      donor_name,
      donor_email,
      amount: storedAmount,
      currency: storedCurrency,
      method: "manual",
      reference_note: `${payMethod}${reference_note ? ` — ${reference_note}` : ""}`,
      proof_image_url,
      status: "pending",
      original_amount: originalAmount,
      original_currency: originalCurrency,
      exchange_rate_used: exchangeRateUsed,
    })
    .select("id")
    .single();

  if (error || !donation) {
    return { error: `Error al registrar donación: ${error?.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "created_manual_donation",
    "donation",
    `Registró donación manual: ${donor_name ?? "Anónimo"} — $${storedAmount} USD${
      originalAmount ? ` (Original: Bs. ${originalAmount} a tasa ${exchangeRateUsed})` : ""
    }`,
    donation.id,
  );

  revalidatePath("/admin/donaciones");
  revalidatePath("/admin");
  return { success: true };
}

// ── CONFIRM DONATION ─────────────────────────────────────────────────────────

export async function confirmDonation(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const { data, error } = await supabase
    .from("donations")
    .update({
      status: "confirmed",
      confirmed_by: adminName,
      confirmed_at: new Date().toISOString(),
    })
    .eq("id", id)
    .select("donor_email, donor_name, amount, currency, tracking_code")
    .single();

  if (error || !data) {
    return { error: `Error al confirmar: ${error?.message ?? "No se encontró el registro"}` };
  }

  // Enviar correo de verificación asíncronamente si hay email registrado
  if (data.donor_email) {
    const { sendDonationVerifiedEmail } = require("@/lib/resend");
    sendDonationVerifiedEmail(
      data.donor_email.trim(),
      data.donor_name,
      data.tracking_code,
      Number(data.amount),
      data.currency || "USD"
    ).catch((err: any) => {
      console.error("[donations] Error sending confirmation email:", err);
    });
  }

  await logActivity(
    supabase,
    adminName,
    "confirmed_donation",
    "donation",
    `Confirmó una donación`,
    id,
  );

  revalidatePath("/admin/donaciones");
  revalidatePath("/admin");
  return { success: true };
}

// ── REJECT DONATION ──────────────────────────────────────────────────────────

export async function rejectDonation(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const { error } = await supabase
    .from("donations")
    .update({ status: "rejected" })
    .eq("id", id);

  if (error) {
    return { error: `Error al rechazar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "rejected_donation",
    "donation",
    `Rechazó una donación`,
    id,
  );

  revalidatePath("/admin/donaciones");
  return { success: true };
}

// ── DELETE DONATION ──────────────────────────────────────────────────────────

export async function deleteDonation(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const { error } = await supabase.from("donations").delete().eq("id", id);
  if (error) {
    return { error: `Error al eliminar: ${error.message}` };
  }

  await logActivity(
    supabase,
    adminName,
    "deleted_donation",
    "donation",
    `Eliminó un registro de donación (ID: ${id})`,
    id,
  );

  revalidatePath("/admin/donaciones");
  revalidatePath("/admin");
  return { success: true };
}

// ── SEARCH DONATION BY REFERENCE OR TRACKING CODE ────────────────────────────

export async function searchDonationByReference(query: string) {
  const cleanQuery = query.trim();
  if (cleanQuery.length < 3) {
    return { error: "Ingresa al menos 3 caracteres para buscar." };
  }

  const supabase = createAdminClient();

  // Buscar por tracking_code exacto primero (formato SH-XXXXXX)
  const isTrackingCode = /^SH-[A-Z0-9]{4,8}$/i.test(cleanQuery);

  let data = null;
  let error = null;

  if (isTrackingCode) {
    // Búsqueda exacta por tracking_code (no requiere status confirmed)
    const res = await supabase
      .from("donations")
      .select("id, donor_name, amount, currency, created_at, status, reference_note, tracking_code")
      .ilike("tracking_code", cleanQuery)
      .limit(1)
      .maybeSingle();
    data = res.data;
    error = res.error;
  } else {
    // Búsqueda fuzzy por referencia o nombre (solo confirmadas)
    const res = await supabase
      .from("donations")
      .select("id, donor_name, amount, currency, created_at, status, reference_note, tracking_code")
      .or(`reference_note.ilike.%${cleanQuery}%,donor_name.ilike.%${cleanQuery}%`)
      .eq("status", "confirmed")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    data = res.data;
    error = res.error;
  }

  if (error) {
    console.error("[Donations search] Supabase error:", error.message);
    return { error: "Error en el servidor al buscar tu donación." };
  }

  if (!data) {
    return { error: "No encontramos ninguna donación confirmada con esa referencia o código." };
  }

  // Si encontramos la donación, buscar compras vinculadas
  const { data: linkedPurchases } = await supabase
    .from("purchase_donations")
    .select("purchase_id, purchases(id, item_description, shelter_name, purchase_date, amount, currency)")
    .eq("donation_id", data.id);

  const purchases = (linkedPurchases ?? []).map((row) => {
    const raw = row.purchases;
    const p = Array.isArray(raw) ? raw[0] : raw;
    if (!p) return null;
    return {
      id: (p as any).id as string,
      item_description: (p as any).item_description as string,
      shelter_name: (p as any).shelter_name as string,
      purchase_date: (p as any).purchase_date as string,
      amount: (p as any).amount as number,
      currency: (p as any).currency as string,
    };
  }).filter((p): p is NonNullable<typeof p> => p !== null);

  return {
    donation: {
      id: data.id,
      donor_name: data.donor_name,
      amount: data.amount,
      currency: data.currency,
      created_at: data.created_at,
      tracking_code: data.tracking_code,
      status: data.status,
    },
    linkedPurchases: purchases,
  };
}

