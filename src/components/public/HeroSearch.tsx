"use client";

import { useState } from "react";
import { Search, MapPin, Building, Key, Sparkles, CheckCircle2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";

// Seccion principal Hero con identidad editorial y buscador multifiltro integrado
export function HeroSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [operation, setOperation] = useState<string>(searchParams.get("operacion") || "ALL");
  const [propertyType, setPropertyType] = useState<string>(searchParams.get("tipo") || "ALL");
  const [keyword, setKeyword] = useState<string>(searchParams.get("q") || "");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (operation !== "ALL") params.set("operacion", operation);
    if (propertyType !== "ALL") params.set("tipo", propertyType);
    if (keyword.trim()) params.set("q", keyword.trim());
    params.set("page", "1");

    const queryString = params.toString();
    router.push(`/${queryString ? `?${queryString}` : ""}#catalogo`);
  };

  return (
    <section className="relative bg-gradient-to-b from-[#0a1b0f] via-[#122b1c] to-[#0d2215] text-white pt-28 sm:pt-36 pb-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
      {/* Resplandor y patron de fondo ambiental */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[400px] bg-gradient-to-b from-emerald-500/10 via-transparent to-transparent blur-3xl pointer-events-none" />
      <div className="absolute inset-0 opacity-5 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:20px_20px] pointer-events-none" />

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        {/* Badge superior de confianza institucional */}
        <div className="inline-flex items-center gap-2 bg-emerald-500/10 text-emerald-300 border border-emerald-500/25 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide shadow-xs animate-in fade-in duration-300">
          <Sparkles className="w-3.5 h-3.5 text-brand-accent" />
          <span>Inversiones Inmobiliaria Los Andes • RIF J-50879938-0</span>
        </div>

        {/* Titular Principal */}
        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.15] font-heading">
          Tu patrimonio y futuro seguro en{" "}
          <span className="bg-gradient-to-r from-orange-400 via-brand-accent to-[#ff8555] bg-clip-text text-transparent">
            Trujillo
          </span>
        </h1>

        {/* Subtitulo Descriptivo */}
        <p className="max-w-2xl mx-auto text-sm sm:text-base text-emerald-100/80 font-normal leading-relaxed">
          Explora la cartera más selecta de townhouses, casas, apartamentos y locales comerciales.
          Acompañamiento legal y comercial de la mano de asesores inmobiliarios certificados.
        </p>

        {/* Puntos Clave de Confianza */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 pt-2 text-xs font-semibold text-emerald-200/90">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-accent" />
            <span>Inmuebles 100% Verificados</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-accent" />
            <span>Asesoría Jurídica y Notarial</span>
          </div>
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-brand-accent" />
            <span>Contacto Directo por WhatsApp</span>
          </div>
        </div>

        {/* Buscador Flotante de Alta Gama */}
        <div className="pt-6 max-w-4xl mx-auto">
          {/* Selector de Pestañas de Operacion */}
          <div className="inline-flex p-1 bg-black/40 backdrop-blur-md rounded-2xl border border-white/10 mb-3 shadow-md">
            <button
              type="button"
              onClick={() => setOperation("ALL")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                operation === "ALL"
                  ? "bg-brand-accent text-white shadow-xs"
                  : "text-emerald-200/80 hover:text-white"
              }`}
            >
              Todos los Inmuebles
            </button>
            <button
              type="button"
              onClick={() => setOperation("SALE")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                operation === "SALE"
                  ? "bg-brand-accent text-white shadow-xs"
                  : "text-emerald-200/80 hover:text-white"
              }`}
            >
              Comprar (Venta)
            </button>
            <button
              type="button"
              onClick={() => setOperation("RENT")}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                operation === "RENT"
                  ? "bg-brand-accent text-white shadow-xs"
                  : "text-emerald-200/80 hover:text-white"
              }`}
            >
              Alquilar
            </button>
          </div>

          <form
            onSubmit={handleSearch}
            className="bg-white p-3 sm:p-4 rounded-3xl shadow-2xl border border-neutral-200/90 text-text-primary text-left grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center"
          >
            {/* Filtro Tipo de Inmueble */}
            <div className="sm:col-span-4 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-2xl px-3.5 py-2.5 transition-colors">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                <Building className="w-3 h-3 text-brand-accent" />
                <span>Tipo de Inmueble</span>
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-transparent text-xs font-extrabold text-brand-primary focus:outline-none cursor-pointer"
              >
                <option value="ALL">Cualquier tipo</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="HOUSE">Casa</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="COMMERCIAL">Local Comercial</option>
                <option value="LAND">Terreno</option>
                <option value="OFFICE">Oficina</option>
              </select>
            </div>

            {/* Busqueda por Sector / Ubicacion */}
            <div className="sm:col-span-5 bg-neutral-50 hover:bg-neutral-100/80 border border-neutral-200/80 rounded-2xl px-3.5 py-2.5 transition-colors">
              <label className="flex items-center gap-1.5 text-[10px] font-bold text-text-secondary uppercase tracking-wider mb-1">
                <MapPin className="w-3 h-3 text-brand-accent" />
                <span>Ubicación o Sector</span>
              </label>
              <input
                type="text"
                placeholder="Ej. Centro, Las Acacias, La Chiquinquirá..."
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-transparent text-xs font-bold text-text-primary placeholder:text-neutral-400 placeholder:font-normal focus:outline-none"
              />
            </div>

            {/* Boton de Accion Principal */}
            <div className="sm:col-span-3">
              <button
                type="submit"
                className="w-full h-[48px] bg-gradient-to-r from-brand-accent to-[#c94b21] hover:shadow-lg hover:shadow-brand-accent/25 text-white text-xs sm:text-sm font-extrabold rounded-2xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer"
              >
                <Search className="w-4 h-4" />
                <span>Buscar Inmuebles</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
