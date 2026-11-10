"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { X, Building2, Edit3 } from "lucide-react";
import { PropertyForm, InitialPropertyData } from "./PropertyForm";

const emptySubscribe = () => () => {};

export interface AgentOption {
  id: string;
  name: string;
  position: string;
  avatarUrl?: string | null;
}

interface PropertyModalProps {
  isOpen: boolean;
  onClose: () => void;
  property?: InitialPropertyData | null;
  agents: AgentOption[];
  defaultAgentId?: string;
  onSuccess?: () => void;
}

// Modal espacioso para crear o editar fichas completas de propiedades
export function PropertyModal({
  isOpen,
  onClose,
  property,
  agents,
  defaultAgentId,
  onSuccess,
}: PropertyModalProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !isClient) return null;

  const isEditing = Boolean(property?.id);

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] bg-black/60 flex sm:items-center sm:justify-center sm:p-6 overflow-hidden animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full h-full h-dvh sm:h-[90vh] sm:max-h-[92vh] sm:max-w-4xl bg-gradient-to-b from-[#FAF7F2] via-[#F3ECE0] to-[#EBE0D2] rounded-none sm:rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col border-0 animate-in fade-in zoom-in-[0.98] duration-100 ease-out transform-gpu">
        {/* Capa de fondo con relieve topográfico andino persistente en todo el modal */}
        <div
          aria-hidden="true"
          className="absolute inset-0 pointer-events-none overflow-hidden z-0"
        >
          {/* Orbes de luz ambiental cálida nativos sin blur */}
          <div className="absolute -top-28 -right-24 w-[480px] h-[480px] rounded-full bg-[radial-gradient(circle,rgba(242,116,65,0.08)_0%,transparent_70%)]" />
          <div className="absolute top-1/2 -left-32 -translate-y-1/2 w-[520px] h-[520px] rounded-full bg-[radial-gradient(circle,rgba(217,179,130,0.10)_0%,transparent_70%)]" />
          <div className="absolute -bottom-28 right-1/4 w-[450px] h-[450px] rounded-full bg-[radial-gradient(circle,rgba(242,116,65,0.08)_0%,transparent_70%)]" />

          {/* Patrón SVG de curvas de nivel topográficas andinas estilo grabado cartográfico continuo */}
          <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern
                id="modal-andean-topography"
                width="360"
                height="360"
                patternUnits="userSpaceOnUse"
              >
                <g stroke="#8E7A60" strokeWidth="0.95" fill="none" opacity="0.32">
                  {/* Curvas concéntricas del pico principal */}
                  <path d="M 125 135 C 135 120 160 125 165 140 C 170 155 152 165 140 162 C 128 160 120 148 125 135 Z" />
                  <path d="M 110 125 C 125 102 175 108 185 132 C 195 158 168 180 140 178 C 114 176 98 150 110 125 Z" />
                  <path d="M 92 112 C 115 80 192 88 205 125 C 218 165 182 198 140 195 C 100 192 75 152 92 112 Z" />
                  <path d="M 75 98 C 105 58 212 68 228 118 C 244 172 198 215 140 210 C 85 205 52 152 75 98 Z" />
                  <path d="M 56 82 C 95 38 232 48 250 110 C 268 178 214 232 140 226 C 68 220 28 150 56 82 Z" />
                  <path d="M 38 68 C 85 18 252 28 272 102 C 292 185 230 248 140 242 C 50 236 6 148 38 68 Z" />

                  {/* Relieve del collado secundario */}
                  <path d="M 265 252 C 272 242 290 245 292 255 C 295 265 282 274 272 272 C 262 270 258 260 265 252 Z" />
                  <path d="M 250 240 C 265 220 305 228 312 248 C 318 268 296 290 272 286 C 250 282 238 258 250 240 Z" />
                  <path d="M 232 225 C 255 198 322 208 332 238 C 342 272 312 305 272 300 C 235 295 218 258 232 225 Z" />

                  {/* Curvas topográficas transversales continuas */}
                  <path d="M 0 35 C 70 35 120 22 180 25 C 240 28 290 35 360 35" />
                  <path d="M 0 195 C 70 195 90 218 135 218 C 180 218 225 195 290 195 C 325 195 345 195 360 195" />
                  <path d="M 0 325 C 70 325 145 345 215 338 C 285 330 320 325 360 325" />
                  <path d="M 22 0 C 22 70 10 135 12 180 C 14 235 22 290 22 360" />
                  <path d="M 180 0 C 180 60 195 105 195 160 C 195 225 180 295 180 360" />
                  <path d="M 338 0 C 338 70 350 135 348 180 C 345 235 338 290 338 360" />

                  {/* Arcos concéntricos en esquinas para ensamble continuo */}
                  <path d="M 0 22 C 12 22 22 12 22 0" />
                  <path d="M 338 0 C 338 12 348 22 360 22" />
                  <path d="M 0 338 C 12 338 22 348 22 360" />
                  <path d="M 338 360 C 338 348 348 338 360 338" />

                  <path d="M 0 50 C 28 50 50 28 50 0" />
                  <path d="M 310 0 C 310 28 332 50 360 50" />
                  <path d="M 0 310 C 28 310 50 332 50 360" />
                  <path d="M 310 360 C 310 332 332 310 360 310" />
                </g>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#modal-andean-topography)" />
          </svg>
        </div>

        {/* Cabecera terracota ladrillo andino */}
        <div className="bg-gradient-to-r from-brand-header-from via-brand-header-via to-brand-header-to text-white p-3.5 sm:p-6 flex items-center justify-between shrink-0 z-20 shadow-md">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-2xl bg-white/10 flex items-center justify-center text-brand-accent border border-white/10 shrink-0">
              {isEditing ? <Edit3 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-accent" /> : <Building2 className="w-4 h-4 sm:w-5 sm:h-5 text-brand-accent" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-sm sm:text-xl font-black text-white font-heading tracking-tight truncate">
                {isEditing ? "Editar Ficha de Inmueble" : "Registrar Nuevo Inmueble"}
              </h2>
              <p className="text-[11px] sm:text-xs text-white/70 truncate">
                {property?.title || "Completa los datos técnicos y fotografías de la propiedad."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0 ml-2 cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario integrado que flota sobre el fondo andino continuo y mantiene el pie fijo */}
        <PropertyForm
          key={property?.id || "new-property"}
          initialData={property || undefined}
          agents={agents}
          isEditing={isEditing}
          defaultAgentId={defaultAgentId}
          hideHeader={true}
          onCancel={onClose}
          onSuccess={() => {
            onSuccess?.();
            onClose();
          }}
        />
      </div>
    </div>,
    document.body
  );
}

