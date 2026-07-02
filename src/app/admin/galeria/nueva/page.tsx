"use client";

import { useTransition, useRef, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createGalleryPhoto, createGalleryPhotosBulk } from "@/app/actions/gallery";

/** Compresor de imágenes Canvas */
async function compressImage(file: File, maxDimension = 1200, quality = 0.60): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      URL.revokeObjectURL(url);
      let { width, height } = img;
      if (width > maxDimension || height > maxDimension) {
        if (width > height) { height = Math.round((height * maxDimension) / width); width = maxDimension; }
        else { width = Math.round((width * maxDimension) / height); height = maxDimension; }
      }
      const canvas = document.createElement("canvas");
      canvas.width = width; canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }
      ctx.drawImage(img, 0, 0, width, height);
      canvas.toBlob((blob) => {
        if (!blob) { resolve(file); return; }
        resolve(new File([blob], file.name.replace(/\.[^.]+$/, ".jpg"), { type: "image/jpeg" }));
      }, "image/jpeg", quality);
    };
    img.onerror = () => { URL.revokeObjectURL(url); resolve(file); };
    img.src = url;
  });
}

export default function NuevaFotoGaleriaPage() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [uploadMode, setUploadMode] = useState<"single" | "bulk">("single");
  const [error, setError] = useState<string | null>(null);

  // Estados modo individual
  const [preview, setPreview] = useState<string | null>(null);
  const [compressedFile, setCompressedFile] = useState<File | null>(null);
  const [compressing, setCompressing] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Estados modo lote/álbum
  const [bulkFiles, setBulkFiles] = useState<File[]>([]);
  const [bulkPreviews, setBulkPreviews] = useState<string[]>([]);
  const [compressingBulk, setCompressingBulk] = useState(false);
  const bulkInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setCompressing(true);
    const compressed = await compressImage(files[0]);
    setCompressedFile(compressed);
    setPreview(URL.createObjectURL(compressed));
    setCompressing(false);
  }, []);

  const handleBulkFiles = useCallback(async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setCompressingBulk(true);
    const newFiles: File[] = [];
    const newPreviews: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const compressed = await compressImage(files[i]);
      newFiles.push(compressed);
      newPreviews.push(URL.createObjectURL(compressed));
    }
    setBulkFiles(newFiles);
    setBulkPreviews(newPreviews);
    setCompressingBulk(false);
  }, []);

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    const formEl = e.currentTarget;
    const formData = new FormData(formEl);

    if (uploadMode === "single") {
      if (!compressedFile) { setError("Selecciona una foto primero."); return; }
      formData.set("photo", compressedFile);

      startTransition(async () => {
        const result = await createGalleryPhoto(formData);
        if ("error" in result) {
          setError(result.error);
        } else {
          router.push("/admin/galeria");
        }
      });
    } else {
      if (bulkFiles.length === 0) { setError("Selecciona al menos una foto para el álbum."); return; }
      formData.delete("photo"); // Asegurar que no vaya el campo individual
      bulkFiles.forEach((file) => {
        formData.append("photos", file);
      });

      startTransition(async () => {
        const result = await createGalleryPhotosBulk(formData);
        if ("error" in result) {
          setError(result.error);
        } else {
          router.push("/admin/galeria");
        }
      });
    }
  }

  return (
    <div className="p-6 md:p-8 max-w-xl mx-auto">
      <button
        onClick={() => router.back()}
        className="flex items-center gap-1.5 text-sm font-sans text-[#64748B] hover:text-[#003082] transition-colors mb-6 cursor-pointer"
      >
        <svg viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
          <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        Volver a galería
      </button>

      <h1 className="font-sans font-bold text-2xl text-[#0A1628] mb-1">
        {uploadMode === "single" ? "Subir Foto a Galería" : "Subir Álbum de Fotos"}
      </h1>
      <p className="font-sans text-sm text-[#64748B] mb-6">
        Las fotos se comprimen automáticamente antes de subirse para economizar espacio.
      </p>

      {/* Selector de modo */}
      <div className="flex bg-[#EEF4FF] p-1 rounded-xl mb-5 border border-[#003082]/5">
        <button
          type="button"
          onClick={() => {
            setUploadMode("single");
            setError(null);
          }}
          className={`flex-1 font-sans font-semibold text-xs py-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
            uploadMode === "single"
              ? "bg-[#003082] text-white shadow-sm"
              : "text-[#003082]/70 hover:text-[#003082]"
          }`}
        >
          Foto Individual
        </button>
        <button
          type="button"
          onClick={() => {
            setUploadMode("bulk");
            setError(null);
          }}
          className={`flex-1 font-sans font-semibold text-xs py-2.5 rounded-lg transition-all duration-150 cursor-pointer ${
            uploadMode === "bulk"
              ? "bg-[#003082] text-white shadow-sm"
              : "text-[#003082]/70 hover:text-[#003082]"
          }`}
        >
          Álbum (Múltiples Fotos)
        </button>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5 bg-white rounded-2xl border border-[#003082]/10 p-6">
        {/* Selector de archivos condicional */}
        {uploadMode === "single" ? (
          <div>
            <label className="block font-sans font-semibold text-sm text-[#0A1628] mb-2">Foto *</label>
            {preview ? (
              <div className="relative rounded-xl overflow-hidden border border-[#003082]/10 bg-gray-50">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={preview} alt="Preview" className="w-full object-cover max-h-72" />
                <button
                  type="button"
                  onClick={() => { setPreview(null); setCompressedFile(null); if (inputRef.current) inputRef.current.value = ""; }}
                  className="absolute top-2 right-2 bg-black/60 hover:bg-black/85 text-white rounded-full p-1.5 text-xs cursor-pointer"
                >✕</button>
                {compressedFile && (
                  <div className="absolute bottom-0 left-0 right-0 bg-black/50 text-white font-mono text-[9px] px-3 py-1.5">
                    Comprimida: {(compressedFile.size / 1024).toFixed(0)} KB
                  </div>
                )}
              </div>
            ) : (
              <div
                onClick={() => inputRef.current?.click()}
                className="border-2 border-dashed border-[#003082]/20 rounded-xl px-4 py-10 flex flex-col items-center gap-2 cursor-pointer hover:bg-[#EEF4FF]/50 transition-colors"
              >
                {compressing ? (
                  <><span className="w-6 h-6 border-2 border-[#003082]/30 border-t-[#003082] rounded-full animate-spin" /><p className="text-xs text-[#003082] font-semibold animate-pulse">Comprimiendo...</p></>
                ) : (
                  <><span className="text-3xl">📸</span><p className="font-sans text-sm text-[#64748B] text-center">Haz clic para seleccionar una foto</p><p className="font-mono text-[9px] text-[#64748B]/60">JPG, PNG, WEBP — Se comprime automáticamente</p></>
                )}
                <input ref={inputRef} type="file" accept="image/*" className="hidden" onChange={(e) => handleFile(e.target.files)} />
              </div>
            )}
          </div>
        ) : (
          <div>
            <label className="block font-sans font-semibold text-sm text-[#0A1628] mb-2">Fotos del Álbum *</label>
            {bulkPreviews.length > 0 ? (
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 border border-[#003082]/10 rounded-xl p-3 bg-gray-50 max-h-60 overflow-y-auto">
                  {bulkPreviews.map((src, i) => (
                    <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#003082]/10 group bg-white">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={src} alt={`Preview ${i}`} className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => {
                          const newFiles = bulkFiles.filter((_, idx) => idx !== i);
                          const newPreviews = bulkPreviews.filter((_, idx) => idx !== i);
                          setBulkFiles(newFiles);
                          setBulkPreviews(newPreviews);
                          if (newFiles.length === 0 && bulkInputRef.current) bulkInputRef.current.value = "";
                        }}
                        className="absolute top-1 right-1 bg-black/70 hover:bg-black text-white rounded-full p-1 text-[9px] cursor-pointer"
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-[#64748B]">
                    {bulkFiles.length} {bulkFiles.length === 1 ? "foto cargada" : "fotos cargadas"} (Total: {(bulkFiles.reduce((sum, f) => sum + f.size, 0) / 1024).toFixed(0)} KB)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setBulkFiles([]);
                      setBulkPreviews([]);
                      if (bulkInputRef.current) bulkInputRef.current.value = "";
                    }}
                    className="font-sans text-xs text-red-600 hover:underline cursor-pointer"
                  >
                    Limpiar todo
                  </button>
                </div>
              </div>
            ) : (
              <div
                onClick={() => bulkInputRef.current?.click()}
                className="border-2 border-dashed border-[#003082]/20 rounded-xl px-4 py-10 flex flex-col items-center gap-2 cursor-pointer hover:bg-[#EEF4FF]/50 transition-colors"
              >
                {compressingBulk ? (
                  <>
                    <span className="w-6 h-6 border-2 border-[#003082]/30 border-t-[#003082] rounded-full animate-spin" />
                    <p className="text-xs text-[#003082] font-semibold animate-pulse">Comprimiendo lote...</p>
                  </>
                ) : (
                  <>
                    <span className="text-3xl">🗂️</span>
                    <p className="font-sans text-sm text-[#64748B] text-center">Haz clic para seleccionar múltiples fotos</p>
                    <p className="font-mono text-[9px] text-[#64748B]/60">Selecciona varios archivos a la vez — Compresión automática</p>
                  </>
                )}
                <input
                  ref={bulkInputRef}
                  type="file"
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={(e) => handleBulkFiles(e.target.files)}
                />
              </div>
            )}
          </div>
        )}

        {/* Campos de metadatos (comunes para lote) */}
        <div>
          <label htmlFor="caption" className="block font-sans font-semibold text-sm text-[#0A1628] mb-1.5">
            {uploadMode === "single" ? "Descripción / Leyenda" : "Descripción común / Leyenda del Álbum"}
          </label>
          <input
            id="caption"
            name="caption"
            type="text"
            placeholder={uploadMode === "single" ? "ej: Entrega de alimentos en Refugio San Judas" : "ej: Jornada de distribución en refugios de Barquisimeto"}
            className="w-full px-4 py-2.5 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
          />
        </div>

        <div>
          <label htmlFor="location" className="block font-sans font-semibold text-sm text-[#0A1628] mb-1.5">Ubicación</label>
          <input
            id="location"
            name="location"
            type="text"
            placeholder="ej: Barquisimeto, Lara"
            className="w-full px-4 py-2.5 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="taken_at" className="block font-sans font-semibold text-sm text-[#0A1628] mb-1.5">Fecha de la foto</label>
            <input
              id="taken_at"
              name="taken_at"
              type="date"
              className="w-full px-4 py-2.5 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
            />
          </div>
          <div>
            <label htmlFor="display_order" className="block font-sans font-semibold text-sm text-[#0A1628] mb-1.5">
              {uploadMode === "single" ? "Orden (menor = primero)" : "Orden inicial del lote"}
            </label>
            <input
              id="display_order"
              name="display_order"
              type="number"
              defaultValue="0"
              className="w-full px-4 py-2.5 text-sm font-sans border border-[#003082]/20 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-[#003082]/20"
            />
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 text-sm font-sans">
            ⚠ {error}
          </div>
        )}

        <div className="flex gap-3 justify-end pt-2">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-5 py-2.5 font-sans text-sm font-medium text-[#64748B] border border-[#64748B]/20 rounded-lg hover:bg-[#64748B]/5 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={isPending || compressing || compressingBulk}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#003082] text-white font-sans font-semibold text-sm rounded-lg hover:bg-[#0042A6] transition-colors disabled:opacity-60 cursor-pointer"
          >
            {isPending ? (
              <>
                <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Subiendo lote...
              </>
            ) : uploadMode === "single" ? (
              "Subir a Galería"
            ) : (
              `Subir ${bulkFiles.length > 0 ? `${bulkFiles.length} fotos` : "Álbum"}`
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
