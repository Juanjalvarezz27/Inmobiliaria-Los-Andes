"use client";

import { useState, useRef, useEffect, useMemo, ReactNode } from "react";
import { ChevronDown, Check, Search, X, ChevronLeft, ChevronRight } from "lucide-react";

export interface CustomSelectOption<T extends string = string> {
  value: T;
  label: string;
  dotColor?: string;
  description?: string;
  icon?: ReactNode;
}

interface CustomSelectProps<T extends string = string> {
  value: T;
  onChange: (value: T) => void;
  options: CustomSelectOption<T>[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  dropdownClassName?: string;
  dropdownAlign?: "left" | "right";
  size?: "sm" | "md";
  triggerIcon?: ReactNode;
  searchable?: boolean;
  searchPlaceholder?: string;
  emptySearchMessage?: string;
  pageSize?: number;
}

// Selector personalizado con soporte de busqueda, paginacion e identidad visual
export function CustomSelect<T extends string = string>({
  value,
  onChange,
  options,
  placeholder = "Seleccionar...",
  disabled = false,
  className = "",
  dropdownClassName = "",
  dropdownAlign = "left",
  size = "md",
  triggerIcon,
  searchable = false,
  searchPlaceholder = "Buscar opción...",
  emptySearchMessage = "No se encontraron resultados",
  pageSize,
}: CustomSelectProps<T>) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOption = options.find((opt) => opt.value === value);
  const isFilterActive = Boolean(value && value !== "ALL");

  // Filtrado reactivo de las opciones segun el termino ingresado
  const filteredOptions = useMemo(() => {
    if (!searchable || !searchTerm.trim()) return options;
    const term = searchTerm.toLowerCase().trim();
    return options.filter((opt) => {
      const matchLabel = opt.label.toLowerCase().includes(term);
      const matchDesc = opt.description ? opt.description.toLowerCase().includes(term) : false;
      return matchLabel || matchDesc;
    });
  }, [options, searchable, searchTerm]);

  // Calculo de paginas totales basado en el tamano de pagina
  const totalPages = pageSize ? Math.max(1, Math.ceil(filteredOptions.length / pageSize)) : 1;

  // Ajuste de pagina al abrir o al cambiar filtros
  useEffect(() => {
    if (isOpen) {
      if (searchable) {
        const timer = setTimeout(() => {
          searchInputRef.current?.focus();
        }, 50);
        return () => clearTimeout(timer);
      }
      // Situar en la pagina correspondiente al valor seleccionado si existe
      if (pageSize && value) {
        const idx = filteredOptions.findIndex((opt) => opt.value === value);
        if (idx !== -1) {
          setCurrentPage(Math.floor(idx / pageSize) + 1);
        }
      }
    } else {
      setSearchTerm("");
      setCurrentPage(1);
    }
  }, [isOpen, searchable, pageSize, value, filteredOptions]);

  // Asegurar que la pagina actual no supere el total de paginas disponibles
  useEffect(() => {
    if (currentPage > totalPages) {
      setCurrentPage(1);
    }
  }, [totalPages, currentPage]);

  // Cierre automatico al hacer click fuera o presionar escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Opciones visibles en la pagina activa
  const displayedOptions = useMemo(() => {
    if (!pageSize) return filteredOptions;
    const start = (currentPage - 1) * pageSize;
    return filteredOptions.slice(start, start + pageSize);
  }, [filteredOptions, pageSize, currentPage]);

  const isSmall = size === "sm";

  return (
    <div
      ref={containerRef}
      className={`relative ${isOpen ? "z-40" : "z-10"} ${className}`}
    >
      <button
        type="button"
        disabled={disabled}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        className={`w-full border rounded-xl flex items-center justify-between text-left transition-all duration-150 shadow-2xs ${
          isSmall ? "px-3 py-2 text-xs font-bold" : "px-3.5 py-2.5 text-sm font-semibold"
        } ${
          isOpen
            ? "border-brand-accent ring-2 ring-brand-accent/20 bg-white"
            : isFilterActive
            ? "border-brand-accent/50 bg-orange-50/20 text-brand-accent"
            : "border-neutral-200/90 hover:border-neutral-300 bg-white text-text-primary"
        } ${disabled ? "opacity-60 cursor-not-allowed bg-neutral-100" : "cursor-pointer"}`}
      >
        <span className="flex items-center gap-2 truncate">
          {/* Priorizar icono especifico de la opcion seleccionada si existe */}
          {selectedOption?.icon ? (
            <span className="shrink-0">{selectedOption.icon}</span>
          ) : (
            triggerIcon && <span className="shrink-0">{triggerIcon}</span>
          )}
          {selectedOption?.dotColor && (
            <span
              className={`rounded-full shrink-0 ${isSmall ? "w-2 h-2" : "w-2.5 h-2.5"} ${selectedOption.dotColor}`}
            />
          )}
          <span className={selectedOption ? (isFilterActive ? "text-brand-accent font-extrabold" : "text-text-primary") : "text-neutral-400"}>
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </span>

        <ChevronDown
          className={`text-neutral-400 transition-transform duration-200 shrink-0 ${
            isSmall ? "w-3.5 h-3.5 ml-1.5" : "w-4 h-4 ml-2"
          } ${isOpen ? "rotate-180 text-brand-accent" : ""}`}
        />
      </button>

      {isOpen && (
        <div
          role="listbox"
          className={`absolute top-full mt-1.5 ${
            dropdownAlign === "right" ? "right-0" : "left-0"
          } bg-white rounded-2xl border border-neutral-200/90 shadow-2xl z-50 p-1.5 space-y-1 animate-in fade-in zoom-in-95 duration-150 max-w-[calc(100vw-2rem)] ${
            dropdownClassName || "min-w-full sm:min-w-[200px]"
          }`}
        >
          {/* Buscador interno para listas amplias */}
          {searchable && (
            <div className="p-1 pb-1.5 border-b border-neutral-100 mb-1">
              <div className="relative flex items-center">
                <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-2.5 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                  placeholder={searchPlaceholder}
                  onClick={(e) => e.stopPropagation()}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") setIsOpen(false);
                    e.stopPropagation();
                  }}
                  className="w-full pl-8 pr-7 py-1.5 bg-neutral-50 hover:bg-neutral-100/70 focus:bg-white text-xs font-semibold text-text-primary placeholder:text-neutral-400 rounded-xl border border-neutral-200 focus:outline-none focus:border-brand-accent focus:ring-1 focus:ring-brand-accent/20 transition-all"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setSearchTerm("");
                      setCurrentPage(1);
                      searchInputRef.current?.focus();
                    }}
                    className="absolute right-2 p-0.5 text-neutral-400 hover:text-neutral-700 rounded-md cursor-pointer"
                    title="Limpiar búsqueda"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Listado de opciones de la pagina actual */}
          <div className="max-h-64 overflow-y-auto space-y-0.5 pr-0.5">
            {displayedOptions.length === 0 ? (
              <div className="py-6 px-3 text-center text-xs text-text-secondary">
                <p className="font-semibold text-text-primary mb-0.5">{emptySearchMessage}</p>
                <p className="text-[11px] text-neutral-400">Intenta con otro término</p>
              </div>
            ) : (
              displayedOptions.map((option) => {
                const isSelected = option.value === value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => {
                      onChange(option.value);
                      setIsOpen(false);
                    }}
                    className={`w-full flex items-center justify-between rounded-xl text-left transition-colors cursor-pointer ${
                      isSmall ? "px-2.5 py-2 text-xs" : "px-3 py-2.5 text-sm"
                    } ${
                      isSelected
                        ? "bg-orange-50/80 text-brand-accent font-bold"
                        : "text-text-primary font-medium hover:bg-neutral-50"
                    }`}
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      {option.dotColor && (
                        <span
                          className={`w-2 h-2 rounded-full shrink-0 ${option.dotColor}`}
                        />
                      )}
                      {option.icon && (
                        <span className="shrink-0">{option.icon}</span>
                      )}
                      <div className="truncate">
                        <div className="truncate">{option.label}</div>
                        {option.description && (
                          <div className="text-[10px] text-text-secondary font-normal truncate">
                            {option.description}
                          </div>
                        )}
                      </div>
                    </div>

                    {isSelected && (
                      <Check className={`text-brand-accent shrink-0 ml-2 ${isSmall ? "w-3.5 h-3.5" : "w-4 h-4"}`} />
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Barra de paginacion inferior para colecciones con multiples paginas */}
          {pageSize && totalPages > 1 && (
            <div className="pt-2 px-2.5 pb-1 border-t border-neutral-100 flex items-center justify-between text-xs text-text-secondary select-none">
              <span className="font-semibold text-[11px] text-neutral-500">
                {filteredOptions.length} resultados · Pág. {currentPage} de {totalPages}
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={currentPage <= 1}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((p) => Math.max(1, p - 1));
                  }}
                  className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer text-text-primary"
                  title="Página anterior"
                >
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <span className="text-[11px] font-extrabold text-brand-primary px-1">
                  {currentPage} / {totalPages}
                </span>
                <button
                  type="button"
                  disabled={currentPage >= totalPages}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentPage((p) => Math.min(totalPages, p + 1));
                  }}
                  className="p-1 rounded-lg hover:bg-neutral-100 disabled:opacity-25 disabled:cursor-not-allowed transition-colors cursor-pointer text-text-primary"
                  title="Página siguiente"
                >
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
