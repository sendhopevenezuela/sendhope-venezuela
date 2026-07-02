import type { Metadata } from "next";
import Link from "next/link";
import { getGalleryPhotos, deleteGalleryPhoto } from "@/app/actions/gallery";
import GalleryAdminClient from "./GalleryAdminClient";

export const metadata: Metadata = { title: "Galería — SendHope Admin" };

export default async function AdminGaleriaPage() {
  const photos = await getGalleryPhotos();

  return (
    <div className="p-6 md:p-8 flex flex-col gap-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-sans font-bold text-2xl text-[#0A1628]">Galería de Labor</h1>
          <p className="font-sans text-sm text-[#64748B] mt-1">
            Fotos documentales del equipo. Se muestran en <code className="font-mono text-[#003082]">/galeria</code>.
          </p>
        </div>
        <Link
          href="/admin/galeria/nueva"
          className="flex items-center gap-2 bg-[#003082] text-white font-sans font-medium text-sm px-4 py-2 rounded-lg hover:bg-[#0042A6] transition-colors"
        >
          <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
          </svg>
          Subir foto
        </Link>
      </div>

      {/* Stat */}
      <div className="bg-white rounded-xl border border-[#003082]/10 px-4 py-3 flex items-center gap-3 w-fit">
        <span className="font-mono text-xs text-[#64748B] uppercase tracking-wide">Total</span>
        <span className="font-sans font-bold text-xl text-[#003082]">{photos.length}</span>
      </div>

      <GalleryAdminClient photos={photos} deleteAction={deleteGalleryPhoto} />
    </div>
  );
}
