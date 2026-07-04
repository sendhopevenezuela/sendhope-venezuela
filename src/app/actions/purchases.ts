"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { uploadPurchasePhoto, deleteStorageFile } from "@/lib/storage";
import { logActivity } from "@/lib/activity";
import { getOfficialExchangeRate, vesToUSD } from "@/lib/exchange-rate";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";

export type ActionResult = { success: true } | { error: string };

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

// ── CREATE ────────────────────────────────────────────────────────────────────

export async function createPurchase(formData: FormData): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const item_description = formData.get("item_description")?.toString().trim();
  const category         = formData.get("category")?.toString().trim() || null;
  const amount           = parseFloat(formData.get("amount")?.toString() ?? "0");
  const currency         = formData.get("currency")?.toString().trim() || "USD";
  const shelter_name     = formData.get("shelter_name")?.toString().trim();
  const purchase_date    = formData.get("purchase_date")?.toString().trim();
  const notes            = formData.get("notes")?.toString().trim() || null;

  if (!item_description || !shelter_name || !purchase_date || isNaN(amount) || amount < 0) {
    return { error: "Por favor, completa todos los campos obligatorios." };
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
    // Si falla la API, se guarda en VES tal cual (degradación graceful)
  }

  const { data: purchase, error: purchaseError } = await supabase
    .from("purchases")
    .insert({
      item_description, category,
      amount: storedAmount, currency: storedCurrency,
      shelter_name, purchase_date, notes,
      created_by: adminName,
      original_amount: originalAmount,
      original_currency: originalCurrency,
      exchange_rate_used: exchangeRateUsed,
    })
    .select("id")
    .single();

  if (purchaseError || !purchase) {
    return { error: `Error al registrar compra: ${purchaseError?.message}` };
  }

  // Subir fotos (múltiples por tipo)
  const photoTypes = ["receipt", "product", "delivery"] as const;
  for (const type of photoTypes) {
    const files = formData.getAll(`photos_${type}`) as File[];
    for (const file of files) {
      if (!file || file.size === 0) continue;
      const result = await uploadPurchasePhoto(file, purchase.id, type);
      if ("error" in result) {
        console.warn("[Purchases] Photo upload failed:", result.error);
        continue;
      }
      await supabase.from("purchase_photos").insert({
        purchase_id: purchase.id,
        photo_url: result.url,
        photo_type: type,
      });
    }
  }

  await logActivity(
    supabase,
    adminName,
    "created_purchase",
    "purchase",
    `Registró compra: ${item_description} — $${amount} ${currency}`,
    purchase.id,
  );

  revalidatePath("/admin/compras");
  revalidatePath("/admin");
  return { success: true };
}

// ── UPDATE ────────────────────────────────────────────────────────────────────

export async function updatePurchase(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const item_description = formData.get("item_description")?.toString().trim();
  const category         = formData.get("category")?.toString().trim() || null;
  const amount           = parseFloat(formData.get("amount")?.toString() ?? "0");
  const currency         = formData.get("currency")?.toString().trim() || "USD";
  const shelter_name     = formData.get("shelter_name")?.toString().trim();
  const purchase_date    = formData.get("purchase_date")?.toString().trim();
  const notes            = formData.get("notes")?.toString().trim() || null;

  if (!item_description || !shelter_name || !purchase_date || isNaN(amount)) {
    return { error: "Por favor, completa todos los campos obligatorios." };
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

  const { error } = await supabase
    .from("purchases")
    .update({
      item_description, category,
      amount: storedAmount, currency: storedCurrency,
      shelter_name, purchase_date, notes,
      original_amount: originalAmount,
      original_currency: originalCurrency,
      exchange_rate_used: exchangeRateUsed,
    })
    .eq("id", id);

  if (error) {
    return { error: `Error al actualizar: ${error.message}` };
  }

  // Subir fotos nuevas si las hay
  const photoTypes = ["receipt", "product", "delivery"] as const;
  for (const type of photoTypes) {
    const files = formData.getAll(`photos_${type}`) as File[];
    for (const file of files) {
      if (!file || file.size === 0) continue;
      const result = await uploadPurchasePhoto(file, id, type);
      if ("error" in result) continue;
      await supabase.from("purchase_photos").insert({
        purchase_id: id,
        photo_url: result.url,
        photo_type: type,
      });
    }
  }

  await logActivity(
    supabase,
    adminName,
    "updated_purchase",
    "purchase",
    `Actualizó compra: ${item_description}`,
    id,
  );

  revalidatePath("/admin/compras");
  revalidatePath(`/admin/compras/${id}/editar`);
  return { success: true };
}

// ── DELETE ────────────────────────────────────────────────────────────────────

export async function deletePurchase(id: string): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  // Recuperar fotos para borrar de Storage también
  const { data: photos } = await supabase
    .from("purchase_photos")
    .select("photo_url")
    .eq("purchase_id", id);

  const { error } = await supabase.from("purchases").delete().eq("id", id);
  if (error) {
    return { error: `Error al eliminar: ${error.message}` };
  }

  // Borrar archivos de Storage (best-effort)
  if (photos) {
    for (const photo of photos) {
      await deleteStorageFile("purchase-photos", photo.photo_url);
    }
  }

  await logActivity(
    supabase,
    adminName,
    "deleted_purchase",
    "purchase",
    `Eliminó una compra (ID: ${id})`,
    id,
  );

  revalidatePath("/admin/compras");
  revalidatePath("/admin");
  return { success: true };
}

// ── DELETE PHOTO ─────────────────────────────────────────────────────────────

export async function deletePurchasePhoto(
  photoId: string,
  photoUrl: string,
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  const { error } = await supabase
    .from("purchase_photos")
    .delete()
    .eq("id", photoId);

  if (error) {
    return { error: `Error al eliminar foto: ${error.message}` };
  }

  await deleteStorageFile("purchase-photos", photoUrl);

  await logActivity(
    supabase,
    adminName,
    "deleted_purchase_photo",
    "purchase_photo",
    `Eliminó una foto de compra`,
    photoId,
  );

  revalidatePath("/admin/compras");
  return { success: true };
}

// ── UPDATE DELIVERY STATUS ────────────────────────────────────────────────────

export async function updatePurchaseDeliveryStatus(
  purchaseId: string,
  status: "coordinating" | "delivered",
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  // Guardamos el estado de entrega en el campo notes por ahora,
  // pero idealmente sería un campo dedicado. Por claridad,
  // lo manejamos con una columna virtual de la UI basada en
  // si existe foto tipo 'delivery'.
  // Esta action actualiza el campo `notes` con un marcador especial.
  const notesMarker = status === "delivered" ? null : "__coordinating__";
  const { error } = await supabase
    .from("purchases")
    .update({ notes: notesMarker })
    .eq("id", purchaseId);

  if (error) return { error: error.message };

  await logActivity(
    supabase,
    adminName,
    "updated_delivery_status",
    "purchase",
    `Cambió estado de entrega a: ${status === "delivered" ? "Entregado" : "Pendiente"}`,
    purchaseId,
  );

  revalidatePath("/admin/compras");
  return { success: true };
}

// ── LINK / UNLINK DONATIONS TO A PURCHASE ────────────────────────────────────

/** Devuelve las donaciones confirmadas disponibles para vincular a una compra */
export async function getConfirmedDonations(): Promise<{
  id: string;
  donor_name: string | null;
  amount: number;
  currency: string;
  reference_note: string | null;
  tracking_code: string | null;
  created_at: string;
  purchase_donations: {
    purchase_id: string;
    amount_allocated: number;
  }[];
}[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("donations")
    .select(`
      id, donor_name, amount, currency, reference_note, tracking_code, created_at,
      purchase_donations (
        purchase_id,
        amount_allocated
      )
    `)
    .eq("status", "confirmed")
    .order("created_at", { ascending: false });

  return (data ?? []) as any;
}

/** Devuelve los IDs de donaciones actualmente vinculadas a una compra */
export async function getLinkedDonations(purchaseId: string): Promise<string[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("purchase_donations")
    .select("donation_id")
    .eq("purchase_id", purchaseId);
  return (data ?? []).map((r) => r.donation_id);
}

/** Reemplaza las vinculaciones de donaciones para una compra calculando asignaciones parciales */
export async function setLinkedDonations(
  purchaseId: string,
  donationIds: string[],
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const adminName = await getAdminName();

  // 1. Obtener la compra para saber su costo en USD y sus metadatos
  const { data: purchaseData, error: purchaseError } = await supabase
    .from("purchases")
    .select("amount, item_description, shelter_name")
    .eq("id", purchaseId)
    .single();

  if (purchaseError || !purchaseData) {
    return { error: `No se encontró la compra: ${purchaseError?.message ?? "Error"}` };
  }

  const purchaseCost = Number(purchaseData.amount);

  // Limpiar vinculaciones existentes para esta compra
  const { error: deleteError } = await supabase
    .from("purchase_donations")
    .delete()
    .eq("purchase_id", purchaseId);

  if (deleteError) return { error: `Error al limpiar vinculaciones: ${deleteError.message}` };

  if (donationIds.length > 0) {
    // 2. Obtener los detalles de las donaciones seleccionadas junto con sus vinculaciones y datos de contacto
    const { data: selectedDonations, error: donationsError } = await supabase
      .from("donations")
      .select(`
        id,
        amount,
        donor_name,
        donor_email,
        tracking_code,
        purchase_donations (
          purchase_id,
          amount_allocated
        )
      `)
      .in("id", donationIds);

    if (donationsError || !selectedDonations) {
      return { error: `Error al obtener detalles de donaciones: ${donationsError?.message ?? "Error"}` };
    }

    // Ordenar de acuerdo al orden original de los IDs recibidos
    const sortedDonations = [...selectedDonations].sort(
      (a, b) => donationIds.indexOf(a.id) - donationIds.indexOf(b.id)
    );

    let remainingNeeded = purchaseCost;
    const rowsToInsert = [];

    for (const donation of sortedDonations) {
      const allocations = donation.purchase_donations ?? [];
      // Sumar lo asignado a OTRAS compras
      const allocatedToOthers = allocations
        .filter((alloc: any) => alloc.purchase_id !== purchaseId)
        .reduce((sum: number, alloc: any) => sum + Number(alloc.amount_allocated), 0);

      const available = Math.max(0, Number(donation.amount) - allocatedToOthers);
      const allocatedHere = Math.min(available, remainingNeeded);

      rowsToInsert.push({
        purchase_id: purchaseId,
        donation_id: donation.id,
        amount_allocated: Number(allocatedHere.toFixed(2)),
        linked_by: adminName,
      });

      remainingNeeded -= allocatedHere;
    }

    // Insertar nuevas relaciones con montos asignados
    const { error: insertError } = await supabase
      .from("purchase_donations")
      .insert(rowsToInsert);

    if (insertError) return { error: `Error al vincular donaciones: ${insertError.message}` };

    // Enviar correos de asignación a donaciones que recibieron saldo (y tienen email registrado)
    const { sendDonationAllocatedEmail } = require("@/lib/resend");
    for (const row of rowsToInsert) {
      if (row.amount_allocated > 0) {
        const don = sortedDonations.find((d) => d.id === row.donation_id);
        if (don && don.donor_email) {
          sendDonationAllocatedEmail(
            don.donor_email.trim(),
            don.donor_name,
            don.tracking_code || "",
            row.amount_allocated,
            purchaseData.item_description,
            purchaseData.shelter_name
          ).catch((err: any) => {
            console.error("[purchases] Error sending allocation email:", err);
          });
        }
      }
    }
  }

  await logActivity(
    supabase,
    adminName,
    "linked_donations",
    "purchase",
    `Vinculó ${donationIds.length} donación(es) a la compra ${purchaseId}`,
    purchaseId,
  );

  revalidatePath(`/admin/compras/${purchaseId}/editar`);
  return { success: true };
}

