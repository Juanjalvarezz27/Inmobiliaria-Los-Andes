"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { useRouter } from "next/navigation";

// Seccion principal Hero con buscador multifiltro integrado
export function HeroSearch() {
  const router = useRouter();
  const [operation, setOperation] = useState<string>("ALL");
  const [propertyType, setPropertyType] = useState<string>("ALL");
  const [keyword, setKeyword] = useState<string>("");

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (operation !== "ALL") params.set("operacion", operation);
    if (propertyType !== "ALL") params.set("tipo", propertyType);
    if (keyword.trim()) params.set("q", keyword.trim());

    const queryString = params.toString();
    router.push(`/${queryString ? `?${queryString}` : ""}#catalogo`);
  };

  return (
    <section className="relative bg-brand-primary text-white py-20 px-4 sm:px-6 lg:px-8 overflow-hidden">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#ffffff_1px,transparent_1px)] [background-size:16px_16px]" />

      <div className="relative max-w-5xl mx-auto text-center space-y-6">
        <span className="inline-block bg-white/10 text-white/90 text-xs font-semibold uppercase tracking-widest px-4 py-1.5 rounded-full border border-white/20">
          Inversiones Inmobiliaria Los Andes
        </span>

        <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-tight">
          Tu patrimonio seguro en <span className="text-brand-accent">Trujillo</span>
        </h1>

        <p className="max-w-2xl mx-auto text-base sm:text-lg text-white/80 font-normal leading-relaxed">
          Explora nuestra selección de townhouses, casas, apartamentos y locales comerciales.
          Asesoría personalizada con profesionales inmobiliarios certificados.
        </p>

        {/* Buscador flotante */}
        <div className="pt-6">
          <form
            onSubmit={handleSearch}
            className="bg-ui-surface p-4 sm:p-5 rounded-2xl sm:rounded-3xl shadow-2xl border border-neutral-200 text-text-primary text-left grid grid-cols-1 sm:grid-cols-12 gap-3 items-center"
          >
            {/* Filtro Operacion */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Operación
              </label>
              <select
                value={operation}
                onChange={(e) => setOperation(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="ALL">Todas las operaciones</option>
                <option value="SALE">Comprar (En Venta)</option>
                <option value="RENT">Alquilar (En Alquiler)</option>
              </select>
            </div>

            {/* Filtro Tipo de Inmueble */}
            <div className="sm:col-span-3">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Tipo de Inmueble
              </label>
              <select
                value={propertyType}
                onChange={(e) => setPropertyType(e.target.value)}
                className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
              >
                <option value="ALL">Todos los tipos</option>
                <option value="TOWNHOUSE">Townhouse</option>
                <option value="HOUSE">Casa</option>
                <option value="APARTMENT">Apartamento</option>
                <option value="COMMERCIAL">Local Comercial</option>
                <option value="LAND">Terreno</option>
              </select>
            </div>

            {/* Busqueda por Sector / Palabra Clave */}
            <div className="sm:col-span-4">
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                Ubicación / Sector
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Ej. Vista Real, Centro, La Raya..."
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-3 pr-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
            </div>

            {/* Boton de Accion Principal (CTA) */}
            <div className="sm:col-span-2 sm:self-end">
              <button
                type="submit"
                className="w-full h-[44px] bg-brand-accent hover:bg-[#c94b21] text-white font-bold rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
              >
                <Search className="w-4 h-4" />
                <span>Buscar</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
