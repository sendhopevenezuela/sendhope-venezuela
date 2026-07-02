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
  const [photoToDelete, setPhotoToDelete] = useState<{ id: string; url: string } | null>(null);
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

  function handleDeleteConfirm() {
    if (!photoToDelete) return;
    setDeletingId(photoToDelete.id);
    startTransition(async () => {
      await deleteAction(photoToDelete.id, photoToDelete.url);
      setDeletingId(null);
      setPhotoToDelete(null);
    });
  }

  return (
    <>
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
              onClick={() => setPhotoToDelete({ id: photo.id, url: photo.photo_url })}
              disabled={deletingId === photo.id}
              className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white rounded-full p-1.5 text-[10px] opacity-0 group-hover:opacity-100 transition-all duration-200 disabled:opacity-60 shadow-md cursor-pointer"
              title="Eliminar foto"
            >
              ✕
            </button>
          </div>
        ))}
      </div>

      {/* Modal de Confirmación de Eliminación In-App */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 transition-all duration-200">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 border border-[#003082]/10 shadow-2xl flex flex-col gap-4 animate-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3 text-red-600">
              <span className="text-2xl">⚠️</span>
              <h3 className="font-sans font-bold text-lg text-[#0A1628]">¿Eliminar fotografía?</h3>
            </div>
            <p className="font-sans text-sm text-[#64748B] leading-relaxed">
              ¿Estás seguro de que deseas eliminar esta foto de la galería pública? Esta acción es irreversible y se eliminará por completo tanto de la base de datos como del almacenamiento.
            </p>
            <div className="flex gap-3 justify-end pt-2">
              <button
                type="button"
                onClick={() => setPhotoToDelete(null)}
                disabled={deletingId !== null}
                className="px-4 py-2 font-sans text-xs font-semibold text-[#64748B] border border-[#64748B]/20 rounded-lg hover:bg-[#64748B]/5 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleDeleteConfirm}
                disabled={deletingId !== null}
                className="flex items-center gap-1.5 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-sans text-xs font-semibold rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
              >
                {deletingId !== null ? (
                  <>
                    <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Eliminando...
                  </>
                ) : (
                  "Confirmar"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
