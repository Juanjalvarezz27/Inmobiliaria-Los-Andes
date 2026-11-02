import { prisma } from "@/lib/prisma";
import Link from "next/link";
import Image from "next/image";
import { PlusCircle, Edit3, ExternalLink, Building2 } from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";
import { DeletePropertyButton } from "@/components/admin/DeletePropertyButton";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

// Vista de gestion y listado de propiedades
export default async function AdminPropertiesPage() {
  const properties = await prisma.property.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      agent: true,
      images: {
        orderBy: { order: "asc" },
      },
    },
  });

  const statusBadgeMap: Record<string, { label: string; class: string }> = {
    AVAILABLE: { label: "Disponible", class: "bg-emerald-50 text-emerald-700 border-emerald-200" },
    RESERVED: { label: "Reservado", class: "bg-amber-50 text-amber-700 border-amber-200" },
    SOLD: { label: "Vendido", class: "bg-neutral-900 text-white border-neutral-900" },
    RENTED: { label: "Alquilado", class: "bg-blue-50 text-blue-700 border-blue-200" },
    HIDDEN: { label: "Oculto", class: "bg-neutral-100 text-neutral-500 border-neutral-200" },
    ARCHIVED: { label: "Archivado", class: "bg-neutral-100 text-neutral-500 border-neutral-200" },
  };

  return (
    <div className="space-y-7">
      {/* Cabecera */}
      <AdminPageHeader
        icon={Building2}
        title="Gestión de"
        titleHighlight="Inmuebles"
        description="Administra, publica, edita o retira propiedades residenciales y comerciales del catálogo."
      >
        <Link
          href="/admin/propiedades/nueva"
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-sm font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-95 shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Cargar Propiedad</span>
        </Link>
      </AdminPageHeader>

      {/* Tabla de Propiedades */}
      <div className="bg-ui-surface rounded-2xl border border-neutral-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-neutral-50 text-text-secondary text-xs font-bold uppercase tracking-wider border-b border-neutral-200/80">
              <tr>
                <th className="py-4 px-6">Inmueble</th>
                <th className="py-4 px-6">Operación</th>
                <th className="py-4 px-6">Precio</th>
                <th className="py-4 px-6">Estado</th>
                <th className="py-4 px-6">Asesor Asignado</th>
                <th className="py-4 px-6 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {properties.map((p) => {
                const coverImage =
                  p.images.find((img) => img.isMain)?.url ||
                  p.images[0]?.url ||
                  "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=400&q=80";

                const badge = statusBadgeMap[p.status] || {
                  label: p.status,
                  class: "bg-neutral-100 text-neutral-700",
                };

                return (
                  <tr key={p.id} className="hover:bg-neutral-50/50 transition-colors">
                    {/* Inmueble con foto miniatura */}
                    <td className="py-4 px-6">
                      <div className="flex items-center gap-3">
                        <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-neutral-100 border border-neutral-200">
                          <Image src={coverImage} alt={p.title} fill sizes="56px" className="object-cover" />
                        </div>
                        <div className="min-w-0 max-w-xs">
                          <span className="font-bold text-text-primary block truncate">{p.title}</span>
                          <span className="text-xs text-text-secondary block truncate">
                            {p.sector ? `${p.sector}, ` : ""}
                            {p.city}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Operacion */}
                    <td className="py-4 px-6 font-semibold text-xs">
                      <span className="px-2.5 py-1 rounded-full bg-neutral-100 text-neutral-800">
                        {p.operationType === "SALE" ? "Venta" : "Alquiler"}
                      </span>
                    </td>

                    {/* Precio */}
                    <td className="py-4 px-6 font-bold text-brand-primary">
                      {formatCurrency(p.price.toString(), p.currency)}
                    </td>

                    {/* Estado */}
                    <td className="py-4 px-6">
                      <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${badge.class}`}>
                        {badge.label}
                      </span>
                    </td>

                    {/* Asesor */}
                    <td className="py-4 px-6 text-xs text-text-secondary">
                      <span className="font-medium text-text-primary block">{p.agent.name}</span>
                    </td>

                    {/* Acciones */}
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/propiedades/${p.slug}`}
                          target="_blank"
                          title="Ver en web pública"
                          className="p-2 text-neutral-400 hover:text-brand-primary hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </Link>
                        <Link
                          href={`/admin/propiedades/${p.id}/editar`}
                          title="Editar"
                          className="p-2 text-neutral-400 hover:text-brand-accent hover:bg-neutral-100 rounded-lg transition-colors"
                        >
                          <Edit3 className="w-4 h-4" />
                        </Link>
                        <DeletePropertyButton id={p.id} title={p.title} />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

