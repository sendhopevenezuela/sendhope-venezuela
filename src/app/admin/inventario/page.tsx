import type { Metadata } from "next";
import { createAdminClient } from "@/lib/supabase/admin";
import InventoryClient from "./InventoryClient";

export const metadata: Metadata = {
  title: "Inventario — SendHope Admin",
};

export default async function InventarioPage() {
  const supabase = createAdminClient();

  const { data: items, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name");

  const inventoryItems = (items ?? []) as {
    id: string;
    name: string;
    quantity: number;
    unit: string;
    notes: string | null;
    updated_at: string;
  }[];

  const totalProducts = inventoryItems.length;
  const outOfStock    = inventoryItems.filter((i) => Number(i.quantity) === 0).length;

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Inventario de Almacén</h1>
        <p className="font-sans text-sm text-[#64748B] mt-1">
          Lleva el control de todos los recursos y donaciones físicas en existencia.
        </p>
      </div>

      {error && (
        <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans">
          Error al cargar inventario: {error.message}
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Productos registrados", value: totalProducts },
          { label: "Sin existencias (Agotado)", value: outOfStock, highlight: outOfStock > 0 },
          { label: "Última actualización", value: totalProducts > 0 ? new Date(Math.max(...inventoryItems.map(i => new Date(i.updated_at).getTime()))).toLocaleDateString("es-VE") : "—" },
        ].map((stat) => (
          <div
            key={stat.label}
            className={`rounded-xl border px-4 py-3 bg-white border-[#003082]/10 ${
              stat.highlight ? "bg-[#FFF0F2] border-[#CE1126]/20" : ""
            }`}
          >
            <p className="font-mono text-xs text-[#64748B] uppercase tracking-wide">
              {stat.label}
            </p>
            <p
              className={`font-sans font-bold text-xl mt-1 ${
                stat.highlight ? "text-[#CE1126]" : "text-[#003082]"
              }`}
            >
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Client Table Manager */}
      <InventoryClient items={inventoryItems} />
    </div>
  );
}
