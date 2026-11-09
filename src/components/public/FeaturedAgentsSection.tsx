"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { MessageCircle } from "lucide-react";
import { getInitials } from "@/lib/utils/format";
import { buildWhatsAppUrl } from "@/lib/utils/whatsapp";

export interface FeaturedAgentData {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  position?: string | null;
  propertiesCount: number;
}

interface FeaturedAgentsSectionProps {
  agents: FeaturedAgentData[];
  totalAgents?: number;
}

// Escaparate de asesores con fondo Parallax arquitectonico, tarjetas luminosas y carrusel 3D autonomo
export function FeaturedAgentsSection({ agents, totalAgents }: FeaturedAgentsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [isInViewport, setIsInViewport] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchDeltaX = useRef<number>(0);
  const total = agents.length;

  // Deteccion responsiva para espaciado optimo en moviles y escritorio
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Observador de visibilidad para pausar carrusel y animaciones si la seccion no esta en pantalla
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

  // Efecto Parallax desacoplado a 60fps (solo en pantallas grandes para no sobrecargar CPU en moviles)
  useEffect(() => {
    if (window.innerWidth < 768) return;

    let ticking = false;

    const handleScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (sectionRef.current && parallaxRef.current) {
            const rect = sectionRef.current.getBoundingClientRect();
            const windowHeight = window.innerHeight;
            if (rect.top <= windowHeight && rect.bottom >= 0) {
              const progress = (windowHeight - rect.top) / (windowHeight + rect.height);
              const translateY = (progress - 0.5) * 80;
              parallaxRef.current.style.transform = `translate3d(0, ${translateY}px, 0)`;
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const nextSlide = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev + 1) % total);
  }, [total]);

  const prevSlide = useCallback(() => {
    if (total <= 1) return;
    setActiveIndex((prev) => (prev - 1 + total) % total);
  }, [total]);

  const goToSlide = (idx: number) => {
    setActiveIndex(idx);
  };

  // Rotacion automatica a 3.5s pausada en hover, toque o cuando la seccion esta fuera de pantalla
  useEffect(() => {
    if (isPaused || total <= 1 || !isInViewport) return;
    const timer = setInterval(() => {
      if (typeof document !== "undefined" && !document.hidden) {
        nextSlide();
      }
    }, 3500);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide, total, isInViewport]);

  // Manejadores de gestos tactiles para swipe en moviles
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
    if (Math.abs(touchDeltaX.current) > 35) {
      if (touchDeltaX.current > 0) {
        prevSlide();
      } else {
        nextSlide();
      }
    }
    touchStartX.current = null;
    setIsPaused(false);
  };

  if (agents.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="asesores"
      className="relative isolate overflow-hidden bg-gradient-to-b from-[#1a1410] via-[#241711] to-[#160f0b] py-14 sm:py-18 lg:py-20"
    >
      {/* Capa de fondo con efecto Parallax desacoplado a 60fps */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={parallaxRef}
          className="absolute -top-24 inset-x-0 h-[calc(100%+12rem)] w-full"
        >
          <Image
            src="/images/andes-venezuela.webp"
            alt="Cordillera de los Andes venezolanos, Mérida"
            fill
            sizes="100vw"
            className="object-cover object-[center_30%] scale-105"
            priority={false}
          />
          {/* Velo botánico translúcido: preserva la nitidez del paisaje andino con tono esmeralda natural */}
          <div className="absolute inset-0 bg-gradient-to-b from-white/35 via-emerald-900/15 to-[#082a19]/35" />
          {/* Destellos ambientales esmeralda profundo integrados al parallax */}
          <div className="absolute top-1/4 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.12),transparent_70%)]" />
          <div className="absolute bottom-1/4 right-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.10),transparent_70%)]" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabecera monumental con sistema de iluminacion bilateral verde esmeralda */}
        <div className="relative mx-auto max-w-5xl text-center pb-2 sm:pb-4">
          {/* Sistema de luces bilateral verde: destellos esmeralda a los lados y centro limpio */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
            {/* Flanco lateral izquierdo: Destello esmeralda vivo expandido */}
            <div
              className="absolute top-1/2 -left-12 sm:left-[-2rem] md:left-[2%] -translate-y-1/2 h-52 w-80 sm:h-64 sm:w-[26rem] lg:w-[32rem] rounded-full
                bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.15),rgba(5,150,105,0.06),transparent_70%)]"
            />

            {/* Flanco lateral derecho: Resplandor menta y teal expandido */}
            <div
              className="absolute top-1/2 -right-12 sm:right-[-2rem] md:right-[2%] -translate-y-1/2 h-52 w-80 sm:h-64 sm:w-[26rem] lg:w-[32rem] rounded-full
                bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.12),rgba(16,185,129,0.06),transparent_70%)]"
            />

            {/* Extremo exterior izquierdo: Halo sutil que abraza la cabecera */}
            <div
              className="absolute -top-10 left-[8%] h-40 w-72 rounded-full
                bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.10),transparent_70%)]"
            />

            {/* Extremo exterior derecho: Halo sutil que abraza el extremo derecho */}
            <div
              className="absolute -bottom-8 right-[8%] h-40 w-72 rounded-full
                bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.10),transparent_70%)]"
            />

            {/* Halo difusor de contraste: resalta el texto sin opacar el paisaje andino */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-full max-w-3xl rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.65)_0%,rgba(240,253,244,0.30)_55%,transparent_75%)]"
            />
          </div>

          <h2 className="relative z-10 font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.05em] leading-[1.02] drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]">
            <span className="relative inline-block text-white whitespace-nowrap">
              Nuestros
              {/* Trazo organico artesanal debajo de Nuestros */}
              <svg
                aria-hidden
                viewBox="0 0 240 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 sm:-bottom-3.5 left-0 h-2.5 sm:h-3.5 w-full text-brand-accent/80"
              >
                <path
                  d="M2 9C55 3 130 3 238 8"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
              </svg>
            </span>{" "}
            <span className="text-brand-accent">Asesores</span>
          </h2>
        </div>

        {/* Escenario 3D interactivo con rotacion continua */}
        <div className="relative mt-0 sm:mt-1">
          <div
            className="relative w-full select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            {/* Contenedor de perspectiva 3D cilindrica */}
            <div
              className="relative mx-auto flex h-[430px] sm:h-[455px] md:h-[470px] w-full items-center justify-center overflow-visible"
              style={{ perspective: "1400px" }}
            >
              {agents.map((agent, idx) => {
                let diff = idx - activeIndex;
                if (diff > total / 2) diff -= total;
                if (diff < -total / 2) diff += total;

                const isActive = diff === 0;
                const absDiff = Math.abs(diff);

                // Geometria de punto medio: arco 3D equilibrado hacia los laterales
                let translateX = 0;
                let rotateY = 0;
                let translateZ = 0;
                let scale = 1;
                let opacity = 0;
                let zIndex = 10;
                const isInteractive = isMobile ? absDiff <= 1 : absDiff <= 2;

                if (absDiff === 0) {
                  translateX = 0;
                  rotateY = 0;
                  translateZ = isMobile ? 30 : 50;
                  scale = isMobile ? 1.02 : 1.06;
                  opacity = 1;
                  zIndex = 40;
                } else if (absDiff === 1) {
                  const sign = Math.sign(diff);
                  translateX = sign * (isMobile ? 175 : 255);
                  rotateY = -sign * (isMobile ? 16 : 20);
                  translateZ = isMobile ? -50 : -60;
                  scale = isMobile ? 0.84 : 0.88;
                  opacity = 0.94;
                  zIndex = 30;
                } else if (absDiff === 2 && !isMobile) {
                  const sign = Math.sign(diff);
                  translateX = sign * 460;
                  rotateY = -sign * 30;
                  translateZ = -150;
                  scale = 0.75;
                  opacity = 0.58;
                  zIndex = 20;
                } else {
                  opacity = 0;
                  zIndex = 5;
                  translateX = Math.sign(diff) * (isMobile ? 260 : 540);
                  scale = 0.65;
                  translateZ = -220;
                }

                const waUrl = buildWhatsAppUrl(
                  agent.phone,
                  `Hola ${agent.name}, deseo recibir asesoría inmobiliaria personalizada con Inmobiliaria Los Andes.`
                );

                return (
                  <div
                    key={agent.id}
                    onClick={(e) => {
                      if (!isActive && isInteractive) {
                        e.preventDefault();
                        goToSlide(idx);
                      }
                    }}
                    style={{
                      transform: `translate3d(calc(-50% + ${translateX}px), calc(-50% + ${absDiff * 6}px), ${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`,
                      zIndex,
                      opacity,
                      pointerEvents: isInteractive ? "auto" : "none",
                      transition:
                        "transform 0.6s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s ease, box-shadow 0.5s ease",
                      willChange: "transform, opacity",
                    }}
                    className={`group absolute top-1/2 left-1/2 flex w-[250px] sm:w-[275px] md:w-[280px] shrink-0 select-none flex-col rounded-[26px] bg-white p-3 text-neutral-900 border transition-all duration-300 cursor-pointer ${
                      isActive
                        ? "ring-2 ring-brand-accent/90 shadow-[0_25px_60px_-10px_rgba(222,88,42,0.35)] border-brand-accent/40"
                        : "ring-1 ring-white/60 shadow-xl border-neutral-200/80 hover:opacity-100 hover:ring-brand-accent/40"
                    }`}
                  >
                    {/* Marco superior de fotografia con muesca exterior superpuesta */}
                    <div className="relative">
                      <div
                        className="relative w-full h-56 sm:h-60 rounded-[20px] overflow-hidden select-none bg-neutral-100 group/photo isolate [transform:translateZ(0)]"
                        style={{
                          WebkitMaskImage: "-webkit-radial-gradient(white, black)",
                          maskImage: "radial-gradient(white, black)",
                        }}
                      >
                        {agent.avatarUrl ? (
                          <Image
                            src={agent.avatarUrl}
                            alt={agent.name}
                            fill
                            sizes="(max-width: 640px) 100vw, 280px"
                            className="object-cover object-center rounded-[20px] transition-transform duration-500 ease-out group-hover:scale-105"
                          />
                        ) : (
                          <div className="flex h-full w-full items-center justify-center rounded-[20px] bg-gradient-to-br from-[#123824] via-[#0e1713] to-[#06120b] text-white">
                            <span className="font-heading text-4xl font-black text-emerald-300">
                              {getInitials(agent.name)}
                            </span>
                          </div>
                        )}

                        {/* Barra superior con estado disponible */}
                        <div className="relative z-20 w-full flex items-center justify-between p-3">
                          <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 bg-white/95 text-emerald-800 border border-emerald-500/20 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Disponible
                          </span>
                        </div>
                      </div>

                      {/* Notch curvo invertido blanco fusionado sobre la base */}
                      <div className="absolute -bottom-[2px] left-1/2 -translate-x-1/2 z-10 pointer-events-none flex items-end justify-center">
                        <svg
                          viewBox="0 0 180 40"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                          className="w-38 sm:w-40 h-[32px] sm:h-[34px] text-white"
                        >
                          <path
                            d="M 0 38 C 16 36 20 18 32 6 C 38 0 46 0 54 0 L 126 0 C 134 0 142 0 148 6 C 160 18 164 36 180 38 L 180 40 L 0 40 Z"
                            fill="currentColor"
                          />
                        </svg>
                        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 text-center pointer-events-auto">
                          <span className="text-[11.5px] font-bold text-brand-primary font-heading tracking-wide block whitespace-nowrap">
                            {agent.propertiesCount} {agent.propertiesCount === 1 ? "Inmueble" : "Inmuebles"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Nombre del asesor */}
                    <div className="mt-3 px-1 text-center">
                      <h3 className="text-base sm:text-lg font-black text-neutral-900 font-heading truncate leading-snug group-hover:text-brand-accent transition-colors">
                        {agent.name}
                      </h3>
                    </div>

                    {/* Accion directa de contacto por WhatsApp */}
                    <div className="mt-2.5 px-0.5">
                      <a
                        href={waUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => {
                          if (!isActive) {
                            e.preventDefault();
                            e.stopPropagation();
                            goToSlide(idx);
                          }
                        }}
                        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-brand-accent hover:bg-[#c94b21] py-2.5 px-3 text-xs font-bold text-white shadow-sm shadow-brand-accent/20 hover:shadow-md transition-all duration-300 active:scale-95 cursor-pointer"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        <span>Contactar Asesor</span>
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Indicador de puntos interactivo con píldora animada */}
          <div className="flex items-center justify-center gap-2 pt-4">
            {agents.map((agent, idx) => (
              <button
                key={agent.id}
                type="button"
                onClick={() => goToSlide(idx)}
                aria-label={`Ver asesor ${agent.name}`}
                className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                  activeIndex === idx
                    ? "w-8 bg-brand-accent shadow-sm shadow-brand-accent/40"
                    : "w-2 bg-white/40 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}