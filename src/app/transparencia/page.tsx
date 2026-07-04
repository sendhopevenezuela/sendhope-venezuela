import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { TransparencyClient } from "./TransparencyClient";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("transparency");
  return {
    title: `${t("title")} — SendHope Venezuela`,
    description: t("description"),
  };
}

export default async function TransparenciaPage() {
  const supabase = createAdminClient();

  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      id,
      item_description,
      category,
      amount,
      currency,
      shelter_name,
      purchase_date,
      notes,
      original_amount,
      original_currency,
      exchange_rate_used,
      purchase_photos (
        id,
        photo_url,
        photo_type
      )
    `)
    .order("purchase_date", { ascending: false });

  // Mapeamos los datos de Supabase asegurando compatibilidad de tipos
  const formattedPurchases = (purchases ?? []).map((p) => ({
    id: p.id,
    item_description: p.item_description,
    category: p.category,
    amount: Number(p.amount),
    currency: p.currency,
    shelter_name: p.shelter_name,
    purchase_date: p.purchase_date,
    notes: p.notes,
    original_amount: p.original_amount ? Number(p.original_amount) : null,
    original_currency: p.original_currency,
    exchange_rate_used: p.exchange_rate_used ? Number(p.exchange_rate_used) : null,
    purchase_photos: (p.purchase_photos ?? []).map((photo) => ({
      id: photo.id,
      photo_url: photo.photo_url,
      photo_type: photo.photo_type as "receipt" | "product" | "delivery",
    })),
  }));

  return (
    <>
      <Header />
      <TransparencyClient initialPurchases={formattedPurchases} />
      <Footer />
    </>
  );
}
