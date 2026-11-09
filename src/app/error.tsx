"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RotateCcw, Home } from "lucide-react";

// Manejador global de excepciones no controladas para evitar pantallas en blanco
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Error no controlado capturado por el boundary:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-ui-background">
      <div className="max-w-md w-full bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200 shadow-2xl text-center space-y-6">
        <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto shadow-md">
          <AlertTriangle className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="text-xl sm:text-2xl font-black text-brand-primary font-heading">
            Ocurrió un inconveniente temporal
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            No se pudo completar la solicitud. Esto puede deberse a una interrupción momentánea de conexión.
          </p>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-brand-primary hover:bg-[#122b1c] text-white text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reintentar</span>
          </button>

          <Link
            href="/"
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs sm:text-sm font-bold transition-all active:scale-95"
          >
            <Home className="w-4 h-4" />
            <span>Volver al Inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}

