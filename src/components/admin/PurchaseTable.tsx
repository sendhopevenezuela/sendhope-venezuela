"use client";

import { useState, useTransition } from "react";
import { deletePurchase } from "@/app/actions/purchases";
import Link from "next/link";

type Purchase = {
  id: string;
  item_description: string;
  category: string | null;
  amount: number;
  currency: string;
  shelter_name: string;
  purchase_date: string;
  notes: string | null;
  created_at: string;
  purchase_photos: { photo_type: string; photo_url: string }[];
};

type Props = {
  purchases: Purchase[];
};

const CATEGORIES = ["alimentos", "medicinas", "agua", "aseo", "otros"];

const CATEGORY_COLORS: Record<string, string> = {
  alimentos: "bg-green-100 text-green-800",
  medicinas: "bg-blue-100 text-blue-800",
  agua:      "bg-cyan-100 text-cyan-800",
  aseo:      "bg-purple-100 text-purple-800",
  otros:     "bg-gray-100 text-gray-700",
};

function DeliveryBadge({ photos }: { photos: { photo_type: string }[] }) {
  const hasDelivery = photos.some((p) => p.photo_type === "delivery");
  if (hasDelivery) {
    return (
      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#D1FAE5] text-[#047857]">
        ✓ Entregado
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-mono bg-[#FEF3C7] text-[#92400E]">
      ⟳ Coordinando
    </span>
  );
}

export function PurchaseTable({ purchases }: Props) {
  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const filtered = purchases.filter((p) => {
    const matchSearch =
      !search ||
      p.item_description.toLowerCase().includes(search.toLowerCase()) ||
      p.shelter_name.toLowerCase().includes(search.toLowerCase());
    const matchCategory =
      categoryFilter === "all" || p.category === categoryFilter;
    return matchSearch && matchCategory;
  });

  function handleDelete(id: string) {
    startTransition(async () => {
      await deletePurchase(id);
      setConfirmDelete(null);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <svg
            viewBox="0 0 20 20"
            fill="currentColor"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#64748B]/60"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          <input
            type="text"
            placeholder="Buscar por descripción o refugio..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-[#003082]/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
          />
        </div>
        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="px-3 py-2 text-sm font-sans border border-[#003082]/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
        >
          <option value="all">Todas las categorías</option>
          {CATEGORIES.map((c) => (
            <option key={c} value={c}>
              {c.charAt(0).toUpperCase() + c.slice(1)}
            </option>
          ))}
        </select>
      </div>

      {/* Count */}
      <p className="font-mono text-xs text-[#64748B]">
        {filtered.length} compra{filtered.length !== 1 ? "s" : ""}
      </p>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#003082]/10 bg-white">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-[#003082]/8 bg-[#EEF4FF]">
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Fecha</th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Descripción</th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide hidden sm:table-cell">Categoría</th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide hidden md:table-cell">Refugio</th>
              <th className="text-right px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Monto</th>
              <th className="text-center px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide hidden lg:table-cell">Entrega</th>
              <th className="text-center px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-12 text-[#64748B] text-sm">
                  No hay compras que coincidan con los filtros.
                </td>
              </tr>
            ) : (
              filtered.map((p, i) => (
                <tr
                  key={p.id}
                  className={`border-b border-[#003082]/5 hover:bg-[#EEF4FF]/50 transition-colors ${i % 2 === 0 ? "" : "bg-[#FEFBF6]"}`}
                >
                  <td className="px-4 py-3 text-[#64748B] whitespace-nowrap font-mono text-xs">
                    {new Date(p.purchase_date).toLocaleDateString("es-VE")}
                  </td>
                  <td className="px-4 py-3 text-[#0A1628] font-medium max-w-[200px] truncate">
                    {p.item_description}
                  </td>
                  <td className="px-4 py-3 hidden sm:table-cell">
                    {p.category ? (
                      <span className={`px-2 py-0.5 rounded-full text-xs font-mono ${CATEGORY_COLORS[p.category] ?? "bg-gray-100 text-gray-700"}`}>
                        {p.category}
                      </span>
                    ) : (
                      <span className="text-[#64748B]/50 text-xs">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-[#64748B] hidden md:table-cell text-xs max-w-[140px] truncate">
                    {p.shelter_name}
                  </td>
                  <td className="px-4 py-3 text-right font-mono font-bold text-[#003082] whitespace-nowrap">
                    {p.currency} {Number(p.amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
                  </td>
                  <td className="px-4 py-3 text-center hidden lg:table-cell">
                    <DeliveryBadge photos={p.purchase_photos} />
                  </td>
                  <td className="px-4 py-3 text-center">
                    {confirmDelete === p.id ? (
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleDelete(p.id)}
                          disabled={isPending}
                          className="text-[10px] font-mono bg-[#CE1126] text-white px-2 py-1 rounded hover:bg-[#a80d1f] transition-colors disabled:opacity-50"
                        >
                          {isPending ? "..." : "Confirmar"}
                        </button>
                        <button
                          onClick={() => setConfirmDelete(null)}
                          className="text-[10px] font-mono bg-[#64748B]/10 text-[#64748B] px-2 py-1 rounded hover:bg-[#64748B]/20 transition-colors"
                        >
                          Cancelar
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <Link
                          href={`/admin/compras/${p.id}/editar`}
                          className="text-[10px] font-mono bg-[#EEF4FF] text-[#003082] px-2 py-1 rounded hover:bg-[#003082] hover:text-white transition-colors"
                        >
                          Editar
                        </Link>
                        <button
                          onClick={() => setConfirmDelete(p.id)}
                          className="text-[10px] font-mono bg-[#FFF0F2] text-[#CE1126] px-2 py-1 rounded hover:bg-[#CE1126] hover:text-white transition-colors"
                        >
                          Eliminar
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
