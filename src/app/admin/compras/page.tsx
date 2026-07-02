import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import { PurchaseTable } from "@/components/admin/PurchaseTable";
import { PurchaseKanban } from "@/components/admin/PurchaseKanban";
import { ViewToggle } from "@/components/admin/ViewToggle";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Compras — SendHope Admin",
};

export default async function ComprasPage() {
  const supabase = createAdminClient();

  const { data: purchases, error } = await supabase
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
      created_at,
      purchase_photos (
        id,
        photo_url,
        photo_type,
        caption
      )
    `)
    .order("purchase_date", { ascending: false });

  const items = purchases ?? [];

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Compras</h1>
          <p className="font-sans text-sm text-[#64748B] mt-1">
            Registro de todas las compras realizadas para los refugios.
          </p>
        </div>
        <Link
          href="/admin/compras/nueva"
          className="flex items-center gap-2 bg-[#003082] text-white font-sans font-medium text-sm px-4 py-2 rounded-lg hover:bg-[#0042A6] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Nueva Compra
        </Link>
      </div>

      {error && (
        <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans">
          Error al cargar compras: {error.message}
        </div>
      )}

      {/* Summary stat */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Total compras", value: items.length },
          { label: "Entregadas", value: items.filter((p) => p.purchase_photos.some((ph) => ph.photo_type === "delivery")).length },
          { label: "Coordinando", value: items.filter((p) => !p.purchase_photos.some((ph) => ph.photo_type === "delivery")).length },
          { label: "Gasto total (USD)", value: `$${items.filter((p) => p.currency === "USD").reduce((s, p) => s + Number(p.amount), 0).toLocaleString("es-VE", { minimumFractionDigits: 2 })}` },
        ].map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl border border-[#003082]/10 px-4 py-3">
            <p className="font-mono text-xs text-[#64748B] uppercase tracking-wide">{stat.label}</p>
            <p className="font-sans font-bold text-xl text-[#003082] mt-1">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* View toggle: Table + Kanban */}
      <ViewToggle
        defaultView="table"
        tableSlot={<PurchaseTable purchases={items} />}
        kanbanSlot={<PurchaseKanban purchases={items} />}
      />
    </div>
  );
}
