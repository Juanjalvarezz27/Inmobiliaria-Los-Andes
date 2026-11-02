import { prisma } from "@/lib/prisma";
import Link from "next/link";
import {
  Home,
  Users,
  PlusCircle,
  Tag,
  Key,
  ArrowRight,
} from "lucide-react";
import { formatCurrency } from "@/lib/utils/format";

// Pagina principal de metricas y resumen del panel administrativo
export default async function AdminDashboardPage() {
  const [totalProperties, saleProperties, rentProperties, totalAgents, recentProperties] =
    await Promise.all([
      prisma.property.count(),
      prisma.property.count({ where: { operationType: "SALE" } }),
      prisma.property.count({ where: { operationType: "RENT" } }),
      prisma.user.count({ where: { role: "AGENT" } }),
      prisma.property.findMany({
        take: 5,
        orderBy: { createdAt: "desc" },
        include: { agent: true },
      }),
    ]);

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tight">
            Panel de Control General
          </h1>
          <p className="text-sm text-text-secondary">
            Resumen operativo y métricas del catálogo inmobiliario.
          </p>
        </div>

        <Link
          href="/admin/propiedades/nueva"
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Nueva Propiedad</span>
        </Link>
      </div>

      {/* Tarjetas de Metricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-ui-surface p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-brand-primary/10 flex items-center justify-center text-brand-primary shrink-0">
            <Home className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-text-secondary tracking-wider block">
              Total Inmuebles
            </span>
            <span className="text-2xl font-black text-brand-primary">{totalProperties}</span>
          </div>
        </div>

        <div className="bg-ui-surface p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
            <Tag className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-text-secondary tracking-wider block">
              En Venta
            </span>
            <span className="text-2xl font-black text-text-primary">{saleProperties}</span>
          </div>
        </div>

        <div className="bg-ui-surface p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-600 shrink-0">
            <Key className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-text-secondary tracking-wider block">
              En Alquiler
            </span>
            <span className="text-2xl font-black text-text-primary">{rentProperties}</span>
          </div>
        </div>

        <div className="bg-ui-surface p-6 rounded-2xl border border-neutral-200/80 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-600 shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-text-secondary tracking-wider block">
              Asesores Activos
            </span>
            <span className="text-2xl font-black text-text-primary">{totalAgents}</span>
          </div>
        </div>
      </div>

      {/* Listado de Ultimas Propiedades Publicadas */}
      <div className="bg-ui-surface rounded-2xl border border-neutral-200 shadow-sm overflow-hidden space-y-4">
        <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold text-brand-primary">Últimas Publicaciones Cargadas</h2>
            <p className="text-xs text-text-secondary">Inmuebles registrados recientemente en el sistema.</p>
          </div>
          <Link
            href="/admin/propiedades"
            className="text-xs font-bold text-brand-accent hover:underline flex items-center gap-1"
          >
            <span>Ver todas</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="divide-y divide-neutral-100">
          {recentProperties.map((p) => (
            <div key={p.id} className="p-4 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-neutral-50/50 transition-colors">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-neutral-100 text-neutral-700">
                    {p.operationType === "SALE" ? "Venta" : "Alquiler"}
                  </span>
                  <span className="text-xs font-bold text-brand-accent">
                    {formatCurrency(p.price.toString(), p.currency)}
                  </span>
                </div>
                <h3 className="font-bold text-text-primary text-sm sm:text-base">{p.title}</h3>
                <p className="text-xs text-text-secondary">
                  Asesor: {p.agent.name} • {p.city}
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/propiedades/${p.slug}`}
                  target="_blank"
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg border border-neutral-200 hover:bg-neutral-100 text-text-secondary transition-colors"
                >
                  Ver Ficha
                </Link>
                <Link
                  href={`/admin/propiedades/${p.id}/editar`}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-brand-primary text-white hover:bg-opacity-90 transition-colors"
                >
                  Editar
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
