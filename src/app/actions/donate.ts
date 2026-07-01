"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export type DonateResult =
  | { success: true; donationId: string }
  | { error: string };

export type DonateInput = {
  amount: number;
  paymentMethod: "zelle" | "pago_movil" | "transfer";
  referenceNote: string;
  donorName?: string;
  donorEmail?: string;
};

export async function createDonation(
  input: DonateInput
): Promise<DonateResult> {
  // Validación server-side (el cliente también valida, esto es la última línea de defensa)
  if (!input.amount || input.amount < 1) {
    return { error: "El monto mínimo es $1 USD." };
  }
  if (input.amount > 100_000) {
    return { error: "Monto fuera de rango. Contáctanos directamente." };
  }
  if (!input.referenceNote?.trim()) {
    return { error: "La referencia de pago es requerida." };
  }
  if (input.referenceNote.trim().length < 3) {
    return { error: "La referencia parece muy corta. Revísala." };
  }
  if (input.donorEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.donorEmail)) {
    return { error: "El email no es válido." };
  }

  const supabase = createAdminClient();

  const { data, error } = await supabase
    .from("donations")
    .insert({
      donor_name: input.donorName?.trim() || null,
      donor_email: input.donorEmail?.trim() || null,
      amount: input.amount,
      currency: "USD",
      method: "manual",
      gateway_provider: null,
      gateway_payment_id: null,
      // Guardamos también el método de pago elegido dentro de reference_note
      reference_note: `[${input.paymentMethod.toUpperCase()}] ${input.referenceNote.trim()}`,
      proof_image_url: null,
      status: "pending",
    })
    .select("id")
    .single();

  if (error || !data) {
    console.error("[donate action] Supabase error:", error);
    return { error: "No pudimos registrar tu donación. Intenta de nuevo." };
  }

  return { success: true, donationId: data.id };
}
