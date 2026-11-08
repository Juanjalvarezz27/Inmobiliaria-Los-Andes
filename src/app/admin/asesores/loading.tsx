// Skeleton instantaneo para navegacion a /admin/asesores sin bloqueo visible
export default function AsesoresLoading() {
  return (
    <div className="space-y-7 animate-pulse">
      {/* Cabecera skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-200/70" />
          <div className="space-y-2">
            <div className="h-6 w-56 bg-neutral-200/80 rounded-lg" />
            <div className="h-3 w-80 bg-neutral-200/50 rounded-md" />
          </div>
        </div>
        <div className="h-10 w-44 bg-neutral-200/70 rounded-xl" />
      </div>

      {/* Metricas skeleton (4 tarjetas) */}
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

      {/* Barra de filtros y búsqueda skeleton */}
      <div className="h-14 bg-white/80 rounded-3xl border border-neutral-200/80 shadow-xs" />

      {/* Grid de tarjetas de asesores skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white/90 rounded-[28px] border border-neutral-200/80 shadow-xs overflow-hidden"
          >
            {/* Foto */}
            <div className="h-56 w-full bg-neutral-200/70" />
            {/* Info */}
            <div className="p-4 space-y-3">
              <div className="h-5 w-2/3 bg-neutral-200/80 rounded-lg" />
              <div className="h-3 w-1/2 bg-neutral-200/50 rounded-md" />
              <div className="flex gap-2 pt-1">
                <div className="h-7 w-20 bg-neutral-100 rounded-lg" />
                <div className="h-7 flex-1 bg-neutral-100 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

