"use client";

import { useEffect, useRef } from "react";

// Fondo atmosferico interactivo al scroll con destellos y orbes de luz calida naranja
export function CatalogBannerDecor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const flareTopRightRef = useRef<HTMLDivElement>(null);
  const flareBottomLeftRef = useRef<HTMLDivElement>(null);
  const flareCenterRef = useRef<HTMLDivElement>(null);
  const flareRightEdgeRef = useRef<HTMLDivElement>(null);
  const shimmerBeamRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const flareTopRight = flareTopRightRef.current;
    const flareBottomLeft = flareBottomLeftRef.current;
    const flareCenter = flareCenterRef.current;
    const flareRightEdge = flareRightEdgeRef.current;
    const shimmerBeam = shimmerBeamRef.current;

    let target = 0.5;
    let current = 0.5;
    let frame = 0;

    const paint = (progress: number) => {
      // d va de -0.5 (arriba del viewport) a +0.5 (abajo del viewport)
      const d = progress - 0.5;
      const centerFactor = Math.max(0, 1 - Math.abs(d) * 2);
      const grow = 1 + Math.abs(d) * 0.28;

      // Destello 1 (naranja terracota superior derecho): viaja diagonalmente al scroll
      if (flareTopRight) {
        flareTopRight.style.transform = `translate3d(${d * -320}px, ${d * 240}px, 0) scale(${grow})`;
      }

      // Destello 2 (ambar dorado inferior izquierdo): viaja en contra-fase
      if (flareBottomLeft) {
        flareBottomLeft.style.transform = `translate3d(${d * 340}px, ${d * -220}px, 0) scale(${grow})`;
      }

      // Destello 3 (luz naranja calida central): se intensifica y expande al cruzar el centro
      if (flareCenter) {
        flareCenter.style.transform = `translate3d(calc(-50% + ${d * 160}px), ${d * -100}px, 0) scale(${0.85 + centerFactor * 0.45})`;
        flareCenter.style.opacity = String(0.45 + centerFactor * 0.45);
      }

      // Destello 4 (acento calido lateral derecho): asciende suavemente con el scroll
      if (flareRightEdge) {
        flareRightEdge.style.transform = `translate3d(${d * -180}px, ${d * -140}px, 0) scale(${0.9 + centerFactor * 0.25})`;
      }

      // Haz de luz horizontal que barre de izquierda a derecha al hacer scroll
      if (shimmerBeam) {
        shimmerBeam.style.transform = `translate3d(${-90 + progress * 280}%, 0, 0)`;
        shimmerBeam.style.opacity = String(0.28 + centerFactor * 0.45);
      }
    };

    paint(0.5);

    // En dispositivos moviles, renderizar estatico para no sobrecargar el hilo del compositor
    if (window.innerWidth < 768) {
      return;
    }

    const tick = () => {
      current += (target - current) * 0.09;

      if (Math.abs(target - current) < 0.0004) {
        current = target;
        frame = 0;
      } else {
        frame = requestAnimationFrame(tick);
      }

      paint(current);
    };

    const measure = () => {
      const rect = layer.getBoundingClientRect();
      const viewport = window.innerHeight || 1;
      const raw = (viewport - rect.top) / (viewport + rect.height);

      target = Math.min(1, Math.max(0, raw));

      if (!frame) {
        frame = requestAnimationFrame(tick);
      }
    };

    measure();
    window.addEventListener("scroll", measure, { passive: true });
    document.addEventListener("scroll", measure, { capture: true, passive: true });
    window.addEventListener("resize", measure);

    return () => {
      window.removeEventListener("scroll", measure);
      document.removeEventListener("scroll", measure, { capture: true });
      window.removeEventListener("resize", measure);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    <div
      ref={layerRef}
      aria-hidden
      className="pointer-events-none absolute inset-0 overflow-hidden"
    >
      {/* Destello 1: Naranja terracota superior derecho, reactivo al scroll */}
      <div
        ref={flareTopRightRef}
        style={{ willChange: "transform" }}
        className="absolute -top-32 right-[-6rem] h-[32rem] w-[32rem] rounded-full
          bg-[radial-gradient(circle_at_50%_50%,rgba(222,88,42,0.38),rgba(249,115,22,0.22),transparent_70%)]
          blur-3xl"
      />

      {/* Destello 2: Ambar dorado y fuego inferior izquierdo, reactivo en contra-fase */}
      <div
        ref={flareBottomLeftRef}
        style={{ willChange: "transform" }}
        className="absolute -bottom-36 left-[-6rem] h-[34rem] w-[34rem] rounded-full
          bg-[radial-gradient(circle_at_50%_50%,rgba(245,158,11,0.40),rgba(222,88,42,0.28),transparent_70%)]
          blur-3xl"
      />

      {/* Destello 3: Nucleo central naranja soleado que florece al pasar por el centro */}
      <div
        ref={flareCenterRef}
        style={{ willChange: "transform, opacity" }}
        className="absolute top-1/4 left-1/2 h-[26rem] w-[26rem] -translate-x-1/2 rounded-full
          bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.85),rgba(254,215,170,0.6),rgba(222,88,42,0.38),transparent_70%)]
          blur-2xl opacity-50"
      />

      {/* Destello 4: Resplandor calido lateral derecho que ilumina la zona de estadisticas */}
      <div
        ref={flareRightEdgeRef}
        style={{ willChange: "transform" }}
        className="absolute top-1/3 right-[15%] h-80 w-80 rounded-full
          bg-[radial-gradient(circle_at_50%_50%,rgba(249,115,22,0.32),rgba(222,88,42,0.20),transparent_70%)]
          blur-3xl"
      />

      {/* Haz suave de luz horizontal calida que barre segun bajamos o subimos */}
      <div
        ref={shimmerBeamRef}
        style={{
          willChange: "transform, opacity",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,240,225,0.7) 45%, rgba(254,215,170,0.5) 55%, transparent 100%)",
          filter: "blur(22px)",
        }}
        className="absolute inset-y-0 left-0 w-[50%] opacity-40"
      />
    </div>
  );
}
