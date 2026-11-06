"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Image from "next/image";
import { MessageCircle, ChevronLeft, ChevronRight, UserCheck } from "lucide-react";

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

// Generador de iniciales para avatar de respaldo
function getInitials(name: string): string {
  if (!name) return "AS";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

// Escaparate de asesores con fondo Parallax arquitectonico, tarjetas luminosas y titular heroico
export function FeaturedAgentsSection({ agents, totalAgents }: FeaturedAgentsSectionProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const parallaxRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  // Efecto Parallax desacoplado a 60fps acelerado por hardware
  useEffect(() => {
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

  // Evaluacion continua de scroll
  const checkScroll = useCallback(() => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 15);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 15);

    const cardWidth = 295;
    const index = Math.round(scrollLeft / cardWidth);
    setActiveIndex(Math.max(0, Math.min(index, agents.length - 1)));
  }, [agents.length]);

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  // Desplazamiento horizontal adaptado a dimensiones compactas
  const scroll = (direction: "left" | "right") => {
    if (!scrollRef.current) return;
    const amount = 295;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  // Navegacion directa desde puntos inferiores
  const scrollToIndex = (index: number) => {
    if (!scrollRef.current) return;
    const amount = 295;
    scrollRef.current.scrollTo({
      left: index * amount,
      behavior: "smooth",
    });
  };

  if (agents.length === 0) return null;

  return (
    <section
      ref={sectionRef}
      id="asesores"
      className="relative isolate overflow-hidden bg-[#122e1f] py-14 sm:py-18 lg:py-20"
    >
      {/* Capa de fondo con efecto Parallax desacoplado a 60fps */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          ref={parallaxRef}
          className="absolute -top-24 inset-x-0 h-[calc(100%+12rem)] w-full will-change-transform"
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
          <div className="absolute top-1/4 left-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(16,185,129,0.18),transparent_70%)] blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(circle,rgba(5,150,105,0.15),transparent_70%)] blur-3xl" />
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabecera monumental con sistema de iluminacion bilateral verde esmeralda */}
        <div className="relative mx-auto max-w-5xl text-center pb-10 sm:pb-14">
          {/* Sistema de luces bilateral verde: destellos esmeralda a los lados y centro limpio */}
          <div aria-hidden className="pointer-events-none absolute inset-0 overflow-visible">
            {/* Flanco lateral izquierdo: Destello esmeralda vivo expandido */}
            <div
              className="absolute top-1/2 -left-12 sm:left-[-2rem] md:left-[2%] -translate-y-1/2 h-52 w-80 sm:h-64 sm:w-[26rem] lg:w-[32rem] rounded-full
                bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.22),rgba(5,150,105,0.10),transparent_70%)]
                blur-3xl"
            />

            {/* Flanco lateral derecho: Resplandor menta y teal expandido */}
            <div
              className="absolute top-1/2 -right-12 sm:right-[-2rem] md:right-[2%] -translate-y-1/2 h-52 w-80 sm:h-64 sm:w-[26rem] lg:w-[32rem] rounded-full
                bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.20),rgba(16,185,129,0.10),transparent_70%)]
                blur-3xl"
            />

            {/* Extremo exterior izquierdo: Halo sutil que abraza la cabecera */}
            <div
              className="absolute -top-10 left-[8%] h-40 w-72 rounded-full
                bg-[radial-gradient(circle_at_center,rgba(52,211,153,0.18),transparent_70%)]
                blur-2xl"
            />

            {/* Extremo exterior derecho: Halo sutil que abraza el extremo derecho */}
            <div
              className="absolute -bottom-8 right-[8%] h-40 w-72 rounded-full
                bg-[radial-gradient(circle_at_center,rgba(45,212,191,0.18),transparent_70%)]
                blur-2xl"
            />

            {/* Halo difusor de contraste: resalta el texto sin opacar el paisaje andino */}
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-36 w-full max-w-3xl rounded-full
                bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.65)_0%,rgba(240,253,244,0.30)_55%,transparent_75%)]
                blur-2xl"
            />
          </div>

          <h2 className="relative z-10 font-heading text-4xl sm:text-6xl md:text-7xl lg:text-8xl font-black tracking-[-0.05em] leading-[1.02] drop-shadow-[0_2px_12px_rgba(255,255,255,0.7)]">
            <span className="relative inline-block text-[#082a19] whitespace-nowrap">
              Nuestros
              {/* Trazo organico artesanal en verde debajo de Nuestros */}
              <svg
                aria-hidden
                viewBox="0 0 240 14"
                preserveAspectRatio="none"
                className="absolute -bottom-2 sm:-bottom-3.5 left-0 h-2.5 sm:h-3.5 w-full text-emerald-800/80"
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

        {/* Controles de navegacion flotantes cuando hay mas de 3 asesores */}
        <div className="relative">
          {agents.length > 3 && (
            <div className="hidden sm:flex items-center justify-end gap-2 mb-4">
              <button
                type="button"
                onClick={() => scroll("left")}
                disabled={!canScrollLeft}
                aria-label="Ver asesor anterior"
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-800 shadow-sm backdrop-blur-md transition-all duration-300 ${
                  canScrollLeft
                    ? "hover:bg-brand-accent hover:text-white hover:border-brand-accent hover:scale-105 active:scale-95 cursor-pointer"
                    : "opacity-35 cursor-not-allowed"
                }`}
              >
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button
                type="button"
                onClick={() => scroll("right")}
                disabled={!canScrollRight}
                aria-label="Ver asesor siguiente"
                className={`flex h-10 w-10 items-center justify-center rounded-full border border-neutral-200/90 bg-white text-neutral-800 shadow-sm backdrop-blur-md transition-all duration-300 ${
                  canScrollRight
                    ? "hover:bg-brand-accent hover:text-white hover:border-brand-accent hover:scale-105 active:scale-95 cursor-pointer"
                    : "opacity-35 cursor-not-allowed"
                }`}
              >
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}

          {/* Riel horizontal con tarjetas luminosas blancas y notch integrado */}
          <div
            ref={scrollRef}
            onScroll={checkScroll}
            className="flex gap-6 overflow-x-auto px-4 py-6 justify-start md:justify-center no-scrollbar snap-x snap-mandatory scroll-smooth"
            style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
          >
            {agents.map((agent) => {
              const cleanPhone = (agent.phone || "").replace(/\D/g, "");
              const waUrl = `https://wa.me/${cleanPhone || "584140000000"}?text=${encodeURIComponent(
                `Hola ${agent.name}, deseo recibir asesoría inmobiliaria personalizada con Inmobiliaria Los Andes.`
              )}`;

              return (
                <div
                  key={agent.id}
                  className="group relative flex w-[250px] sm:w-[275px] shrink-0 snap-start flex-col rounded-[26px] bg-white p-3 text-neutral-900 border border-neutral-200/80 shadow-[0_8px_24px_rgba(0,0,0,0.05)] transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-accent/40 hover:shadow-[0_16px_36px_rgba(222,88,42,0.12)]"
                >
                  {/* Marco superior de fotografia con muesca exterior superpuesta sin costuras ni cortes */}
                  <div className="relative">
                    <div className="relative w-full h-56 sm:h-60 rounded-[20px] overflow-hidden select-none bg-neutral-100 group/photo">
                      {agent.avatarUrl ? (
                        <Image
                          src={agent.avatarUrl}
                          alt={agent.name}
                          fill
                          sizes="(max-width: 640px) 100vw, 275px"
                          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-105"
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#123824] via-[#0e1713] to-[#06120b] text-white">
                          <span className="font-heading text-4xl font-black text-emerald-300">
                            {getInitials(agent.name)}
                          </span>
                        </div>
                      )}

                      {/* Barra superior con estado disponible */}
                      <div className="relative z-20 w-full flex items-center justify-between p-3">
                        <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 backdrop-blur-md bg-white/95 text-emerald-800 border border-emerald-500/20 shadow-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Disponible
                        </span>
                      </div>
                    </div>

                    {/* Notch curvo invertido blanco fusionado sobre la base sin lineas ni costuras */}
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

                  {/* Nombre del asesor sin espacio muerto */}
                  <div className="mt-3 px-1 text-center">
                    <h3 className="text-base sm:text-lg font-black text-neutral-900 font-heading truncate leading-snug group-hover:text-brand-accent transition-colors">
                      {agent.name}
                    </h3>
                  </div>

                  {/* Accion directa de contacto por WhatsApp ajustada sin huecos blancos */}
                  <div className="mt-2.5 px-0.5">
                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
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

          {/* Indicador de puntos interactivo */}
          {agents.length > 3 ? (
            <div className="flex items-center justify-center gap-2 pt-2">
              {agents.map((agent, idx) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Ver asesor ${agent.name}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? "w-7 bg-brand-accent"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          ) : (
            <div className="flex md:hidden items-center justify-center gap-2 pt-2">
              {agents.map((agent, idx) => (
                <button
                  key={agent.id}
                  type="button"
                  onClick={() => scrollToIndex(idx)}
                  aria-label={`Ver asesor ${agent.name}`}
                  className={`h-2 rounded-full transition-all duration-300 cursor-pointer ${
                    activeIndex === idx
                      ? "w-7 bg-brand-accent"
                      : "w-2 bg-neutral-300 hover:bg-neutral-400"
                  }`}
                />
              ))}
            </div>
          )}
        </div>

        {/* Insignia de respaldo del equipo completo */}
        {totalAgents && totalAgents > agents.length && (
          <div className="mt-8 text-center">
            <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-1.5 text-xs font-semibold text-neutral-800 border border-neutral-200/90 shadow-xs backdrop-blur-sm">
              <UserCheck className="h-3.5 w-3.5 text-brand-primary" />
              <span>Equipo de {totalAgents} profesionales certificados en Trujillo</span>
            </span>
          </div>
        )}
      </div>
    </section>
  );
}