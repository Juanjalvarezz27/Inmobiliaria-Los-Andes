"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Hash, X, Home as HomeIcon } from "lucide-react";

export interface MoveModalItem {
  property: {
    id: string;
    title: string;
    coverUrl?: string | null;
  };
  currentPosition: number;
}

interface MovePositionModalProps {
  item: MoveModalItem | null;
  totalProperties: number;
  pageSize: number;
  isPending: boolean;
  onClose: () => void;
  onConfirm: (propertyId: string, targetPosition: number) => void;
}

// Modal interactivo para reubicar rapidamente un inmueble a una posicion especifica
export function MovePositionModal({
  item,
  totalProperties,
  pageSize,
  isPending,
  onClose,
  onConfirm,
}: MovePositionModalProps) {
  const [targetPositionInput, setTargetPositionInput] = useState<string>("");

  useEffect(() => {
    if (item) {
      setTargetPositionInput(item.currentPosition.toString());
    }
  }, [item]);

  if (!item) return null;

  const parsed = parseInt(targetPositionInput, 10);
  const isValidPosition = !isNaN(parsed) && parsed >= 1 && parsed <= totalProperties;
  const targetPage = isValidPosition ? Math.ceil(parsed / pageSize) : null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150 overflow-hidden">
      <div className="bg-white rounded-3xl border border-neutral-200 shadow-2xl max-w-md w-full p-4 sm:p-6 space-y-4 sm:space-y-5 animate-in zoom-in-95 duration-150 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between gap-3 border-b border-neutral-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-orange-100 text-brand-accent flex items-center justify-center font-bold text-sm">
              <Hash className="w-4 h-4" />
            </span>
            <div>
              <h3 className="font-heading font-black text-brand-primary text-base">
                Mover Inmueble a Posición
              </h3>
              <p className="text-xs text-text-secondary">
                Reordena y define en qué página del portal se mostrará
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Ficha resumida del inmueble */}
        <div className="p-3 bg-neutral-50 rounded-2xl border border-neutral-200/80 flex items-center gap-3">
          <div className="relative w-14 h-12 rounded-xl overflow-hidden shrink-0 bg-neutral-200">
            {item.property.coverUrl ? (
              <Image
                src={item.property.coverUrl}
                alt={item.property.title}
                fill
                sizes="56px"
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-neutral-400">
                <HomeIcon className="w-4 h-4" />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <h4 className="font-bold text-xs sm:text-sm text-text-primary truncate">
              {item.property.title}
            </h4>
            <div className="flex items-center gap-2 text-[11px] text-text-secondary mt-0.5">
              <span>Posición actual: <strong>#{item.currentPosition}</strong></span>
              <span>•</span>
              <span>Página {Math.ceil(item.currentPosition / pageSize)}</span>
            </div>
          </div>
        </div>

        {/* Campo de seleccion de posicion */}
        <div className="space-y-3">
          <label className="text-xs font-bold text-text-primary block">
            Escribe la nueva posición (1 al {totalProperties}):
          </label>
          <div className="flex items-center gap-2">
            <input
              type="number"
              min="1"
              max={totalProperties}
              value={targetPositionInput}
              onChange={(e) => setTargetPositionInput(e.target.value)}
              className="flex-1 bg-white border-2 border-brand-accent/50 focus:border-brand-accent rounded-xl px-4 py-2.5 text-base font-black text-brand-primary text-center focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
            />
          </div>

          {isValidPosition && parsed !== item.currentPosition && targetPage && (
            <p className="text-[11px] text-neutral-500 bg-neutral-50 border border-neutral-200/60 rounded-xl px-3 py-2 text-center animate-in fade-in duration-100">
              Se ubicará en la <strong className="text-text-primary">Página {targetPage}</strong> y los demás puestos se ajustarán en orden.
            </p>
          )}
        </div>

        {/* Botones de confirmacion */}
        <div className="flex items-center justify-center gap-3 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 transition-colors cursor-pointer"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={() => {
              if (!isValidPosition) return;
              onConfirm(item.property.id, parsed);
            }}
            disabled={isPending || !isValidPosition}
            className="px-6 py-2.5 rounded-xl text-xs font-black bg-brand-accent hover:bg-[#d64b1f] text-white shadow-md shadow-brand-accent/25 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
          >
            Confirmar y Guardar
          </button>
        </div>
      </div>
    </div>
  );
}

