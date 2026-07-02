import { getGalleryPhotos } from "@/app/actions/gallery";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Camera, MapPin, Calendar, ArrowRight } from "lucide-react";

export async function GalleryPreview() {
  const t = await getTranslations("gallery_preview");

  let photos: Awaited<ReturnType<typeof getGalleryPhotos>> = [];
  try {
    photos = await getGalleryPhotos();
  } catch (error) {
    console.error("[GalleryPreview] Error fetching photos:", error);
  }

  // Si no hay fotos, no renderizamos la sección para no dejar un espacio vacío
  if (photos.length === 0) {
    return null;
  }

  // Mostramos máximo las 4 fotos más recientes / ordenadas
  const previewPhotos = photos.slice(0, 4);

  return (
    <section className="bg-cream py-24 px-6 border-t border-[#003082]/5">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-xl">
            <span className="inline-flex items-center gap-1.5 font-mono text-[10px] text-gold uppercase tracking-[0.2em] font-bold mb-3 bg-[#F4C31D]/10 px-2.5 py-1 rounded-full">
              <Camera size={12} className="text-gold" />
              Nuestra Labor
            </span>
            <h2 className="font-sans font-800 text-3xl md:text-4xl text-navy leading-tight">
              {t("title")}
            </h2>
            <p className="font-sans font-400 text-muted text-base mt-2">
              {t("subtitle")}
            </p>
          </div>
          <Link
            href="/galeria"
            className="group inline-flex items-center gap-2 font-sans font-bold text-sm text-[#003082] hover:text-[#0042A6] transition-colors self-start md:self-end"
          >
            {t("cta")}
            <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {/* Grid of Preview Photos */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {previewPhotos.map((photo) => {
            const formattedDate = photo.taken_at
              ? new Date(photo.taken_at).toLocaleDateString("es-VE", {
                  day: "numeric",
                  month: "short",
                })
              : null;

            return (
              <article
                key={photo.id}
                className="group bg-white rounded-2xl border border-navy/8 overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
              >
                {/* Imagen */}
                <div className="relative aspect-[4/3] w-full bg-navy/5 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={photo.photo_url}
                    alt={photo.caption ?? "Foto de labor"}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
                </div>

                {/* Contenido / Info */}
                <div className="p-4 flex flex-col flex-grow justify-between">
                  <p className="font-sans font-600 text-navy text-sm leading-snug line-clamp-2 mb-3 min-h-[40px]">
                    {photo.caption ?? "Labor de campo en refugios"}
                  </p>

                  <div className="flex items-center justify-between border-t border-navy/5 pt-2.5 mt-auto">
                    {photo.location ? (
                      <span className="font-sans text-[11px] text-muted flex items-center gap-1 font-medium truncate max-w-[120px]" title={photo.location}>
                        <MapPin size={12} className="text-[#003082]/60 flex-shrink-0" />
                        {photo.location}
                      </span>
                    ) : (
                      <span />
                    )}
                    {formattedDate && (
                      <span className="font-mono text-[10px] text-muted flex items-center gap-1">
                        <Calendar size={11} className="text-[#003082]/60 flex-shrink-0" />
                        {formattedDate}
                      </span>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>

        {/* Link principal al final en pantallas móviles */}
        <div className="text-center md:hidden mt-4">
          <Link
            href="/galeria"
            className="inline-flex items-center gap-2 font-sans font-bold text-base text-navy hover:underline"
          >
            {t("cta")} <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </section>
  );
}
