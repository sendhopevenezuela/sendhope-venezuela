"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { uploadPaymentProof } from "@/lib/storage";

export type DonateResult =
  | { success: true; donationId: string; trackingCode: string }
  | { error: string };

/** Genera un tracking code único tipo "SH-4A7KP2" */
function generateTrackingCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // sin O/0/I/1 para evitar confusión
  let code = "SH-";
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/** Genera un tracking code único verificando colisiones en la BD */
async function getUniqueTrackingCode(supabase: ReturnType<typeof createAdminClient>): Promise<string> {
  for (let attempt = 0; attempt < 10; attempt++) {
    const code = generateTrackingCode();
    const { count } = await supabase
      .from("donations")
      .select("*", { count: "exact", head: true })
      .eq("tracking_code", code);
    if ((count ?? 0) === 0) return code;
  }
  // Fallback extremadamente improbable: usar UUID parcial
  return "SH-" + crypto.randomUUID().replace(/-/g, "").slice(0, 6).toUpperCase();
}

export async function createDonation(formData: FormData): Promise<DonateResult> {
  const amount        = parseFloat(formData.get("amount")?.toString() ?? "0");
  const paymentMethod = formData.get("paymentMethod")?.toString() ?? "";
  const referenceNote = formData.get("referenceNote")?.toString().trim() ?? "";
  const donorName     = formData.get("donorName")?.toString().trim() || undefined;
  const donorEmail    = formData.get("donorEmail")?.toString().trim() || undefined;
  const proofFile     = formData.get("proof_image") as File | null;

  // Validaciones server-side
  if (!amount || amount < 1 || isNaN(amount)) {
    return { error: "El monto mínimo es $1 USD." };
  }
  if (amount > 100_000) {
    return { error: "Monto fuera de rango. Contáctanos directamente." };
  }
  if (!referenceNote || referenceNote.length < 3) {
    return { error: "La referencia de pago es requerida (mínimo 3 caracteres)." };
  }
  if (donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(donorEmail)) {
    return { error: "El email no es válido." };
  }

  const supabase = createAdminClient();

  // Subir comprobante de pago (opcional)
  let proof_image_url: string | null = null;
  if (proofFile && proofFile.size > 0) {
    const tempId = crypto.randomUUID();
    const uploadResult = await uploadPaymentProof(proofFile, tempId);
    if ("error" in uploadResult) {
      console.warn("[donate] Proof upload failed:", uploadResult.error);
      // Seguimos sin el comprobante — no bloqueamos la donación
    } else {
      proof_image_url = uploadResult.url;
    }
  }

  // Generar tracking code único
  const trackingCode = await getUniqueTrackingCode(supabase);

  const { data, error } = await supabase
    .from("donations")
    .insert({
      donor_name: donorName?.trim() || null,
      donor_email: donorEmail?.trim() || null,
      amount,
      currency: "USD",
      method: "manual",
      gateway_provider: null,
      gateway_payment_id: null,
      reference_note: `[${paymentMethod.toUpperCase()}] ${referenceNote}`,
      proof_image_url,
      status: "pending",
      tracking_code: trackingCode,
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[donate action] Supabase error:", error);
    return { error: "No pudimos registrar tu donación. Intenta de nuevo." };
  }

  return { success: true, donationId: data.id, trackingCode };
}
