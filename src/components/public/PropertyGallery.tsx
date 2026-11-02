"use client";

import { useState } from "react";
import Image from "next/image";

interface GalleryImage {
  url: string;
  caption?: string | null;
  isMain: boolean;
}

// Galeria interactiva de imagenes con seleccion de miniaturas
export function PropertyGallery({
  images,
  title,
}: {
  images: GalleryImage[];
  title: string;
}) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const fallback =
    "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1200&q=80";
  const displayImages = images.length > 0 ? images : [{ url: fallback, caption: title, isMain: true }];
  const currentImage = displayImages[selectedIndex] || displayImages[0];

  return (
    <div className="space-y-4">
      {/* Imagen Principal Grande */}
      <div className="relative aspect-[16/10] sm:aspect-[16/9] rounded-3xl overflow-hidden bg-neutral-900 shadow-lg border border-neutral-200">
        <Image
          src={currentImage.url}
          alt={currentImage.caption || title}
          fill
          priority
          sizes="(max-width: 1024px) 100vw, 66vw"
          className="object-cover"
        />
        {currentImage.caption && (
          <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md text-white text-xs px-4 py-2 rounded-xl">
            {currentImage.caption}
          </div>
        )}
      </div>

      {/* Tira de Miniaturas */}
      {displayImages.length > 1 && (
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
          {displayImages.map((img, idx) => (
            <button
              key={idx}
              onClick={() => setSelectedIndex(idx)}
              className={`relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden shrink-0 border-2 transition-all ${
                selectedIndex === idx
                  ? "border-brand-accent shadow-md scale-95"
                  : "border-transparent opacity-70 hover:opacity-100"
              }`}
            >
              <Image
                src={img.url}
                alt={img.caption || `Foto ${idx + 1}`}
                fill
                sizes="96px"
                className="object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

