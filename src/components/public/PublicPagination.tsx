"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface PublicPaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  /** Ruta base de la paginacion (por defecto el portal principal) */
  basePath?: string;
  /** Ancla opcional para conservar el scroll en la seccion */
  anchor?: string;
  /** Sustantivo mostrado en el resumen de resultados */
  itemNoun?: string;
  ariaLabel?: string;
}

// Paginacion publica adaptativa con navegacion por URL para soporte SEO y marcadores
export function PublicPagination({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  basePath = "/",
  anchor = "catalogo",
  itemNoun = "inmuebles",
  ariaLabel = "Paginación de propiedades",
}: PublicPaginationProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  if (totalPages <= 1 || totalItems === 0) return null;

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  const goToPage = (pageNumber: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("page", pageNumber.toString());
    const query = params.toString();
    router.push(`${basePath}${query ? `?${query}` : ""}${anchor ? `#${anchor}` : ""}`);
  };

  // Generador inteligente de elipsis
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
      className="bg-white rounded-3xl border border-neutral-200/90 shadow-sm px-4 py-3.5 sm:px-6 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3.5 select-none"
      aria-label={ariaLabel}
    >
      <div className="text-xs font-semibold text-text-secondary text-center sm:text-left">
        Mostrando {itemNoun}{" "}
        <span className="font-extrabold text-brand-primary">
          {startItem} al {endItem}
        </span>{" "}
        de un total de <span className="font-extrabold text-brand-primary">{totalItems}</span>
      </div>

      <div className="flex items-center gap-1.5 flex-wrap justify-center">
        {/* Anterior */}
        <button
          type="button"
          onClick={() => goToPage(currentPage - 1)}
          disabled={currentPage <= 1}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-text-primary text-xs font-bold shadow-2xs disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 text-neutral-500" />
          <span className="hidden sm:inline">Anterior</span>
        </button>

        {/* Numeros */}
        <div className="flex items-center gap-1">
          {pages.map((p, idx) => {
            if (p === "...") {
              return (
                <span key={`dots-${idx}`} className="px-2 text-xs text-neutral-400 font-bold">
                  ...
                </span>
              );
            }
            const pageNum = p as number;
            const isCurrent = pageNum === currentPage;
            return (
              <button
                key={`page-${pageNum}`}
                type="button"
                onClick={() => goToPage(pageNum)}
                aria-current={isCurrent ? "page" : undefined}
                className={`min-w-8 h-8 px-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center ${
                  isCurrent
                    ? "bg-brand-primary text-white shadow-xs font-extrabold"
                    : "text-text-secondary hover:text-text-primary hover:bg-neutral-100"
                }`}
              >
                {pageNum}
              </button>
            );
          })}
        </div>

        {/* Siguiente */}
        <button
          type="button"
          onClick={() => goToPage(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl border border-neutral-200 bg-white hover:bg-neutral-50 text-text-primary text-xs font-bold shadow-2xs disabled:opacity-30 disabled:pointer-events-none transition-all active:scale-95 cursor-pointer"
        >
          <span className="hidden sm:inline">Siguiente</span>
          <ChevronRight className="w-4 h-4 text-neutral-500" />
        </button>
      </div>
    </div>
  );
}
