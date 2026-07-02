"use client";

import { useState, useTransition } from "react";
import { createInventoryItem, updateInventoryItem } from "@/app/actions/inventory";

type InventoryItem = {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  notes: string | null;
};

const COMMON_UNITS = ["unidades", "cajas", "paquetes", "litros", "kg", "sacos", "cunas", "otros"];

export default function InventoryForm({
  item,
  onClose,
}: {
  item: InventoryItem | null;
  onClose: () => void;
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Permite al usuario seleccionar una unidad común o escribir una personalizada
  const [unitType, setUnitType] = useState(() => {
    if (!item) return "unidades";
    return COMMON_UNITS.includes(item.unit.toLowerCase()) ? item.unit.toLowerCase() : "custom";
  });
  const [customUnit, setCustomUnit] = useState(() => {
    if (!item) return "";
    return COMMON_UNITS.includes(item.unit.toLowerCase()) ? "" : item.unit;
  });

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    // Ajustar la unidad en el formData si es personalizada
    if (unitType === "custom") {
      formData.set("unit", customUnit.trim() || "unidades");
    } else {
      formData.set("unit", unitType);
    }

    startTransition(async () => {
      const result = item
        ? await updateInventoryItem(item.id, formData)
        : await createInventoryItem(formData);

      if ("error" in result) {
        setError(result.error);
      } else {
        onClose();
      }
    });
  }

  return (
    <div
      className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl border border-[#003082]/10 p-6 w-full max-w-md flex flex-col gap-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-sans font-bold text-lg text-[#0A1628]">
            {item ? "Editar Producto" : "Agregar Producto"}
          </h2>
          <button
            onClick={onClose}
            className="text-[#64748B] hover:text-[#0A1628] transition-colors"
          >
            ✕
          </button>
        </div>

        {error && (
          <div className="bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-3 py-2 text-xs">
            ⚠ {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* Nombre del producto */}
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
              Nombre del producto *
            </label>
            <input
              name="name"
              type="text"
              required
              defaultValue={item?.name}
              placeholder="ej. Cajas de agua, Pañales G..."
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>

          {/* Cantidad */}
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
              Cantidad *
            </label>
            <input
              name="quantity"
              type="number"
              required
              min="0"
              step="0.01"
              defaultValue={item?.quantity ?? "0"}
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30 font-mono"
            />
          </div>

          {/* Unidad */}
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
              Unidad física
            </label>
            <div className="flex gap-2">
              <select
                value={unitType}
                onChange={(e) => setUnitType(e.target.value)}
                className="flex-1 px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
              >
                {COMMON_UNITS.map((u) => (
                  <option key={u} value={u}>
                    {u.charAt(0).toUpperCase() + u.slice(1)}
                  </option>
                ))}
                <option value="custom">Personalizada...</option>
              </select>

              {unitType === "custom" && (
                <input
                  type="text"
                  placeholder="ej. bultos"
                  value={customUnit}
                  onChange={(e) => setCustomUnit(e.target.value)}
                  className="flex-1 px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
                />
              )}
            </div>
            <input type="hidden" name="unit" value={unitType === "custom" ? customUnit : unitType} />
          </div>

          {/* Notas */}
          <div>
            <label className="block font-sans text-sm font-medium text-[#0A1628] mb-1">
              Notas / Ubicación
            </label>
            <textarea
              name="notes"
              rows={2}
              defaultValue={item?.notes ?? ""}
              placeholder="ej. Pasillo A, donación de farmacia..."
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>

          {/* Acciones */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 font-sans text-sm text-[#64748B] border border-[#64748B]/20 rounded-lg hover:bg-[#64748B]/5 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 font-sans text-sm font-medium bg-[#003082] text-white rounded-lg hover:bg-[#0042A6] transition-colors disabled:opacity-60"
            >
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : item ? (
                "Guardar"
              ) : (
                "Agregar"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
