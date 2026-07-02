import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";

export const metadata: Metadata = { title: "Preview Muro — SendHope Admin" };

export default async function MuroPreviewPage() {
  const supabase = createAdminClient();

  const { data: purchases } = await supabase
    .from("purchases")
    .select(`
      id, item_description, category, amount, currency, shelter_name, purchase_date,
      purchase_photos (photo_url, photo_type, caption, display_order)
    `)
    .order("purchase_date", { ascending: false })
    .limit(20);

  const items = purchases ?? [];

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-6xl mx-auto">
      {/* Banner */}
      <div className="bg-[#FFFBEB] border border-[#F4C31D]/40 rounded-xl px-4 py-3 flex items-center gap-2">
        <span className="text-lg">👁</span>
        <p className="font-sans text-sm text-[#92400E]">
          <strong>Vista previa</strong> — Así verá el donante el Muro de Transparencia en el sitio público.
          Para añadir más entradas, ve a{" "}
          <a href="/admin/compras/nueva" className="underline underline-offset-2 font-medium">Compras → Nueva Compra</a>.
        </p>
      </div>

      <div>
        <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Preview: Muro de Transparencia</h1>
        <p className="font-sans text-sm text-[#64748B] mt-1">
          {items.length} compras publicadas · solo se muestran las últimas 20.
        </p>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16 text-[#64748B] text-sm font-sans border-2 border-dashed border-[#003082]/10 rounded-2xl">
          No hay compras registradas aún. Crea la primera desde{" "}
          <a href="/admin/compras/nueva" className="text-[#003082] underline">Nueva Compra</a>.
        </div>
      ) : (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
          {items.map((purchase) => {
            const hasDelivery = purchase.purchase_photos.some((p) => p.photo_type === "delivery");
            const mainPhoto = purchase.purchase_photos.find(
              (p) => p.photo_type === "delivery" || p.photo_type === "product" || p.photo_type === "receipt",
            );

            return (
              <div key={purchase.id} className="break-inside-avoid bg-white rounded-2xl border border-[#003082]/10 overflow-hidden shadow-sm">
                {mainPhoto ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={mainPhoto.photo_url}
                    alt={purchase.item_description}
                    className="w-full object-cover"
                  />
                ) : (
                  <div className="w-full h-32 bg-[#EEF4FF] flex items-center justify-center">
                    <span className="text-3xl opacity-30">🧾</span>
                  </div>
                )}
                <div className="p-4 flex flex-col gap-2">
                  <div className="flex items-center gap-2">
                    {hasDelivery ? (
                      <span className="text-[11px] font-mono bg-[#D1FAE5] text-[#047857] px-2 py-0.5 rounded-full">✓ Entregado</span>
                    ) : (
                      <span className="text-[11px] font-mono bg-[#FEF3C7] text-[#92400E] px-2 py-0.5 rounded-full">⟳ Coordinando entrega</span>
                    )}
                    {purchase.category && (
                      <span className="text-[11px] font-mono bg-[#EEF4FF] text-[#003082] px-2 py-0.5 rounded-full">{purchase.category}</span>
                    )}
                  </div>
                  <p className="font-sans font-semibold text-sm text-[#0A1628] leading-snug">
                    {purchase.item_description}
                  </p>
                  <p className="font-sans text-xs text-[#64748B]">{purchase.shelter_name}</p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="font-mono font-bold text-[#003082] text-sm">
                      {purchase.currency} {Number(purchase.amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                    </span>
                    <span className="font-mono text-[10px] text-[#64748B]">
                      {new Date(purchase.purchase_date).toLocaleDateString("es-VE")}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
