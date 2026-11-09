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
  const [activeIndex, setActiveIndex] = useState(2);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const total = PILLARS.length;

  const nextSlide = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
  };

  // Rotacion automatica agil a 3.2 segundos pausada al pasar el cursor o tocar
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, 3200);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

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
      id="nosotros"
      className="relative isolate overflow-hidden border-t border-b border-neutral-300/80 bg-gradient-to-b from-[#faf7f3] via-[#faede4] to-[#f6e5d8] py-16 sm:py-20 lg:py-24"
    >
      {/* Atmosfera luminica calida de atardecer: orbes ambar y coral sin tonos marrones */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        {/* Luz calida dorada superior */}
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-[36rem] w-[60rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(222,88,42,0.12),rgba(245,158,11,0.06),transparent_70%)] opacity-85" />
        {/* Resplandor ambiental inferior calido que abraza la base con luz limpia */}
        <div className="absolute -bottom-24 left-1/2 -translate-x-1/2 h-64 w-[64rem] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(249,115,22,0.10),rgba(222,88,42,0.05),transparent_70%)]" />
        <div className="absolute -bottom-24 -left-20 h-96 w-96 rounded-full bg-brand-primary/[0.04]" />
        <div className="absolute -top-24 -right-20 h-96 w-96 rounded-full bg-brand-accent/[0.08]" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabecera monumental con iluminacion volumetrica calida naranja en capas traseras */}
        <div className="relative mx-auto max-w-5xl text-center py-4 sm:py-6">
          {/* Sistema de luces bilateral: expandido hacia los lados y suave en el centro */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
            {/* Flanco lateral izquierdo: Destello calido ambar y naranja expandido */}
            <div
              className="absolute top-1/2 -left-12 sm:left-[-2rem] md:left-[2%] -translate-y-1/2 h-52 w-80 sm:h-64 sm:w-[26rem] lg:w-[32rem] rounded-full
                bg-[radial-gradient(circle_at_center,rgba(245,158,11,0.20),rgba(222,88,42,0.10),transparent_70%)]"
            />

            {/* Flanco lateral derecho: Resplandor calido terracota y coral expandido */}
            <div
              className="absolute top-1/2 -right-12 sm:right-[-2rem] md:right-[2%] -translate-y-1/2 h-52 w-80 sm:h-64 sm:w-[26rem] lg:w-[32rem] rounded-full
                bg-[radial-gradient(circle_at_center,rgba(222,88,42,0.22),rgba(249,115,22,0.12),transparent_70%)]"
            />

            {/* Extremo exterior izquierdo: Halo sutil que abraza la cabecera */}
            <div
              className="absolute -top-10 left-[8%] h-40 w-72 rounded-full
                bg-[radial-gradient(circle_at_center,rgba(254,215,170,0.22),rgba(245,158,11,0.08),transparent_70%)]"
            />

            {/* Extremo exterior derecho: Halo sutil que abraza el signo final */}
            <div
              className="absolute -bottom-8 right-[8%] h-40 w-72 rounded-full
                bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.18),rgba(222,88,42,0.08),transparent_70%)]"
            />

            {/* Centro atenuado: Bruma suave de baja opacidad para no formar mancha concentrada */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-72 sm:w-96 rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(222,88,42,0.06),transparent_70%)]"
            />
          </div>

          {/* Titular unico monumental a gran escala con alto contraste */}
          <h2 className="relative z-10 font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-tight text-brand-primary leading-[1.06] drop-shadow-sm">
            ¿Por qué{" "}
            <span className="relative inline-block text-brand-accent whitespace-nowrap">
              elegirnos
              {/* Trazo organico artesanal con presencia visual de marca */}
              <svg
                aria-hidden
                viewBox="0 0 240 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 sm:-bottom-3.5 left-0 h-3 sm:h-4 w-full text-brand-accent/60"
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
