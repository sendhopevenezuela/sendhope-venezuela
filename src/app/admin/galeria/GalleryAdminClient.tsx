"use client";

import { useState, useTransition } from "react";

type Photo = {
  id: string;
  photo_url: string;
  caption: string | null;
  location: string | null;
  taken_at: string | null;
  display_order: number;
};

type Props = {
  photos: Photo[];
  deleteAction: (id: string, url: string) => Promise<{ success: true } | { error: string }>;
};

export default function GalleryAdminClient({ photos, deleteAction }: Props) {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  if (photos.length === 0) {
    return (
      <div className="text-center py-16 bg-white rounded-2xl border border-[#003082]/10">
        <span className="text-4xl block mb-3">📷</span>
        <p className="font-sans font-semibold text-[#0A1628]">Sin fotos en la galería</p>
        <p className="font-sans text-sm text-[#64748B] mt-1">Sube la primera foto usando el botón de arriba.</p>
      </div>
    );
  }

  function handleDelete(id: string, url: string) {
    if (!confirm("¿Eliminar esta foto de la galería? Esta acción no se puede deshacer.")) return;
    setDeletingId(id);
    startTransition(async () => {
      await deleteAction(id, url);
      setDeletingId(null);
    });
  }

  return (
    <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4">
      {photos.map((photo) => (
        <div key={photo.id} className="break-inside-avoid mb-4 rounded-2xl overflow-hidden border border-[#003082]/10 bg-white group relative hover:shadow-lg transition-shadow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photo.photo_url}
            alt={photo.caption ?? "Foto de galería"}
            className="w-full object-cover block"
            style={{ height: "auto" }}
            onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.3"; }}
          />
          <div className="p-3 flex flex-col gap-1">
            {photo.caption && <p className="font-sans text-xs text-[#0A1628] font-semibold leading-snug">{photo.caption}</p>}
            {photo.location && <p className="font-sans text-[10px] text-[#64748B] flex items-center gap-1">📍 {photo.location}</p>}
            {photo.taken_at && (
              <p className="font-mono text-[9px] text-[#64748B]">
                {new Date(photo.taken_at).toLocaleDateString("es-VE")}
              </p>
            )}
          </div>
          <button
            onClick={() => handleDelete(photo.id, photo.photo_url)}
            disabled={deletingId === photo.id}
            className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white rounded-full p-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-60 shadow-md"
            title="Eliminar foto"
          >
            {deletingId === photo.id ? "..." : "✕"}
          </button>
        </div>
      ))}
    </div>
  );
}
