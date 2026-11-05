"use client";

import { useEffect, useRef, useState } from "react";

interface AnimatedCountProps {
  value: number;
}

// Cuenta ascendente la primera vez que la cifra entra en pantalla.
// Si ya estaba visible al cargar la pagina se muestra el valor final de una vez,
// para evitar el salto de "valor real -> 0 -> valor real".
export function AnimatedCount({ value }: AnimatedCountProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    // Solo animamos cuando la cifra arranca por debajo del pliegue.
    if (node.getBoundingClientRect().top < window.innerHeight * 0.9) return;

    let frame = 0;
    let started = false;

    const count = () => {
      const duration = 1500;
      const start = performance.now();

      const tick = (now: number) => {
        const progress = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - progress, 3);

        setDisplay(Math.round(value * eased));

        if (progress < 1) {
          frame = requestAnimationFrame(tick);
        }
      };

      frame = requestAnimationFrame(tick);
    };

    const observer = new IntersectionObserver(
      (entries) => {
        if (started) return;

        for (const entry of entries) {
          if (entry.isIntersecting) {
            started = true;
            setDisplay(0);
            count();
            observer.disconnect();
          }
        }
      },
      { threshold: 0.5 },
    );

    observer.observe(node);

    return () => {
      observer.disconnect();
      if (frame) cancelAnimationFrame(frame);
    };
  }, [value]);

  return <span ref={ref}>{display.toLocaleString("es-VE")}</span>;
}
