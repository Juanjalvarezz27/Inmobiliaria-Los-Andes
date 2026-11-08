"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  Search,
  MapPin,
  Building,
  Building2,
  Home,
  Store,
  Trees,
  Briefcase,
  ChevronDown,
  Check,
  RotateCcw,
  X,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

export interface HeroSlide {
  url: string;
  caption?: string;
}

// Fotografias de arquitectura de alto nivel como respaldo inicial
const DEFAULT_HERO_SLIDES: HeroSlide[] = [
  {
    url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
    caption: "Residencia Contemporánea",
  },
  {
    url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
    caption: "Townhouse con Jardín",
  },
  {
    url: "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1920&q=80",
    caption: "Interiores de Lujo",
  },
  {
    url: "https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?auto=format&fit=crop&w=1920&q=80",
    caption: "Fachada Arquitectónica",
  },
];

// Opciones estéticas personalizadas para el desplegable de Tipo de Inmueble
const PROPERTY_TYPE_OPTIONS = [
  { value: "ALL", label: "Cualquier tipo", icon: Building2 },
  { value: "TOWNHOUSE", label: "Townhouse", icon: Building2 },
  { value: "HOUSE", label: "Casa", icon: Home },
  { value: "APARTMENT", label: "Apartamento", icon: Building },
  { value: "COMMERCIAL", label: "Local Comercial", icon: Store },
  { value: "LAND", label: "Terreno", icon: Trees },
  { value: "OFFICE", label: "Oficina", icon: Briefcase },
];

interface HeroSearchProps {
  slides?: HeroSlide[];
}

// Seccion principal Hero con fondo dinamico y buscador de alta gama
export function HeroSearch({ slides }: HeroSearchProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Galeria de imagenes combinando las de base de datos con respaldo de alta resolucion
  const heroImages = slides && slides.length > 0 ? slides : DEFAULT_HERO_SLIDES;
  const [currentSlide, setCurrentSlide] = useState(0);

  // Intervalo automatico de transicion suave cada 6 segundos
  useEffect(() => {
    if (heroImages.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [heroImages.length]);

  const [operation, setOperation] = useState<string>(searchParams.get("operacion") || "ALL");
  const [propertyType, setPropertyType] = useState<string>(searchParams.get("tipo") || "ALL");
  const [keyword, setKeyword] = useState<string>(searchParams.get("q") || "");

  // Sincronizar estado cuando cambian los parametros de URL
  useEffect(() => {
    setOperation(searchParams.get("operacion") || "ALL");
    setPropertyType(searchParams.get("tipo") || "ALL");
    setKeyword(searchParams.get("q") || "");
  }, [searchParams]);

  // Detector de filtros activos
  const hasActiveFilters =
    operation !== "ALL" || propertyType !== "ALL" || keyword.trim() !== "";

  // Restablecer todos los filtros al estado original
  const handleReset = () => {
    setOperation("ALL");
    setPropertyType("ALL");
    setKeyword("");
    if (searchParams.toString()) {
      router.push("/#catalogo");
    }
    scrollToCatalog();
  };

  // Control del desplegable personalizado de Tipo de Inmueble
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false);
  const typeDropdownRef = useRef<HTMLDivElement>(null);

  // Cierre automatico al hacer clic fuera del desplegable
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (typeDropdownRef.current && !typeDropdownRef.current.contains(e.target as Node)) {
        setTypeDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const selectedTypeOption =
    PROPERTY_TYPE_OPTIONS.find((opt) => opt.value === propertyType) || PROPERTY_TYPE_OPTIONS[0];

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (operation !== "ALL") params.set("operacion", operation);
    if (propertyType !== "ALL") params.set("tipo", propertyType);
    if (keyword.trim()) params.set("q", keyword.trim());
    params.set("page", "1");

    const queryString = params.toString();
    router.push(`/${queryString ? `?${queryString}` : ""}#catalogo`);
    scrollToCatalog();
  };

  const scrollToCatalog = () => {
    setTimeout(() => {
      const catalog = document.getElementById("catalogo");
      if (catalog) {
        catalog.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  return (
    <section className="relative z-30 text-white pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 min-h-[580px] flex items-center justify-center">
      {/* Carrusel de Fotografias de Fondo con Movimiento Lento (Efecto Ken Burns) */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
        {heroImages.map((slide, idx) => {
          const isActive = idx === currentSlide;
          return (
            <div
              key={slide.url + idx}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                isActive ? "opacity-100 z-10" : "opacity-0 z-0"
              }`}
            >
              <Image
                src={slide.url}
                alt={slide.caption || "Inmueble de lujo"}
                fill
                preload={idx === 0}
                sizes="100vw"
                className={`object-cover transform transition-transform duration-[7000ms] ease-out will-change-transform ${
                  isActive ? "scale-110 translate-x-1 -translate-y-1" : "scale-100 translate-x-0 translate-y-0"
                }`}
              />
            </div>
          );
        })}

        {/* Capa de contraste cinematográfica equilibrada: oscura y neutra con un matiz muy sutil */}
        <div className="absolute inset-0 z-20 bg-gradient-to-b from-neutral-950/70 via-neutral-950/50 to-neutral-950/80" />
        <div className="absolute inset-0 z-20 bg-black/30" />
      </div>

      <div className="relative z-30 max-w-5xl mx-auto text-center space-y-5 w-full">
        {/* Titular Principal con Sombra de Alto Contraste */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] font-heading drop-shadow-[0_4px_18px_rgba(0,0,0,0.8)]">
          Encuentra tu próximo hogar o{" "}
          <span className="bg-gradient-to-r from-orange-400 via-brand-accent to-[#ff8555] bg-clip-text text-transparent drop-shadow-none">
            inversión ideal
          </span>
        </h1>

        {/* Subtitulo Descriptivo Conciso */}
        <p className="max-w-xl mx-auto text-sm sm:text-base text-white/95 font-semibold leading-relaxed drop-shadow-[0_2px_10px_rgba(0,0,0,0.85)]">
          Propiedades verificadas con asesoría personalizada y respaldo legal.
        </p>

        {/* Buscador Flotante de Alta Gama */}
        <div className="pt-4 max-w-4xl mx-auto">
          {/* Selector de Pestañas de Operacion (3 Opciones de Igual Tamaño en Una Sola Línea) */}
          <div className="grid grid-cols-3 p-1.5 bg-black/60 backdrop-blur-xl rounded-2xl border border-white/20 mb-5 shadow-xl max-w-xl sm:max-w-2xl mx-auto w-full gap-1.5">
            <button
              type="button"
              onClick={() => setOperation("ALL")}
              className={`relative z-10 w-full h-11 sm:h-12 px-2 sm:px-4 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all duration-300 ease-out flex items-center justify-center cursor-pointer transform hover:scale-[1.04] hover:z-20 active:scale-95 ${
                operation === "ALL"
                  ? "bg-gradient-to-r from-brand-accent to-[#d24b1d] text-white shadow-lg shadow-brand-accent/30 font-black scale-[1.02]"
                  : "text-neutral-300 hover:text-white hover:bg-white/15 hover:shadow-md"
              }`}
            >
              <span className="hidden sm:inline whitespace-nowrap">Todos los Inmuebles</span>
              <span className="sm:hidden whitespace-nowrap">Todos</span>
            </button>
            <button
              type="button"
              onClick={() => setOperation("SALE")}
              className={`relative z-10 w-full h-11 sm:h-12 px-2 sm:px-4 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all duration-300 ease-out flex items-center justify-center cursor-pointer transform hover:scale-[1.04] hover:z-20 active:scale-95 ${
                operation === "SALE"
                  ? "bg-gradient-to-r from-brand-accent to-[#d24b1d] text-white shadow-lg shadow-brand-accent/30 font-black scale-[1.02]"
                  : "text-neutral-300 hover:text-white hover:bg-white/15 hover:shadow-md"
              }`}
            >
              <span className="hidden sm:inline whitespace-nowrap">Comprar (Venta)</span>
              <span className="sm:hidden whitespace-nowrap">Comprar</span>
            </button>
            <button
              type="button"
              onClick={() => setOperation("RENT")}
              className={`relative z-10 w-full h-11 sm:h-12 px-2 sm:px-4 rounded-xl text-xs sm:text-[13px] font-bold whitespace-nowrap transition-all duration-300 ease-out flex items-center justify-center cursor-pointer transform hover:scale-[1.04] hover:z-20 active:scale-95 ${
                operation === "RENT"
                  ? "bg-gradient-to-r from-brand-accent to-[#d24b1d] text-white shadow-lg shadow-brand-accent/30 font-black scale-[1.02]"
                  : "text-neutral-300 hover:text-white hover:bg-white/15 hover:shadow-md"
              }`}
            >
              <span className="whitespace-nowrap">Alquilar</span>
            </button>
          </div>

          {/* Contenedor relativo de la Card Blanca con Boton Flotante */}
          <div className="relative">
            {/* Boton Flotante Semitransparente directamente sobre la Card Blanca */}
            {hasActiveFilters && (
              <div className="absolute -top-3.5 right-4 sm:right-8 z-40 animate-in fade-in zoom-in-95 duration-200">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-black/60 hover:bg-black/80 text-orange-200 hover:text-white border border-white/20 hover:border-orange-400/50 text-[11px] sm:text-xs font-bold rounded-full shadow-lg backdrop-blur-md transition-all cursor-pointer transform hover:scale-105 active:scale-95 group"
                  title="Restablecer todos los filtros"
                >
                  <RotateCcw className="w-3 h-3 text-orange-400 group-hover:-rotate-90 transition-transform duration-300" />
                  <span>Limpiar filtros</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                </button>
              </div>
            )}

            <form
              onSubmit={handleSearch}
              className="bg-white/98 p-3 sm:p-4 rounded-3xl shadow-2xl border border-neutral-200/90 text-text-primary text-left grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
            >
            {/* Filtro Desplegable Personalizado: Tipo de Inmueble */}
            <div
              ref={typeDropdownRef}
              className={`relative sm:col-span-4 lg:col-span-4 ${typeDropdownOpen ? "z-50" : "z-10"}`}
            >
              <button
                type="button"
                onClick={() => setTypeDropdownOpen((prev) => !prev)}
                className="w-full text-left bg-neutral-50 hover:bg-neutral-100/90 border border-neutral-200/80 rounded-2xl px-3.5 py-2.5 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-brand-accent/20"
              >
                <span className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                  <Building className="w-3 h-3 text-brand-accent" />
                  <span>Tipo de Inmueble</span>
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-extrabold text-brand-primary truncate">
                    {selectedTypeOption.label}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-neutral-500 transition-transform duration-200 shrink-0 ${
                      typeDropdownOpen ? "rotate-180 text-brand-accent" : ""
                    }`}
                  />
                </div>
              </button>

              {/* Menu Flotante con Estilo y Animacion */}
              {typeDropdownOpen && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl border border-neutral-200 shadow-2xl p-1.5 space-y-0.5 z-50 animate-in fade-in zoom-in-95 duration-100 max-h-72 overflow-y-auto">
                  {PROPERTY_TYPE_OPTIONS.map((opt) => {
                    const Icon = opt.icon;
                    const isSelected = opt.value === propertyType;
                    return (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setPropertyType(opt.value);
                          setTypeDropdownOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                          isSelected
                            ? "bg-orange-50 text-brand-accent font-black border border-orange-200/80"
                            : "text-text-primary hover:bg-neutral-50 hover:text-brand-primary"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${
                              isSelected
                                ? "bg-brand-accent text-white"
                                : "bg-neutral-100 text-neutral-500"
                            }`}
                          >
                            <Icon className="w-3.5 h-3.5" />
                          </div>
                          <span>{opt.label}</span>
                        </div>
                        {isSelected && <Check className="w-4 h-4 text-brand-accent shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Busqueda por Sector / Ubicacion con Boton X para limpiar texto */}
            <div className="relative sm:col-span-4 lg:col-span-5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-2xl px-3.5 py-2.5 transition-colors">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                <MapPin className="w-3 h-3 text-brand-accent" />
                <span>Ubicación o Sector</span>
              </label>
              <div className="flex items-center justify-between gap-1.5">
                <input
                  type="text"
                  placeholder="Ej. Centro, Las Acacias, La Chiquinquirá..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-transparent text-xs font-bold text-text-primary placeholder:text-neutral-400 placeholder:font-normal focus:outline-none"
                />
                {keyword && (
                  <button
                    type="button"
                    onClick={() => setKeyword("")}
                    className="p-1 text-neutral-400 hover:text-brand-accent rounded-lg hover:bg-neutral-200/60 transition-colors shrink-0 cursor-pointer"
                    title="Borrar texto"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>

            {/* Boton Principal de Busqueda con Mayor Tamaño y Presencia */}
            <div className="sm:col-span-4 lg:col-span-3">
              <button
                type="submit"
                className="w-full h-[52px] bg-gradient-to-r from-brand-accent to-[#c94b21] hover:from-[#d64a1a] hover:to-[#b83e16] hover:shadow-xl hover:shadow-brand-accent/35 text-white text-xs sm:text-sm font-black rounded-2xl flex items-center justify-center gap-2.5 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4 shrink-0 stroke-[2.5]" />
                <span className="whitespace-nowrap tracking-wide">Buscar Inmuebles</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </section>
  );
}
