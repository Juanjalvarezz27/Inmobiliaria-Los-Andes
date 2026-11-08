"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  X,
  Camera,
} from "lucide-react";

interface GalleryImage {
  url: string;
  caption?: string | null;
  isMain?: boolean;
}

interface PropertyGalleryProps {
  images: GalleryImage[];
  title: string;
}

// Galeria arquitectonica interactiva con visor cinematografico y lightbox a pantalla completa
export function PropertyGallery({ images, title }: PropertyGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const fallback =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1400&q=80";

  const displayImages: GalleryImage[] =
    images && images.length > 0
      ? images
      : [{ url: fallback, caption: title, isMain: true }];

  const total = displayImages.length;
  const currentImage = displayImages[selectedIndex] || displayImages[0];

  const nextImage = useCallback(() => {
    if (total <= 1) return;
    setSelectedIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevImage = useCallback(() => {
    if (total <= 1) return;
    setSelectedIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  // Navegacion por teclado para el visor y lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") nextImage();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "Escape" && isLightboxOpen) setIsLightboxOpen(false);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextImage, prevImage, isLightboxOpen]);

  // Bloqueo de scroll cuando el lightbox esta activo
  useEffect(() => {
    if (isLightboxOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isLightboxOpen]);

  return (
    <div className="space-y-3.5">
      {/* Contenedor Principal de la Fotografia con Proporcion Editorial y Mayor Profundidad */}
      <div className="group relative aspect-[16/10] sm:aspect-[16/9.5] w-full rounded-[28px] overflow-hidden bg-neutral-950 shadow-[0_24px_55px_-12px_rgba(20,35,25,0.22),0_8px_20px_-6px_rgba(0,0,0,0.08)] border border-white/80 ring-1 ring-black/[0.06]">
        <Image
          src={currentImage.url}
          alt={currentImage.caption || `${title} - Foto ${selectedIndex + 1}`}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 68vw"
          className="object-cover transition-transform duration-500 ease-out group-hover:scale-102 cursor-pointer"
          onClick={() => setIsLightboxOpen(true)}
        />

        {/* Degradados sutiles para legibilidad de controles */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

        {/* Píldora de Contador y Boton de Pantalla Completa */}
        <div className="absolute top-4 right-4 flex items-center gap-2 z-10">
          <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold border border-white/20 shadow-md">
            <Camera className="w-3.5 h-3.5 text-orange-300" />
            <span>
              {selectedIndex + 1} / {total}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setIsLightboxOpen(true)}
            className="p-2 rounded-full bg-black/60 hover:bg-black/85 backdrop-blur-md text-white border border-white/20 shadow-md transition-all active:scale-95 cursor-pointer"
            title="Ver en pantalla completa"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Flechas de Navegacion Lateral sobre la Imagen */}
        {total > 1 && (
          <>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                prevImage();
              }}
              aria-label="Foto anterior"
              className="absolute left-3.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-900 border border-neutral-200/80 shadow-lg flex items-center justify-center opacity-85 hover:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronLeft className="w-5 h-5 stroke-[2.5]" />
            </button>

            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                nextImage();
              }}
              aria-label="Foto siguiente"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-neutral-900 border border-neutral-200/80 shadow-lg flex items-center justify-center opacity-85 hover:opacity-100 transition-all hover:scale-105 active:scale-95 cursor-pointer"
            >
              <ChevronRight className="w-5 h-5 stroke-[2.5]" />
            </button>
          </>
        )}
      </div>

      {/* Tira de Miniaturas Deslizables con Enfoque Activo y Margen para Sombras */}
      {total > 1 && (
        <div className="flex items-center gap-2.5 sm:gap-3 overflow-x-auto p-1.5 -m-1.5 scrollbar-thin">
          {displayImages.map((img, idx) => {
            const isActive = selectedIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedIndex(idx)}
                className={`relative w-20 h-16 sm:w-24 sm:h-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                  isActive
                    ? "border-brand-accent shadow-[0_4px_14px_-2px_rgba(222,88,42,0.40)] ring-2 ring-brand-accent/30"
                    : "border-white/90 opacity-70 hover:opacity-100 shadow-[0_2px_8px_rgba(20,35,25,0.08)]"
                }`}
              >
                <Image
                  src={img.url}
                  alt={img.caption || `Miniatura ${idx + 1}`}
                  fill
                  sizes="96px"
                  className="object-cover"
                />
              </button>
            );
          })}
        </div>
      )}

      {/* Lightbox / Modal a Pantalla Completa */}
      {isLightboxOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-xl flex flex-col justify-between p-4 sm:p-6 animate-in fade-in duration-200 select-none"
        >
          {/* Barra Superior del Lightbox */}
          <div className="flex items-center justify-between text-white pb-3 border-b border-white/10">
            <div className="flex items-center gap-2">
              <Camera className="w-4 h-4 text-orange-400" />
              <span className="text-xs sm:text-sm font-bold">
                Foto {selectedIndex + 1} de {total}
              </span>
            </div>

            <button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Area Central con la Fotografia en Resolucion Completa */}
          <div className="relative flex-1 my-4 flex items-center justify-center">
            <div className="relative w-full h-full max-w-6xl max-h-[78vh]">
              <Image
                src={currentImage.url}
                alt={currentImage.caption || title}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            </div>

            {/* Controles de Navegacion Flotantes en Lightbox */}
            {total > 1 && (
              <>
                <button
                  type="button"
                  onClick={prevImage}
                  className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer"
                  title="Foto anterior"
                >
                  <ChevronLeft className="w-6 h-6" />
                </button>

                <button
                  type="button"
                  onClick={nextImage}
                  className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 p-3 rounded-full bg-white/15 hover:bg-white/30 text-white transition-all cursor-pointer"
                  title="Foto siguiente"
                >
                  <ChevronRight className="w-6 h-6" />
                </button>
              </>
            )}
          </div>

          {/* Pie del Lightbox: Miniaturas Inferiores */}
          <div className="text-center space-y-2">
            {total > 1 && (
              <div className="flex justify-center gap-2 overflow-x-auto py-1 max-w-2xl mx-auto">
                {displayImages.map((img, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setSelectedIndex(idx)}
                    className={`relative w-14 h-10 sm:w-16 sm:h-12 rounded-xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      selectedIndex === idx
                        ? "border-brand-accent scale-105"
                        : "border-transparent opacity-50 hover:opacity-80"
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt={`Miniatura ${idx + 1}`}
                      fill
                      sizes="64px"
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
