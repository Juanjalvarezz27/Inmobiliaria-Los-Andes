import { Building2, Users } from "lucide-react";
import { CatalogBannerDecor } from "./CatalogBannerDecor";

interface CatalogBannerProps {
  totalProperties: number;
  totalAgents: number;
}

// Franja institucional a todo el ancho que separa el hero del catalogo
// y resume el inventario disponible con estadisticas animadas.
export function CatalogBanner({ totalProperties, totalAgents }: CatalogBannerProps) {
  const formatNumber = (value: number) => value.toLocaleString("es-VE");

  const stats = [
    {
      icon: Building2,
      value: formatNumber(totalProperties),
      label: "Inmuebles disponibles",
    },
    {
      icon: Users,
      value: formatNumber(totalAgents),
      label: "Asesores expertos",
    },
  ];

  return (
    <section
      id="catalogo"
      className="relative isolate w-full overflow-hidden border-y border-white/15 bg-gradient-to-br from-[#f07038] via-brand-accent to-[#9c2f0c] animate-brand-gradient text-white"
    >
      {/* Decoracion de fondo (resplandores y brillo) sincronizada con el scroll */}
      <CatalogBannerDecor />

      <div className="relative mx-auto max-w-7xl px-4 py-14 sm:px-6 sm:py-16 lg:px-8">
        <div className="grid items-center gap-10 lg:grid-cols-[1.55fr_1fr] lg:gap-14">
          {/* Bloque de titulo */}
          <div className="animate-brand-fade-up text-center lg:text-left">
            <h2 className="text-3xl font-black leading-[1.05] tracking-tight font-heading drop-shadow-[0_6px_20px_rgba(0,0,0,0.25)] sm:text-4xl lg:text-5xl xl:text-[3.4rem]">
              Catálogo de{" "}
              <span className="relative inline-block whitespace-nowrap">
                Inmuebles
                <svg
                  aria-hidden
                  viewBox="0 0 300 14"
                  preserveAspectRatio="none"
                  className="absolute -bottom-1.5 left-0 h-2.5 w-full text-white/45"
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

            <p className="mx-auto mt-5 max-w-xl text-sm font-medium leading-relaxed text-white sm:text-base lg:mx-0">
              Explora propiedades verificadas con asesoría personalizada, respaldo legal y
              acompañamiento de principio a fin.
            </p>
          </div>

          {/* Cifras del inventario en clave editorial: sin tarjetas, solo tipografia y lineas */}
          <div className="animate-brand-fade-up" style={{ animationDelay: "0.15s" }}>
            <div className="grid grid-cols-2 divide-x divide-white/20">
              {stats.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={stat.label}
                    className={index === 0 ? "pr-5 sm:pr-10" : "pl-5 sm:pl-10"}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className="text-[10px] font-bold tabular-nums tracking-widest text-white/55">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      <Icon className="h-3.5 w-3.5 shrink-0 text-white/60" />
                      <span aria-hidden className="h-px flex-1 bg-white/25" />
                    </div>

                    <p className="mt-4 font-heading text-4xl font-black leading-none tracking-tight tabular-nums sm:text-5xl xl:text-[3.25rem]">
                      {stat.value}
                    </p>

                    <p className="mt-3 text-[10px] font-semibold uppercase leading-snug tracking-[0.12em] text-white/90 sm:text-[11px]">
                      {stat.label}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
