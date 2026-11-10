import React from "react";
import { LucideIcon } from "lucide-react";

interface AdminPageHeaderProps {
  icon: LucideIcon;
  badge?: string;
  category?: string;
  title: string;
  titleHighlight?: string;
  description: string;
  children?: React.ReactNode;
}

// Encabezado de pagina enriquecido con identidad de marca, relieve e impacto tipografico
export function AdminPageHeader({
  icon: Icon,
  badge,
  category,
  title,
  titleHighlight,
  description,
  children,
}: AdminPageHeaderProps) {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-neutral-200/70">
      <div className="flex items-start sm:items-center gap-4 sm:gap-5">
        {/* Contenedor del Icono con Relieve e Iluminación de Marca (Fondo Naranja Terracota con Icono Blanco Nítido) */}
        <div className="relative group shrink-0">
          <div className="relative w-13 h-13 sm:w-15 sm:h-15 rounded-2xl bg-gradient-to-br from-brand-brick-light via-brand-accent to-brand-brick-dark border border-brand-brick-border flex items-center justify-center shadow-lg shadow-brand-accent/25 transition-transform group-hover:scale-[1.02]">
            <Icon className="w-6 h-6 sm:w-7 sm:h-7 text-white drop-shadow-sm" strokeWidth={2.4} />
          </div>
        </div>

        {/* Textos y Jerarquia Tipografica */}
        <div>
          {badge && (
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wider bg-brand-accent/10 text-brand-accent border border-brand-accent/20">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent animate-pulse" />
                {badge}
              </span>
              {category && (
                <>
                  <span className="text-neutral-300 text-xs">•</span>
                  <span className="text-xs font-semibold text-text-secondary">{category}</span>
                </>
              )}
            </div>
          )}

          <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-black text-brand-primary font-heading tracking-tight leading-tight">
            {title}{" "}
            {titleHighlight && (
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-accent to-brand-brick-dark">
                {titleHighlight}
              </span>
            )}
          </h1>

          <p className="text-xs sm:text-sm text-neutral-900 mt-1 max-w-2xl font-semibold leading-relaxed">
            {description}
          </p>
        </div>
      </div>

      {children && (
        <div className="flex items-center gap-2.5 sm:gap-3 shrink-0 self-start md:self-center flex-wrap">
          {children}
        </div>
      )}
    </div>
  );
}

