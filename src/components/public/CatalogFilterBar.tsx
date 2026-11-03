"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { ArrowUpDown, RotateCcw, Home, Building2, Store, Trees } from "lucide-react";

interface CatalogFilterBarProps {
  totalResults: number;
}

// Barra de control rapido y ordenamiento para el catalogo publico
export function CatalogFilterBar({ totalResults }: CatalogFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentOperation = searchParams.get("operacion") || "ALL";
  const currentType = searchParams.get("tipo") || "ALL";
  const currentSort = searchParams.get("orden") || "recientes";
  const currentQuery = searchParams.get("q") || "";

  const hasActiveFilters =
    currentOperation !== "ALL" || currentType !== "ALL" || Boolean(currentQuery) || currentSort !== "recientes";

  const updateParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value === "ALL" || value === "recientes" || !value) {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    // Reiniciar a la pagina 1 al filtrar
    params.set("page", "1");
    const query = params.toString();
    router.push(`/${query ? `?${query}` : ""}#catalogo`);
  };

  const handleResetFilters = () => {
    router.push("/#catalogo");
  };

  const propertyTypeButtons = [
    { label: "Todos", value: "ALL", icon: null },
    { label: "Townhouses", value: "TOWNHOUSE", icon: Building2 },
    { label: "Casas", value: "HOUSE", icon: Home },
    { label: "Apartamentos", value: "APARTMENT", icon: Building2 },
    { label: "Locales", value: "COMMERCIAL", icon: Store },
    { label: "Terrenos", value: "LAND", icon: Trees },
  ];

  return (
    <div className="bg-white p-4 sm:p-5 rounded-3xl border border-neutral-200/90 shadow-sm space-y-4">
      {/* Fila 1: Pestañas de Tipo de Inmueble y Ordenamiento */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        {/* Chips de Categorias Populares */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          {propertyTypeButtons.map((btn) => {
            const Icon = btn.icon;
            const isSelected = currentType === btn.value;
            return (
              <button
                key={btn.value}
                type="button"
                onClick={() => updateParam("tipo", btn.value)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? "bg-brand-primary text-white shadow-xs"
                    : "bg-neutral-100 hover:bg-neutral-200/80 text-text-secondary hover:text-text-primary"
                }`}
              >
                {Icon && <Icon className="w-3.5 h-3.5" />}
                <span>{btn.label}</span>
              </button>
            );
          })}
        </div>

        {/* Controles de Orden y Conteo */}
        <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
          <div className="flex items-center gap-2 text-xs font-bold text-text-secondary bg-neutral-50 px-3 py-1.5 rounded-xl border border-neutral-200/80">
            <ArrowUpDown className="w-3.5 h-3.5 text-brand-accent" />
            <span>Ordenar:</span>
            <select
              value={currentSort}
              onChange={(e) => updateParam("orden", e.target.value)}
              className="bg-transparent font-extrabold text-brand-primary focus:outline-none cursor-pointer"
            >
              <option value="recientes">Más recientes</option>
              <option value="menor-precio">Menor precio</option>
              <option value="mayor-precio">Mayor precio</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent hover:underline cursor-pointer"
              title="Restablecer filtros"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Limpiar filtros</span>
            </button>
          )}
        </div>
      </div>

      {/* Fila 2: Sub-chips de Modalidad (Comprar / Alquilar) */}
      <div className="pt-2 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="font-bold text-text-secondary text-[11px] uppercase tracking-wider">
            Modalidad:
          </span>
          <div className="inline-flex p-0.5 bg-neutral-100 rounded-xl">
            <button
              type="button"
              onClick={() => updateParam("operacion", "ALL")}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                currentOperation === "ALL"
                  ? "bg-white text-brand-primary shadow-2xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              Todas
            </button>
            <button
              type="button"
              onClick={() => updateParam("operacion", "SALE")}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                currentOperation === "SALE"
                  ? "bg-brand-accent text-white shadow-2xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              En Venta
            </button>
            <button
              type="button"
              onClick={() => updateParam("operacion", "RENT")}
              className={`px-3 py-1 rounded-lg font-bold text-xs transition-all cursor-pointer ${
                currentOperation === "RENT"
                  ? "bg-brand-accent text-white shadow-2xs"
                  : "text-text-secondary hover:text-text-primary"
              }`}
            >
              En Alquiler
            </button>
          </div>
        </div>

        <div className="text-xs text-text-secondary font-semibold">
          Total disponibles:{" "}
          <span className="font-extrabold text-brand-primary">{totalResults} inmuebles</span>
        </div>
      </div>
    </div>
  );
}

