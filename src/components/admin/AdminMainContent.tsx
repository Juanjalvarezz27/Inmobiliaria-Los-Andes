"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

interface AdminMainContentProps {
  children: React.ReactNode;
}

// Contenedor principal del panel con restablecimiento automatico de scroll al tope superior en navegacion
export function AdminMainContent({ children }: AdminMainContentProps) {
  const pathname = usePathname();
  const mainRef = useRef<HTMLElement>(null);

  useEffect(() => {
    // Restablece el scroll del contenedor independiente en pantallas medianas y grandes
    if (mainRef.current) {
      mainRef.current.scrollTo({ top: 0, left: 0, behavior: "instant" });
    }
    // Restablece el scroll de la ventana global para vista movil
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [pathname]);

  return (
    <main
      ref={mainRef}
      className="flex-1 min-w-0 md:h-full md:overflow-y-auto p-6 sm:p-10 transition-all duration-300"
    >
      <div className="max-w-6xl mx-auto">{children}</div>
    </main>
  );
}

