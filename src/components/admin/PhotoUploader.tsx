"use client";

import { useRef, useState } from "react";
import { deletePurchasePhoto } from "@/app/actions/purchases";

// ── Compresor de imágenes (Canvas API, sin dependencias externas) ─────────────
// Redimensiona al máx 1280px y re-codifica a JPEG 0.72 de calidad.
// Una foto de 5 MB de celular queda en ~150–250 KB sin pérdida visible.
async function compressImage(
  file: File,
  maxDimension = 1280,
  quality = 0.72,
): Promise<File> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      let { width, height } = img;

      // Redimensionar manteniendo proporción
      if (width > maxDimension || height > maxDimension) {
        if (width > height) {
          height = Math.round((height * maxDimension) / width);
          width = maxDimension;
        } else {
          width = Math.round((width * maxDimension) / height);
          height = maxDimension;
        }
      }

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      if (!ctx) { resolve(file); return; }

      ctx.drawImage(img, 0, 0, width, height);

      canvas.toBlob(
        (blob) => {
          if (!blob) { resolve(file); return; }
          // Mantener nombre original pero con extensión .jpg
          const newName = file.name.replace(/\.[^.]+$/, "") + ".jpg";
          resolve(new File([blob], newName, { type: "image/jpeg" }));
        },
        "image/jpeg",
        quality,
      );
    };

    img.onerror = () => { URL.revokeObjectURL(objectUrl); resolve(file); };
    img.src = objectUrl;
  });
}

type ExistingPhoto = {
  id: string;
  photo_url: string;
  photo_type: "receipt" | "product" | "delivery";
  caption: string | null;
};

type Props = {
  type: "receipt" | "product" | "delivery";
  label: string;
  existingPhotos?: ExistingPhoto[];
};

const TYPE_LABELS = {
  receipt: "Recibo",
  product: "Producto",
  delivery: "Entrega",
};

export function PhotoUploader({ type, label, existingPhotos = [] }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previews, setPreviews] = useState<string[]>([]);
  const [existing, setExisting] = useState<ExistingPhoto[]>(existingPhotos);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [compressing, setCompressing] = useState(false);
  // Mantiene los File comprimidos sincronizados con el <input> para el submit del form
  const compressedFilesRef = useRef<File[]>([]);

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setCompressing(true);

    const newPreviews: string[] = [];
    const newCompressed: File[] = [];

    for (const file of Array.from(files)) {
      const compressed = await compressImage(file);
      newCompressed.push(compressed);
      newPreviews.push(URL.createObjectURL(compressed));
    }

    // Sync al input real para que el FormData lo recoja en submit
    if (inputRef.current) {
      const dt = new DataTransfer();
      compressedFilesRef.current.forEach((f) => dt.items.add(f));
      newCompressed.forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
      compressedFilesRef.current = Array.from(dt.files);
    }

    setPreviews((prev) => [...prev, ...newPreviews]);
    setCompressing(false);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    handleFiles(e.dataTransfer.files);
  }

  function handleRemovePreview(index: number) {
    const urlToRemove = previews[index];
    if (urlToRemove) {
      URL.revokeObjectURL(urlToRemove);
    }

    const updatedPreviews = previews.filter((_, idx) => idx !== index);
    const updatedFiles = compressedFilesRef.current.filter((_, idx) => idx !== index);

    compressedFilesRef.current = updatedFiles;
    setPreviews(updatedPreviews);

    if (inputRef.current) {
      const dt = new DataTransfer();
      updatedFiles.forEach((f) => dt.items.add(f));
      inputRef.current.files = dt.files;
    }
  }

  async function handleDeleteExisting(photo: ExistingPhoto) {
    setDeleting(photo.id);
    const result = await deletePurchasePhoto(photo.id, photo.photo_url);
    if ("success" in result) {
      setExisting((prev) => prev.filter((p) => p.id !== photo.id));
    }
    setDeleting(null);
  }

  const hasContent = existing.length > 0 || previews.length > 0;

  return (
    <div className="flex flex-col gap-2">
      <label className="font-sans text-sm font-medium text-[#0A1628]">
        {label}{" "}
        <span className="font-mono text-[10px] text-[#64748B] uppercase tracking-wide">
          {TYPE_LABELS[type]}
        </span>
      </label>

      {/* Existing photos */}
      {existing.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {existing.map((photo) => (
            <div key={photo.id} className="relative group w-20 h-20 rounded-lg overflow-hidden border border-[#003082]/10">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={photo.photo_url}
                alt={`Foto ${photo.photo_type}`}
                className="w-full h-full object-cover"
              />
              <button
                type="button"
                onClick={() => handleDeleteExisting(photo)}
                disabled={deleting === photo.id}
                className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity duration-150"
                aria-label="Eliminar foto"
              >
                <svg viewBox="0 0 20 20" fill="white" className="w-5 h-5">
                  <path
                    fillRule="evenodd"
                    d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm4 0a1 1 0 112 0v6a1 1 0 11-2 0V8z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* New previews */}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-1">
          {previews.map((src, i) => (
            <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-dashed border-[#F4C31D]/60">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt="Preview" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => handleRemovePreview(i)}
                className="absolute top-0.5 right-0.5 bg-black/60 rounded-full p-0.5"
                aria-label="Quitar"
              >
                <svg viewBox="0 0 20 20" fill="white" className="w-3 h-3">
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Drop zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        onClick={() => inputRef.current?.click()}
        className={`
          border-2 border-dashed rounded-xl px-4 py-5 flex flex-col items-center justify-center gap-2
          cursor-pointer transition-colors duration-150
          ${hasContent ? "border-[#003082]/20 bg-white" : "border-[#003082]/20 bg-[#EEF4FF] hover:bg-[#E0EBFF]"}
        `}
      >
        {compressing ? (
          <div className="flex flex-col items-center gap-1.5 py-2">
            <span className="w-5 h-5 border-2 border-[#003082]/30 border-t-[#003082] rounded-full animate-spin" />
            <p className="font-sans text-xs text-[#003082] font-semibold animate-pulse">Comprimiendo y optimizando...</p>
          </div>
        ) : (
          <>
            <svg viewBox="0 0 20 20" fill="currentColor" className="w-7 h-7 text-[#003082]/30">
              <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.414V13H5.5z" />
            </svg>
            <p className="font-sans text-xs text-[#64748B] text-center">
              Arrastra o <span className="text-[#003082] font-medium">haz click</span> para subir
            </p>
            <p className="font-mono text-[9px] text-[#64748B]/60">JPG, PNG, WEBP — Se comprimen automáticamente</p>
          </>
        )}
        <input
          ref={inputRef}
          type="file"
          name={`photos_${type}`}
          multiple
          accept="image/*"
          className="hidden"
          onChange={(e) => handleFiles(e.target.files)}
        />
      </div>
    </div>
  );
}

