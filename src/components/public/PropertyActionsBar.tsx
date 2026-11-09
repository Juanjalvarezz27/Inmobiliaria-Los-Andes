"use client";

import Link from "next/link";
import { ArrowLeft, Share2, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface PropertyActionsBarProps {
  propertyTitle: string;
  propertyType: string;
}

// Barra de navegacion superior y acciones para la ficha de propiedad
export function PropertyActionsBar({ propertyTitle, propertyType }: PropertyActionsBarProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success("Enlace copiado", {
        description: "El enlace de esta propiedad se ha copiado al portapapeles.",
        duration: 3000,
      });
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("No se pudo copiar el enlace");
    }
  };

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 pb-2">
      {/* Migas de pan / Volver */}
      <div className="flex items-center gap-2 text-xs font-bold text-neutral-500">
        <Link
          href="/#catalogo"
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white text-neutral-700 hover:text-brand-primary border border-[#DFD1B8] shadow-[0_4px_14px_-3px_rgba(26,59,38,0.08),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(26,59,38,0.14)] transition-all active:scale-95 group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Volver al Catálogo</span>
        </Link>
      </div>

      {/* Boton Compartir Ficha */}
      <button
        type="button"
        onClick={handleCopyLink}
        className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-white text-neutral-700 hover:text-brand-accent border border-[#DFD1B8] shadow-[0_4px_14px_-3px_rgba(26,59,38,0.08),0_1px_3px_rgba(0,0,0,0.03)] hover:shadow-[0_8px_20px_-4px_rgba(222,88,42,0.15)] transition-all active:scale-95 cursor-pointer text-xs font-bold"
        title="Copiar enlace de esta propiedad"
      >
        {copied ? (
          <>
            <Check className="w-3.5 h-3.5 text-emerald-600" />
            <span className="text-emerald-700">Enlace Copiado</span>
          </>
        ) : (
          <>
            <Share2 className="w-3.5 h-3.5 text-neutral-500" />
            <span>Compartir</span>
          </>
        )}
      </button>
    </div>
  );
}

