"use client";

import { useState, useTransition, useEffect } from "react";
import { deleteInventoryItem } from "@/app/actions/inventory";
import InventoryForm from "@/components/admin/InventoryForm";

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string | null;
  updated_at: string;
};

export default function InventoryClient({ items }: { items: InventoryItem[] }) {
  const [search, setSearch] = useState("");
  const [editingItem, setEditingItem] = useState<InventoryItem | null | "new">(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Filtrado en vivo
  const filtered = items.filter((item) =>
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  function handleDelete(id: string) {
    startTransition(async () => {
      await deleteInventoryItem(id);
      setConfirmDeleteId(null);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Add Action */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
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
            placeholder="Buscar en el almacén por nombre..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm font-sans border border-[#003082]/15 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
          />
        </div>

        <button
          onClick={() => setEditingItem("new")}
          className="flex items-center justify-center gap-2 bg-[#003082] text-white font-sans font-medium text-sm px-4 py-2 rounded-lg hover:bg-[#0042A6] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
              clipRule="evenodd"
            />
          </svg>
          Agregar Producto
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-[#003082]/10 bg-white">
        <table className="w-full text-sm font-sans">
          <thead>
            <tr className="border-b border-[#003082]/8 bg-[#EEF4FF]">
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">
                Producto
              </th>
              <th className="text-right px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">
                Cantidad
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide hidden sm:table-cell">
                Unidad
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide hidden md:table-cell">
                Ubicación / Notas
              </th>
              <th className="text-left px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide hidden lg:table-cell">
                Última actualización
              </th>
              <th className="text-center px-4 py-3 font-medium text-[#0A1628] text-xs uppercase tracking-wide">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-[#64748B] text-sm">
                  {search ? "No se encontraron productos coincidentes." : "El inventario está vacío."}
                </td>
              </tr>
            ) : (
              filtered.map((item, i) => {
                const isOutOfStock = Number(item.quantity) === 0;
                return (
                  <tr
                    key={item.id}
                    className={`border-b border-[#003082]/5 hover:bg-[#EEF4FF]/50 transition-colors ${
                      i % 2 === 0 ? "" : "bg-[#FEFBF6]"
                    }`}
                  >
                    {/* Nombre */}
                    <td className="px-4 py-3">
                      <p className="font-semibold text-[#0A1628]">{item.name}</p>
                    </td>

                    {/* Cantidad */}
                    <td className="px-4 py-3 text-right">
                      <span
                        className={`font-mono font-bold text-sm px-2 py-0.5 rounded ${
                          isOutOfStock
                            ? "bg-[#FFF0F2] text-[#CE1126]"
                            : "text-[#003082]"
                        }`}
                      >
                        {Number(item.quantity).toLocaleString("es-VE", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </td>

                    {/* Unidad */}
                    <td className="px-4 py-3 text-[#64748B] hidden sm:table-cell font-mono text-xs">
                      {item.unit}
                    </td>

                    {/* Notas */}
                    <td className="px-4 py-3 text-[#64748B] hidden md:table-cell max-w-[200px] truncate">
                      {item.notes ?? <span className="opacity-30">—</span>}
                    </td>

                    {/* Actualizado */}
                    <td className="px-4 py-3 text-xs text-[#64748B] hidden lg:table-cell font-mono">
                      {mounted ? new Date(item.updated_at).toLocaleString("es-VE") : "—"}
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-1">
                        {confirmDeleteId === item.id ? (
                          <>
                            <button
                              onClick={() => handleDelete(item.id)}
                              disabled={isPending}
                              className="text-[10px] font-mono bg-[#CE1126] text-white px-2 py-1 rounded disabled:opacity-50"
                            >
                              {isPending ? "..." : "Sí"}
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(null)}
                              className="text-[10px] font-mono bg-gray-100 text-gray-600 px-2 py-1 rounded"
                            >
                              No
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => setEditingItem(item)}
                              className="text-[10px] font-mono bg-[#EEF4FF] text-[#003082] px-2 py-1 rounded hover:bg-[#003082] hover:text-white transition-colors"
                            >
                              Editar
                            </button>
                            <button
                              onClick={() => setConfirmDeleteId(item.id)}
                              className="text-[10px] font-mono bg-[#FFF0F2] text-[#CE1126] px-2 py-1 rounded hover:bg-[#CE1126] hover:text-white transition-colors"
                            >
                              Eliminar
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Form */}
      {editingItem !== null && (
        <InventoryForm
          item={editingItem === "new" ? null : editingItem}
          onClose={() => setEditingItem(null)}
        />
      )}
    </div>
  );
}
