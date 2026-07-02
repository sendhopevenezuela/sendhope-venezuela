"use client";

import { useRouter } from "next/navigation";
import { useTransition, useState } from "react";
import { updatePurchase } from "@/app/actions/purchases";
import { PhotoUploader } from "@/components/admin/PhotoUploader";

const CATEGORIES = ["alimentos", "medicinas", "agua", "aseo", "otros"];
const CURRENCIES = ["USD", "VES", "EUR"];

type Photo = { id: string; photo_url: string; photo_type: "receipt" | "product" | "delivery"; caption: string | null };
type Purchase = {
  id: string;
  item_description: string;
  category: string | null;
  amount: number;
  currency: string;
  shelter_name: string;
  purchase_date: string;
  notes: string | null;
  purchase_photos: Photo[];
};

export default function EditarCompraClient({ purchase }: { purchase: Purchase }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const photosOf = (type: "receipt" | "product" | "delivery") =>
    purchase.purchase_photos.filter((p) => p.photo_type === type);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await updatePurchase(purchase.id, formData);
      if ("error" in result) {
        setError(result.error);
      } else {
        router.push("/admin/compras");
      }
    });
  }

  return (
    <div className="p-6 md:p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-1.5 text-sm font-sans text-[#64748B] hover:text-[#003082] transition-colors mb-4"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
          </svg>
          Volver a compras
        </button>
        <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Editar Compra</h1>
      </div>

      {error && (
        <div className="mb-6 bg-[#FFF0F2] border border-[#CE1126]/20 text-[#CE1126] rounded-xl px-4 py-3 text-sm font-sans">
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div className="bg-white rounded-2xl border border-[#003082]/10 p-6 flex flex-col gap-5">
          <div>
            <label htmlFor="item_description" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">
              Descripción <span className="text-[#CE1126]">*</span>
            </label>
            <input
              id="item_description"
              name="item_description"
              type="text"
              required
              defaultValue={purchase.item_description}
              className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30"
            />
          </div>
          <div>
            <label htmlFor="category" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Categoría</label>
            <select id="category" name="category" defaultValue={purchase.category ?? ""} className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30">
              <option value="">Sin categoría</option>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="amount" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Monto <span className="text-[#CE1126]">*</span></label>
              <input id="amount" name="amount" type="number" required min="0" step="0.01" defaultValue={purchase.amount} className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30" />
            </div>
            <div>
              <label htmlFor="currency" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Moneda</label>
              <select id="currency" name="currency" defaultValue={purchase.currency} className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30">
                {CURRENCIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label htmlFor="shelter_name" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Refugio destino <span className="text-[#CE1126]">*</span></label>
              <input id="shelter_name" name="shelter_name" type="text" required defaultValue={purchase.shelter_name} className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30" />
            </div>
            <div>
              <label htmlFor="purchase_date" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Fecha <span className="text-[#CE1126]">*</span></label>
              <input id="purchase_date" name="purchase_date" type="date" required defaultValue={purchase.purchase_date} className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/30" />
            </div>
          </div>
          <div>
            <label htmlFor="notes" className="block font-sans text-sm font-medium text-[#0A1628] mb-1.5">Notas</label>
            <textarea id="notes" name="notes" rows={2} defaultValue={purchase.notes ?? ""} className="w-full px-3 py-2 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white resize-none focus:outline-none focus:ring-2 focus:ring-[#003082]/30" />
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-[#003082]/10 p-6 flex flex-col gap-5">
          <h2 className="font-sans font-semibold text-base text-[#0A1628]">Fotos</h2>
          <PhotoUploader type="receipt" label="Recibo" existingPhotos={photosOf("receipt")} />
          <PhotoUploader type="product" label="Producto" existingPhotos={photosOf("product")} />
          <PhotoUploader type="delivery" label="Entrega al refugio" existingPhotos={photosOf("delivery")} />
        </div>

        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => router.back()} className="px-5 py-2.5 font-sans text-sm font-medium text-[#64748B] border border-[#64748B]/20 rounded-lg hover:bg-[#64748B]/5 transition-colors">
            Cancelar
          </button>
          <button type="submit" disabled={isPending} className="flex items-center gap-2 px-5 py-2.5 font-sans text-sm font-medium bg-[#003082] text-white rounded-lg hover:bg-[#0042A6] transition-colors disabled:opacity-60">
            {isPending ? <><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Guardando...</> : "Guardar cambios"}
          </button>
        </div>
      </form>
    </div>
  );
}
