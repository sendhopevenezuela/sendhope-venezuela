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
  purchase_photos: { photo_type: string; photo_url: string }[];
};

type Column = {
  id: string;
  title: string;
  color: string;
  bg: string;
  filter: (p: Purchase) => boolean;
};

const COLUMNS: Column[] = [
  {
    id: "purchased",
    title: "Comprado",
    color: "border-[#003082]",
    bg: "bg-[#EEF4FF]",
    filter: (p) => {
      const hasDelivery = p.purchase_photos.some((ph) => ph.photo_type === "delivery");
      const hasProduct  = p.purchase_photos.some((ph) => ph.photo_type === "product" || ph.photo_type === "receipt");
      return hasProduct && !hasDelivery;
    },
  },
  {
    id: "coordinating",
    title: "Pendiente",
    color: "border-[#F4C31D]",
    bg: "bg-[#FFFBEB]",
    filter: (p) => {
      const hasDelivery = p.purchase_photos.some((ph) => ph.photo_type === "delivery");
      const hasAny      = p.purchase_photos.length > 0;
      return !hasDelivery && !hasAny;
    },
  },
  {
    id: "delivered",
    title: "Entregado",
    color: "border-[#059669]",
    bg: "bg-[#D1FAE5]/30",
    filter: (p) => p.purchase_photos.some((ph) => ph.photo_type === "delivery"),
  },
];

function PurchaseCard({
  purchase,
  onDelete,
  isDeleting,
}: {
  purchase: Purchase;
  onDelete: (id: string) => void;
  isDeleting: boolean;
}) {
  const [confirm, setConfirm] = useState(false);
  const thumb = purchase.purchase_photos.find(
    (p) => p.photo_type === "receipt" || p.photo_type === "product",
  );

  return (
    <div className="bg-white rounded-xl border border-[#003082]/10 p-3.5 flex flex-col gap-2 shadow-sm hover:shadow-md transition-shadow">
      {thumb && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={thumb.photo_url}
          alt="thumb"
          className="w-full h-24 object-cover rounded-lg"
        />
      )}
      <div>
        <p className="font-sans font-semibold text-sm text-[#0A1628] leading-tight">
          {purchase.item_description}
        </p>
        <p className="font-mono text-[11px] text-[#64748B] mt-0.5">
          {purchase.shelter_name}
        </p>
      </div>
      <p className="font-mono font-bold text-[#003082] text-sm">
        {purchase.currency} {Number(purchase.amount).toLocaleString("es-VE", { minimumFractionDigits: 2 })}
      </p>

      {/* Actions */}
      {confirm ? (
        <div className="flex gap-1 mt-1">
          <button
            onClick={() => onDelete(purchase.id)}
            disabled={isDeleting}
            className="flex-1 text-[10px] font-mono bg-[#CE1126] text-white py-1 rounded hover:bg-[#a80d1f] transition-colors disabled:opacity-50"
          >
            {isDeleting ? "..." : "Confirmar"}
          </button>
          <button
            onClick={() => setConfirm(false)}
            className="flex-1 text-[10px] font-mono bg-[#64748B]/10 text-[#64748B] py-1 rounded"
          >
            Cancelar
          </button>
        </div>
      ) : (
        <div className="flex gap-1 mt-1">
          <Link
            href={`/admin/compras/${purchase.id}/editar`}
            className="flex-1 text-center text-[10px] font-mono bg-[#EEF4FF] text-[#003082] py-1 rounded hover:bg-[#003082] hover:text-white transition-colors"
          >
            Editar
          </Link>
          <button
            onClick={() => setConfirm(true)}
            className="flex-1 text-[10px] font-mono bg-[#FFF0F2] text-[#CE1126] py-1 rounded hover:bg-[#CE1126] hover:text-white transition-colors"
          >
            Eliminar
          </button>
        </div>
      )}
    </div>
  );
}

export function PurchaseKanban({ purchases }: { purchases: Purchase[] }) {
  const [isPending, startTransition] = useTransition();
  const [deletingId, setDeletingId] = useState<string | null>(null);

  function handleDelete(id: string) {
    setDeletingId(id);
    startTransition(async () => {
      await deletePurchase(id);
      setDeletingId(null);
    });
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {COLUMNS.map((col) => {
        const items = purchases.filter(col.filter);
        return (
          <div key={col.id} className="flex flex-col gap-3">
            {/* Column header */}
            <div className={`flex items-center justify-between px-3 py-2 rounded-lg border-l-4 ${col.color} ${col.bg}`}>
              <span className="font-sans font-semibold text-sm text-[#0A1628]">
                {col.title}
              </span>
              <span className="font-mono text-xs text-[#64748B] bg-white/60 px-1.5 py-0.5 rounded-full">
                {items.length}
              </span>
            </div>

            {/* Cards */}
            <div className="flex flex-col gap-2 min-h-[100px]">
              {items.length === 0 ? (
                <div className="text-center py-8 text-[#64748B]/50 text-xs font-mono border-2 border-dashed border-[#003082]/10 rounded-xl">
                  Sin compras
                </div>
              ) : (
                items.map((purchase) => (
                  <PurchaseCard
                    key={purchase.id}
                    purchase={purchase}
                    onDelete={handleDelete}
                    isDeleting={isPending && deletingId === purchase.id}
                  />
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
