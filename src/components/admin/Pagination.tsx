"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  itemLabel?: string;
  onPageChange: (page: number) => void;
  className?: string;
}

// Componente reutilizable de paginacion ejecutiva con numeracion inteligente y resumen
export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  itemLabel = "elementos",
  onPageChange,
  className = "",
}: PaginationProps) {
  if (totalItems === 0 || totalPages <= 1) {
    return null;
  }

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  // Algoritmo de calculo de paginas visibles con elipsis
  const getPageNumbers = () => {
    const delta = 1;
    const range: number[] = [];
    const rangeWithDots: (number | string)[] = [];
    let l: number | undefined;

    for (let i = 1; i <= totalPages; i++) {
      if (
        i === 1 ||
        i === totalPages ||
        (i >= currentPage - delta && i <= currentPage + delta)
      ) {
        range.push(i);
      }
    }

    for (const i of range) {
      if (l) {
        if (i - l === 2) {
          rangeWithDots.push(l + 1);
        } else if (i - l !== 1) {
          rangeWithDots.push("...");
        }
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots;
  };

  const pages = getPageNumbers();

  return (
    <div
      className={`bg-ui-surface rounded-2xl border border-neutral-200/90 shadow-2xs px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3.5 select-none ${className}`}
      aria-label="Navegación de páginas"
    >
      {/* Resumen de conteo de elementos */}
      <div className="text-xs font-semibold text-text-secondary text-center sm:text-left">
        Mostrando{" "}
        <span className="font-extrabold text-brand-primary">
          {startItem} - {endItem}
        </span>{" "}
        de <span className="font-extrabold text-brand-primary">{totalItems}</span>{" "}
        {itemLabel}
      </div>

      {/* Controles interactivos de paginacion */}
      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Boton Anterior */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-text-primary text-xs font-bold shadow-2xs disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
          title="Página anterior"
        >
          <ChevronLeft className="w-4 h-4 text-neutral-500" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Botones de numeros de pagina */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span
                  key={`ellipsis-${idx}`}
                  className="w-8 h-8 flex items-center justify-center text-xs font-bold text-neutral-400"
                >
                  …
                </span>
              );
            }

            const pageNum = Number(p);
            const isActive = pageNum === currentPage;

            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => onPageChange(pageNum)}
                aria-current={isActive ? "page" : undefined}
                className={`w-8 h-8 rounded-xl text-xs font-extrabold transition-all active:scale-95 cursor-pointer flex items-center justify-center ${
                  isActive
                    ? "bg-brand-primary text-white shadow-sm shadow-brand-primary/20 scale-105"
                    : "text-text-primary hover:bg-neutral-100/80 border border-transparent hover:border-neutral-200"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Boton Siguiente */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-text-primary text-xs font-bold shadow-2xs disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
          title="Página siguiente"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>
      </div>
    </div>
  );
}

