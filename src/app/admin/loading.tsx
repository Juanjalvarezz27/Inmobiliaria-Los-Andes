import React from "react";

// Estado de carga instantaneo para navegacion fluida y sin bloqueos en el panel admin
export default function AdminLoading() {
  return (
    <div className="space-y-7 animate-pulse">
      {/* Cabecera Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-200/70" />
          <div className="space-y-2">
            <div className="h-6 w-48 bg-neutral-200/80 rounded-lg" />
            <div className="h-3 w-72 bg-neutral-200/50 rounded-md" />
          </div>
        </div>
        <div className="h-10 w-36 bg-neutral-200/70 rounded-xl" />
      </div>

      {/* Metricas Skeleton (4 tarjetas) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className="bg-white/80 p-5 rounded-3xl border border-neutral-200/80 shadow-xs h-28 flex items-center justify-between"
          >
            <div className="space-y-2">
              <div className="h-3 w-24 bg-neutral-200/70 rounded-md" />
              <div className="h-7 w-16 bg-neutral-300/80 rounded-lg" />
            </div>
            <div className="w-12 h-12 rounded-2xl bg-neutral-200/70" />
          </div>
        ))}
      </div>

      {/* Barra de Filtros Skeleton */}
      <div className="h-14 bg-white/80 rounded-3xl border border-neutral-200/80 shadow-xs" />

      {/* Grid de Tarjetas Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white/90 rounded-[28px] p-3.5 border border-neutral-200/80 shadow-xs space-y-4"
          >
            <div className="h-60 w-full rounded-[22px] bg-neutral-200/70" />
            <div className="space-y-2 px-1">
              <div className="h-4 w-3/4 bg-neutral-200/80 rounded-md" />
              <div className="h-3 w-1/2 bg-neutral-200/50 rounded-md" />
            </div>
            <div className="h-8 w-full bg-neutral-100 rounded-xl" />
          </div>
        ))}
      </div>
    </div>
  );
}

