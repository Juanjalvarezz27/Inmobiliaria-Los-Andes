// Skeleton instantaneo para navegacion a /admin/propiedades sin bloqueo visible
export default function PropiedadesLoading() {
  return (
    <div className="space-y-7 animate-pulse">
      {/* Cabecera skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-neutral-200/60">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-neutral-200/70" />
          <div className="space-y-2">
            <div className="h-6 w-52 bg-neutral-200/80 rounded-lg" />
            <div className="h-3 w-72 bg-neutral-200/50 rounded-md" />
          </div>
        </div>
        <div className="h-10 w-40 bg-neutral-200/70 rounded-xl" />
      </div>

      {/* Barra de filtros skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="h-11 flex-1 bg-white/80 rounded-2xl border border-neutral-200/80 shadow-xs" />
        <div className="h-11 w-32 bg-white/80 rounded-2xl border border-neutral-200/80 shadow-xs" />
        <div className="h-11 w-32 bg-white/80 rounded-2xl border border-neutral-200/80 shadow-xs" />
      </div>

      {/* Grid de propiedades skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div
            key={i}
            className="bg-white/90 rounded-[28px] p-3.5 border border-neutral-200/80 shadow-xs space-y-4"
          >
            {/* Imagen */}
            <div className="h-56 w-full rounded-[22px] bg-neutral-200/70" />
            {/* Badges */}
            <div className="flex gap-2 px-1">
              <div className="h-5 w-16 bg-neutral-200/60 rounded-full" />
              <div className="h-5 w-20 bg-neutral-200/60 rounded-full" />
            </div>
            {/* Título y precio */}
            <div className="space-y-2 px-1">
              <div className="h-4 w-3/4 bg-neutral-200/80 rounded-md" />
              <div className="h-5 w-1/3 bg-neutral-300/70 rounded-md" />
              <div className="h-3 w-1/2 bg-neutral-200/50 rounded-md" />
            </div>
            {/* Acciones */}
            <div className="flex gap-2">
              <div className="h-9 flex-1 bg-neutral-100 rounded-xl" />
              <div className="h-9 w-9 bg-neutral-100 rounded-xl" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

