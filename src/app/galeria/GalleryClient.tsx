"use client";

import { useState } from "react";

type GalleryPhoto = {
  id: string;
  photo_url: string;
  caption: string | null;
  location: string | null;
  taken_at: string | null;
};

const PLACEHOLDER_SVG = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"><rect width="400" height="300" fill="#EEF4FF"/><text x="50%" y="50%" font-family="sans-serif" font-size="40" text-anchor="middle" fill="#003082" opacity="0.3">📷</text></svg>')}`;

export function GalleryClient({ photos }: { photos: GalleryPhoto[] }) {
  const [lightbox, setLightbox] = useState<{ photos: GalleryPhoto[]; index: number } | null>(null);

  if (photos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-4 text-center">
        <span className="text-6xl">📷</span>
        <p className="font-sans font-semibold text-navy text-lg">La galería está por comenzar</p>
        <p className="font-sans text-muted text-sm max-w-sm">
          Pronto nuestro equipo publicará fotos documentando nuestra labor de campo. ¡Vuelve pronto!
        </p>
      </div>
    );
  }

  const current = lightbox ? lightbox.photos[lightbox.index] : null;

  return (
    <>
      {/* Pinterest Masonry Grid */}
      <div
        className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-4"
        style={{ columnGap: "16px" }}
      >
        {photos.map((photo, idx) => (
          <PinterestCard
            key={photo.id}
            photo={photo}
            onClick={() => setLightbox({ photos, index: idx })}
          />
        ))}
      </div>

      {/* Lightbox */}
      {lightbox && current && (
        <div
          className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4"
          onClick={() => setLightbox(null)}
        >
          <div
            className="relative max-w-4xl w-full flex flex-col items-center gap-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Imagen */}
            <div className="relative w-full max-h-[75vh] flex items-center justify-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={current.photo_url}
                alt={current.caption ?? "Foto de galería"}
                className="max-w-full max-h-[75vh] object-contain rounded-2xl shadow-2xl border border-white/10"
                onError={(e) => { (e.target as HTMLImageElement).src = PLACEHOLDER_SVG; }}
              />

              {/* Flechas */}
              {lightbox.photos.length > 1 && (
                <>
                  <button
                    onClick={() => setLightbox(l => l ? { ...l, index: (l.index - 1 + l.photos.length) % l.photos.length } : null)}
                    className="absolute left-3 bg-black/60 hover:bg-black/90 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl border border-white/10 transition-all hover:scale-105"
                    aria-label="Anterior"
                  >
                    ‹
                  </button>
                  <button
                    onClick={() => setLightbox(l => l ? { ...l, index: (l.index + 1) % l.photos.length } : null)}
                    className="absolute right-3 bg-black/60 hover:bg-black/90 text-white rounded-full w-12 h-12 flex items-center justify-center text-2xl border border-white/10 transition-all hover:scale-105"
                    aria-label="Siguiente"
                  >
                    ›
                  </button>
                </>
              )}
            </div>

            {/* Info de la foto */}
            {(current.caption || current.location || current.taken_at) && (
              <div className="text-center text-white max-w-lg">
                {current.caption && (
                  <p className="font-sans font-semibold text-sm leading-snug">{current.caption}</p>
                )}
                <div className="flex items-center justify-center gap-3 mt-1">
                  {current.location && (
                    <span className="font-sans text-white/60 text-xs flex items-center gap-1">📍 {current.location}</span>
                  )}
                  {current.taken_at && (
                    <span className="font-sans text-white/60 text-xs">
                      {new Date(current.taken_at).toLocaleDateString("es-VE", { day: "numeric", month: "long", year: "numeric" })}
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Contador + cerrar */}
            <div className="flex items-center gap-4">
              {lightbox.photos.length > 1 && (
                <span className="font-mono text-white/40 text-[10px] uppercase tracking-widest">
                  {lightbox.index + 1} / {lightbox.photos.length}
                </span>
              )}
              <button
                onClick={() => setLightbox(null)}
                className="text-white/60 hover:text-white text-xs underline underline-offset-4 transition-colors"
              >
                Cerrar visualizador
              </button>
            </div>

            {/* Botón X flotante */}
            <button
              onClick={() => setLightbox(null)}
              className="absolute -top-12 right-0 bg-black/50 hover:bg-black/80 text-white rounded-full p-2.5 border border-white/10 transition-colors"
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </>
  );
}

// ── Tarjeta Pinterest ─────────────────────────────────────────────────────────
function PinterestCard({ photo, onClick }: { photo: GalleryPhoto; onClick: () => void }) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);

  return (
    <div
      className="break-inside-avoid mb-4 rounded-2xl overflow-hidden cursor-zoom-in group relative bg-navy/5 border border-[#003082]/10 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300"
      onClick={onClick}
    >
      {/* Imagen con proporción natural (Pinterest style) */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={errored ? PLACEHOLDER_SVG : photo.photo_url}
        alt={photo.caption ?? "Foto de labor"}
        className={`w-full object-cover transition-all duration-500 ${loaded ? "opacity-100 scale-100" : "opacity-0 scale-[1.02]"} group-hover:scale-[1.03]`}
        onLoad={() => setLoaded(true)}
        onError={() => { setErrored(true); setLoaded(true); }}
        style={{ display: "block", width: "100%", height: "auto" }}
      />

      {/* Overlay con caption al hover */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 gap-1">
        {photo.caption && (
          <p className="font-sans font-semibold text-white text-sm leading-snug line-clamp-2">
            {photo.caption}
          </p>
        )}
        <div className="flex items-center gap-2 flex-wrap">
          {photo.location && (
            <span className="font-sans text-white/80 text-xs flex items-center gap-0.5">
              📍 {photo.location}
            </span>
          )}
          {photo.taken_at && (
            <span className="font-sans text-white/60 text-xs">
              {new Date(photo.taken_at).toLocaleDateString("es-VE", { day: "numeric", month: "short" })}
            </span>
          )}
        </div>
      </div>

      {/* Icono de zoom */}
      <div className="absolute top-3 right-3 bg-black/50 text-white rounded-full p-1.5 text-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        🔍
      </div>
    </div>
  );
}
