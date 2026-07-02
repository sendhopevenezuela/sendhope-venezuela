import { createAdminClient } from "@/lib/supabase/admin";
import { notFound } from "next/navigation";
import EditarCompraClient from "./EditarCompraClient";
import { getConfirmedDonations, getLinkedDonations } from "@/app/actions/purchases";

type Props = { params: Promise<{ id: string }> };

export default async function EditarCompraPage({ params }: Props) {
  const { id } = await params;
  const supabase = createAdminClient();

  const { data: purchase } = await supabase
    .from("purchases")
    .select(`
      id, item_description, category, amount, currency,
      shelter_name, purchase_date, notes,
      purchase_photos (id, photo_url, photo_type, caption)
    `)
    .eq("id", id)
    .single();

  if (!purchase) notFound();

  // Cargar donaciones confirmadas y vinculaciones existentes en paralelo
  const [allDonations, linkedIds] = await Promise.all([
    getConfirmedDonations(),
    getLinkedDonations(id),
  ]);

  return (
    <EditarCompraClient
      purchase={purchase}
      allDonations={allDonations}
      initialLinkedIds={linkedIds}
    />
  );
}
