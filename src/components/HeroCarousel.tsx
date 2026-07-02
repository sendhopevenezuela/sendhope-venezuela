"use client";

import { useEffect, useState } from "react";

const IMAGES = [
  "/carrusel/WhatsApp Image 2026-07-01 at 6.39.55 PM.jpeg",
  "/carrusel/WhatsApp Image 2026-07-01 at 6.42.00 PM.jpeg",
];

export function HeroCarousel() {
  const [currentIdx, setCurrentIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % IMAGES.length);
    }, 6000); // Cambia de imagen cada 6 segundos
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="absolute inset-0 w-full h-full select-none pointer-events-none overflow-hidden z-0">
      {/* Diapositivas con efecto cross-fade y zoom lento */}
      {IMAGES.map((img, idx) => (
        <div
          key={img}
          className={`absolute inset-0 w-full h-full transition-opacity duration-[1500ms] ease-in-out ${
            idx === currentIdx ? "opacity-100 scale-100" : "opacity-0 scale-105"
          } transform transition-transform duration-[6000ms]`}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={img}
            alt="Fondo operativo SendHope"
            className="w-full h-full object-cover"
          />
        </div>
      ))}

      {/* Capa de superposición azul marino semi-transparente para asegurar contraste del texto */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(150deg, rgba(0, 29, 78, 0.9) 0%, rgba(0, 48, 130, 0.85) 55%, rgba(0, 66, 166, 0.9) 100%)",
        }}
      />
    </div>
  );
}
