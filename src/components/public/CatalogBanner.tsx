import { Building2, Users } from "lucide-react";
import { AnimatedCount } from "./AnimatedCount";
import { CatalogBannerDecor } from "./CatalogBannerDecor";

interface CatalogBannerProps {
  totalProperties: number;
  totalAgents: number;
}

// Franja institucional con estilo tipográfico monumental: 2 elementos por métrica (Concepto e Icono unificados + Cifra)
export function CatalogBanner({ totalProperties, totalAgents }: CatalogBannerProps) {
  return (
    <section
      id="catalogo"
      className="relative isolate w-full overflow-hidden border-y border-neutral-200/90 bg-gradient-to-br from-[#faf7f3] via-[#faede4] to-[#f6f1ec] text-neutral-900"
    >
      {/* Fondo interactivo al scroll con destellos cálidos de luz naranja */}
      <CatalogBannerDecor />

      <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.25fr_1fr] lg:gap-14">
          {/* Bloque de título institucional limpio */}
          <div className="animate-brand-fade-up text-center lg:text-left">
            <h2 className="text-3xl font-black leading-[1.08] tracking-tight font-heading text-brand-primary sm:text-4xl lg:text-5xl xl:text-[3.25rem]">
              Catálogo de{" "}
              <span className="relative inline-block whitespace-nowrap text-brand-accent">
                Inmuebles
                {/* Trazo orgánico artesanal debajo de Inmuebles */}
                <svg
                  aria-hidden
                  viewBox="0 0 300 14"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-brand-accent/50"
                >
                  <path
                    d="M2 10C60 3 150 2 298 7"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="5"
                    strokeLinecap="round"
                  />
                </svg>
              </span>{" "}
              Disponibles
            </h2>

            <p className="mx-auto mt-4 max-w-xl text-sm font-medium leading-relaxed text-neutral-600 sm:text-base lg:mx-0">
              Explora propiedades verificadas con asesoría personalizada, respaldo legal y
              acompañamiento de principio a fin.
            </p>
          </div>

          {/* Estadísticas: exactamente 2 unidades visuales (Cabecera unificada con icono + Cifra monumental centrada) */}
          <div className="animate-brand-fade-up max-w-lg mx-auto w-full lg:max-w-none" style={{ animationDelay: "0.14s" }}>
            <div className="grid grid-cols-2 divide-x divide-neutral-300/70 items-center">
              {/* Columna 1: Inmuebles Disponibles */}
              <div className="group relative flex flex-col items-center justify-center text-center px-3 sm:px-6 lg:px-8 transition-transform duration-300 hover:-translate-y-1">
                <div className="relative flex flex-col items-center">
                  {/* Elemento 1: Bloque unificado (Icono + Título centrado) */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/90 text-brand-accent shadow-sm ring-1 ring-brand-accent/20 transition-transform duration-300 group-hover:scale-105">
                      <Building2 className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 stroke-[1.8]" />
                    </div>
                    <h3 className="font-heading text-lg sm:text-2xl lg:text-2xl xl:text-3xl font-black tracking-tight text-brand-primary leading-none whitespace-nowrap">
                      Disponibles
                    </h3>
                  </div>

                  {/* Elemento 2: Cifra Monumental en naranja con aura lumínica centrada */}
                  <div className="relative mt-3 sm:mt-4 leading-none text-center">
                    <div className="relative font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-brand-accent tabular-nums drop-shadow-[0_8px_24px_rgba(222,88,42,0.3)] text-center">
                      <AnimatedCount value={totalProperties} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Columna 2: Asesores Expertos */}
              <div className="group relative flex flex-col items-center justify-center text-center px-3 sm:px-6 lg:px-8 transition-transform duration-300 hover:-translate-y-1">
                <div className="relative flex flex-col items-center">
                  {/* Elemento 1: Bloque unificado (Icono + Título centrado) */}
                  <div className="flex items-center justify-center gap-2 sm:gap-3">
                    <div className="flex h-9 w-9 sm:h-11 sm:w-11 lg:h-12 lg:w-12 shrink-0 items-center justify-center rounded-xl sm:rounded-2xl bg-white/90 text-brand-primary shadow-sm ring-1 ring-brand-primary/20 transition-transform duration-300 group-hover:scale-105">
                      <Users className="h-4 w-4 sm:h-5 sm:w-5 lg:h-6 lg:w-6 stroke-[1.8]" />
                    </div>
                    <h3 className="font-heading text-lg sm:text-2xl lg:text-2xl xl:text-3xl font-black tracking-tight text-brand-primary leading-none whitespace-nowrap">
                      Asesores
                    </h3>
                  </div>

                  {/* Elemento 2: Cifra Monumental en naranja con aura lumínica centrada */}
                  <div className="relative mt-3 sm:mt-4 leading-none text-center">
                    <div className="relative font-heading text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-black tracking-tight text-brand-accent tabular-nums drop-shadow-[0_8px_24px_rgba(222,88,42,0.3)] text-center">
                      <AnimatedCount value={totalAgents} />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
