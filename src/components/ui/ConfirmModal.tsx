"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { AlertTriangle, Trash2, HelpCircle, X, Loader2 } from "lucide-react";

const emptySubscribe = () => () => {};

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
  itemHighlight?: string;
}

// Modal de confirmacion reutilizable premium para operaciones criticas de UI
export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  variant = "warning",
  isLoading = false,
  itemHighlight,
}: ConfirmModalProps) {
  const isClient = useSyncExternalStore(emptySubscribe, () => true, () => false);

  // Cierre automatico al presionar tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
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
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !isClient) return null;

  const variantStyles = {
    danger: {
      icon: Trash2,
      iconContainer: "bg-red-50 text-red-600 border-red-200/80 shadow-red-500/10",
      button: "bg-red-600 hover:bg-red-700 text-white shadow-red-600/25",
    },
    warning: {
      icon: AlertTriangle,
      iconContainer: "bg-amber-50 text-amber-600 border-amber-200/80 shadow-amber-500/10",
      button: "bg-brand-accent hover:bg-[#c94b21] text-white shadow-brand-accent/25",
    },
    info: {
      icon: HelpCircle,
      iconContainer: "bg-emerald-50 text-emerald-600 border-emerald-200/80 shadow-emerald-500/10",
      button: "bg-brand-primary hover:bg-[#132c1c] text-white shadow-brand-primary/25",
    },
  };

  const currentVariant = variantStyles[variant];
  const Icon = currentVariant.icon;

  return createPortal(
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isLoading) onClose();
      }}
    >
      <div className="relative w-full max-w-md bg-white rounded-3xl border border-neutral-100 shadow-2xl p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-200">
        {/* Cabecera del modal: Icono tematico y boton cerrar */}
        <div className="flex items-start justify-between gap-4">
          <div
            className={`w-12 h-12 rounded-2xl border flex items-center justify-center shadow-lg shrink-0 ${currentVariant.iconContainer}`}
          >
            <Icon className="w-6 h-6" strokeWidth={2.2} />
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors disabled:opacity-50"
            title="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Informacion de la accion */}
        <div className="space-y-2">
          <h3 className="text-lg sm:text-xl font-bold text-brand-primary font-heading tracking-tight leading-snug">
            {title}
          </h3>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            {description}
          </p>
        </div>

        {/* Resaltado del elemento afectado si existe */}
        {itemHighlight && (
          <div className="p-3 rounded-2xl bg-neutral-50 border border-neutral-100 text-xs font-semibold text-brand-primary truncate">
            {itemHighlight}
          </div>
        )}

        {/* Botones de confirmacion y cancelacion */}
        <div className="pt-2 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs sm:text-sm font-semibold text-text-secondary hover:bg-neutral-100 hover:text-text-primary transition-all active:scale-95 disabled:opacity-50"
          >
            {cancelText}
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={isLoading}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold shadow-md transition-all active:scale-95 disabled:opacity-50 ${currentVariant.button}`}
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

