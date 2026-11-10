"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

interface PillarItem {
  id: string;
  tag: string;
  title: string;
  description: string;
  image: string;
}

const PILLARS: PillarItem[] = [
  {
    id: "seguridad",
    tag: "NOTARIAL",
    title: "Seguridad Jurídica",
    description: "Blindaje legal y títulos 100% verificados en cada operación.",
    image: "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "verificada",
    tag: "INSPECCIÓN",
    title: "Cartera Certificada",
    description: "Propiedades inspeccionadas con avalúo real al día.",
    image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "asesoria",
    tag: "DEDICADA",
    title: "Asesoría Personal",
    description: "Acompañamiento experto desde la visita hasta el registro.",
    image: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "transparencia",
    tag: "TRANSPARENCIA",
    title: "Celeridad & Claridad",
    description: "Gestión ágil sin comisiones ocultas ni sorpresas.",
    image: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=900&q=80",
  },
  {
    id: "dominio",
    tag: "TRUJILLO",
    title: "Dominio Local",
    description: "Conocimiento experto de las mejores zonas y plusvalía.",
    image: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=900&q=80",
  },
];

// Carrusel 3D autonomo y continuo con transiciones agiles y fotografia limpia
export function TrustSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const [activeIndex, setActiveIndex] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const total = PILLARS.length;

  // Pausar carrusel cuando la seccion esta fuera de pantalla para ahorrar recursos
  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === "undefined") return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsInViewport(entry.isIntersecting);
      },
      { threshold: 0.15 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
  };

  // Rotacion automatica agil a 3.2 segundos (solo si esta en pantalla y pestana activa)
  useEffect(() => {
    if (isPaused || !isInViewport) return;
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        nextSlide();
      }
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, isInViewport]);

  // Manejadores de gestos tactiles para navegacion fluida en moviles
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
    touchDeltaX.current = 0;
    setIsPaused(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
  };

  const handleTouchEnd = () => {
    if (Math.abs(touchDeltaX.current) > 40) {
      if (touchDeltaX.current > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    touchStartX.current = null;
    touchDeltaX.current = 0;
    setIsPaused(false);
  };

  return (
    <section
      ref={sectionRef}
      id="nosotros"
      className="relative isolate overflow-hidden border-t border-b border-stone-200/80 bg-gradient-to-b from-[#faf8f5] via-[#f7f2ea] to-[#f3ece2] py-16 sm:py-20 lg:py-24"
    >
      {/* Iluminación ambiental limpia y difusa (100% nativa por GPU, 0 filtros blur, 60fps) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Baño cenital amplio y suave que baña la cabecera sin cortes ni manchas */}
        <div className="absolute inset-x-0 -top-32 h-[34rem] bg-[radial-gradient(ellipse_80%_65%_at_50%_0%,rgba(194,82,39,0.08)_0%,rgba(245,158,11,0.03)_55%,transparent_100%)]" />

        {/* Resplandor ambiental suave en la base del carrusel */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-[radial-gradient(ellipse_90%_50%_at_50%_100%,rgba(194,82,39,0.05)_0%,transparent_100%)]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabecera monumental limpia con tipografía de alto impacto */}
        <div className="relative mx-auto max-w-5xl text-center py-4 sm:py-6">
          {/* Titular monumental a gran escala con alto contraste */}
          <h2 className="relative z-10 font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-brand-primary leading-[1.06] drop-shadow-xs">
            ¿Por qué{" "}
            <span className="relative inline-block text-brand-accent whitespace-nowrap">
              elegirnos
              {/* Trazo organico artesanal con presencia visual de marca */}
              <svg
                aria-hidden
                viewBox="0 0 240 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 sm:-bottom-3.5 left-0 h-3 sm:h-4 w-full text-brand-accent/70"
              >
                <path
                  d="M2 9C55 3 130 3 238 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>
            ?
          </h2>
        </div>

        {/* Escenario 3D con curvatura en arco cilindrico y transicion fluida */}
        <div
          className="relative mt-8 sm:mt-12 w-full select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Contenedor con perspectiva 3D ampliada - mayor escenario lateral */}
          <div
            className="relative mx-auto flex h-[430px] sm:h-[480px] md:h-[520px] w-full items-center justify-center overflow-visible"
            style={{ perspective: "1400px" }}
          >
            {PILLARS.map((item, idx) => {
              // Distancia modular respecto al centro activo (-2, -1, 0, 1, 2)
              let diff = idx - activeIndex;
              if (diff > total / 2) diff -= total;
              if (diff < -total / 2) diff += total;

              const isActive = diff === 0;
              const absDiff = Math.abs(diff);

              // Arco mas abierto y tarjetas mas grandes
              const rotateY = diff * -22;
              const translateX = diff * 260; // Mas separation lateral
              const translateZ = -absDiff * 90;
              const translateY = absDiff * 8;
              const scale = isActive ? 1.06 : Math.max(0.80, 1 - absDiff * 0.1);
              const zIndex = 30 - absDiff * 10;
              const opacity = absDiff > 2 ? 0 : Math.max(0.38, 1 - absDiff * 0.3);

              return (
                <div
                  key={item.id}
                  onClick={() => goToSlide(idx)}
                  style={{
                    transform: `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${translateY}px), ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                    zIndex,
                    opacity,
                    transition: "transform 0.55s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.55s ease, box-shadow 0.55s ease",
                    willChange: "transform, opacity",
                  }}
                  className={`group absolute top-1/2 left-1/2 h-[380px] w-[260px] sm:h-[430px] sm:w-[300px] md:h-[460px] md:w-[320px] cursor-pointer rounded-3xl overflow-hidden shadow-2xl transition-all duration-300 ${
                    isActive
                      ? "ring-2 ring-brand-accent/80 shadow-[0_20px_60px_rgba(222,88,42,0.35)]"
                      : "ring-1 ring-white/30 hover:opacity-90 shadow-lg"
                  }`}
                >
                  {/* Fotografia arquitectonica pura sin elementos superpuestos */}
                  <Image
                    src={item.image}
                    alt={item.title}
                    fill
                    sizes="(max-width: 640px) 260px, (max-width: 1024px) 310px, 340px"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                    priority={idx === 2}
                  />

                  {/* Gradiente desde arriba: zona oscura en el tercio superior para el texto, imagen libre abajo */}
                  <div className="absolute inset-0 bg-gradient-to-b from-neutral-950/90 via-neutral-950/40 via-45% to-transparent" />

                  {/* Overlay coral muy sutil de acento en hover */}
                  <div className="pointer-events-none absolute inset-0 bg-brand-accent/8 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

                  {/* Texto editorial en la parte superior: solo titulo monumental blanco centrado */}
                  <div className="absolute inset-x-0 top-0 z-10 px-6 pt-6 text-center">
                    <h3 className="font-heading text-2xl sm:text-3xl md:text-[1.9rem] font-black text-white leading-[1.1] tracking-tight drop-shadow-[0_2px_12px_rgba(0,0,0,0.5)]">
                      {item.title}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
