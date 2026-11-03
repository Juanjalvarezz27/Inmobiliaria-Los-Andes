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
      className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-in fade-in duration-100"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="relative w-full max-w-4xl bg-brand-primary rounded-3xl shadow-2xl shadow-black/50 overflow-hidden flex flex-col max-h-[92vh] border-0 animate-in fade-in zoom-in-[0.98] duration-100 ease-out transform-gpu my-auto">
        {/* Cabecera solida verde de marca */}
        <div className="bg-gradient-to-r from-[#122b1c] via-[#1a3b26] to-[#0e2115] text-white p-5 sm:p-6 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center text-emerald-400 border border-white/10 shrink-0">
              {isEditing ? <Edit3 className="w-5 h-5 text-brand-accent" /> : <Building2 className="w-5 h-5 text-emerald-400" />}
            </div>
            <div className="min-w-0">
              <h2 className="text-lg sm:text-xl font-black text-white font-heading tracking-tight truncate">
                {isEditing ? "Editar Ficha de Inmueble" : "Registrar Nuevo Inmueble"}
              </h2>
              <p className="text-xs text-white/70 truncate">
                {property?.title || "Completa los datos técnicos y fotografías de la propiedad."}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors shrink-0 ml-3"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo desplazable con el formulario integrado directamente */}
        <div className="flex-1 overflow-y-auto p-6 sm:p-8 overscroll-contain bg-white">
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
      </div>
    </div>,
    document.body
  );
}

