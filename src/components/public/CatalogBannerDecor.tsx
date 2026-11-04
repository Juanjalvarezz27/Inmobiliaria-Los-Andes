"use client";

import { useEffect, useRef } from "react";

// Capa decorativa del banner: los resplandores y el brillo acompanan el scroll.
// Los transforms se aplican directo por JS (sin depender de clases CSS externas)
// y se interpolan con lerp para que el movimiento se sienta continuo.
export function CatalogBannerDecor() {
  const layerRef = useRef<HTMLDivElement>(null);
  const blobARef = useRef<HTMLDivElement>(null);
  const blobBRef = useRef<HTMLDivElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const layer = layerRef.current;
    if (!layer) return;

    const blobA = blobARef.current;
    const blobB = blobBRef.current;
    const glow = glowRef.current;
    const shine = shineRef.current;

    const paint = (progress: number) => {
      const d = progress - 0.5;
      const grow = 1 + Math.abs(d) * 0.18;

      if (blobA) {
        blobA.style.transform = `translate3d(0, ${d * -260}px, 0) scale(${grow})`;
      }
      if (blobB) {
        blobB.style.transform = `translate3d(0, ${d * 330}px, 0) scale(${grow})`;
      }
      if (glow) {
        glow.style.transform = `translate3d(calc(-50% + ${d * 150}px), ${d * -120}px, 0) scale(${grow})`;
      }
      if (shine) {
        // Recorre toda la franja: fuera de cuadro en los extremos, centrado en 0.5
        shine.style.transform = `translate3d(${-100 + progress * 310}%, 0, 0)`;
        // Aparece con fuerza al cruzar el centro y se desvanece en los bordes
        shine.style.opacity = String(0.35 + (1 - Math.abs(d) * 2) * 0.65);
      }
    };

    // Estado neutro (franja centrada) mientras no haya scroll
    paint(0.5);

    let target = 0.5;
    let current = 0.5;
    let frame = 0;

    const tick = () => {
      current += (target - current) * 0.1;

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
    // El listener en captura cubre tanto el scroll de la ventana como el de
    // cualquier contenedor con scroll propio.
    window.addEventListener("scroll", measure, { passive: true });
    document.addEventListener("scroll", measure, { passive: true, capture: true });
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
      {/* Textura de puntos sutil sobre el degradado */}
      <div className="absolute inset-0 opacity-[0.16] [background-image:radial-gradient(circle_at_1px_1px,#ffffff_1px,transparent_0)] [background-size:22px_22px]" />

      {/* Resplandores que se desplazan a distintas velocidades con el scroll */}
      <div
        ref={blobARef}
        style={{ willChange: "transform" }}
        className="absolute -top-28 -left-24 h-80 w-80 rounded-full bg-white/35 blur-3xl"
      />
      <div
        ref={blobBRef}
        style={{ willChange: "transform" }}
        className="absolute -bottom-36 right-[-4rem] h-96 w-96 rounded-full bg-[#ffc79c]/55 blur-3xl"
      />
      <div
        ref={glowRef}
        style={{ willChange: "transform" }}
        className="absolute top-1/3 left-1/2 h-64 w-64 rounded-full bg-[#8a2a0b]/25 blur-3xl"
      />

      {/* Brillo suave que recorre la franja segun el avance del scroll */}
      <div
        ref={shineRef}
        style={{
          willChange: "transform, opacity",
          background:
            "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.06) 20%, rgba(255,255,255,0.32) 50%, rgba(255,255,255,0.06) 80%, transparent 100%)",
          filter: "blur(12px)",
        }}
        className="absolute inset-y-0 left-0 w-[50%]"
      />
    </div>
  );
}
