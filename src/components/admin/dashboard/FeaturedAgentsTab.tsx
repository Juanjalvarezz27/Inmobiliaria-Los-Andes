"use client";

import Image from "next/image";
import { Users, Star } from "lucide-react";

export interface AgentOverviewItem {
  id: string;
  name: string;
  position: string;
  avatarUrl?: string | null;
  phone?: string | null;
  propertiesCount: number;
  featured: boolean;
  isActive?: boolean;
}

interface FeaturedAgentsTabProps {
  agents: AgentOverviewItem[];
  featuredAgentsCount: number;
  isPending: boolean;
  onToggleFeatured: (agentId: string) => void;
}

// Pestaña de seleccion de asesores para la portada con control de limite maximo
export function FeaturedAgentsTab({
  agents,
  featuredAgentsCount,
  isPending,
  onToggleFeatured,
}: FeaturedAgentsTabProps) {
  if (agents.length === 0) {
    return (
      <div className="col-span-full py-12 text-center text-text-secondary text-xs bg-neutral-50 rounded-2xl border border-dashed border-neutral-200">
        No se encontraron asesores que coincidan con la búsqueda.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
      {agents.map((agent) => (
        <div
          key={agent.id}
          className={`p-4 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
            agent.featured
              ? "bg-white border-neutral-200/90 shadow-2xs hover:border-brand-accent/40"
              : "bg-neutral-50/50 border-neutral-200/60 opacity-75 hover:opacity-100 hover:border-neutral-300"
          }`}
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-12 h-12 rounded-full overflow-hidden shrink-0 bg-neutral-100 ring-2 ring-neutral-200/80">
              {agent.avatarUrl ? (
                <Image
                  src={agent.avatarUrl}
                  alt={agent.name}
                  fill
                  unoptimized
                  sizes="48px"
                  className="object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-400">
                  <Users className="w-5 h-5" />
                </div>
              )}
            </div>

            <div className="min-w-0 space-y-0.5">
              <h4 className="font-bold text-xs sm:text-sm text-brand-primary truncate">
                {agent.name}
              </h4>
              <p className="text-[11px] text-text-secondary truncate">
                {agent.position}
              </p>
              <span className="text-[10px] font-bold text-brand-accent block">
                {agent.propertiesCount} inmuebles asignados
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => onToggleFeatured(agent.id)}
            disabled={isPending}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer active:scale-95 disabled:opacity-50 ${
              agent.featured
                ? "bg-emerald-50 text-emerald-800 border border-emerald-300 hover:bg-emerald-100 shadow-2xs"
                : featuredAgentsCount >= 8
                ? "bg-neutral-100 text-neutral-400 border border-neutral-200 hover:border-amber-300 hover:text-amber-700"
                : "bg-white text-neutral-500 border border-neutral-200 hover:border-neutral-300 hover:text-neutral-700"
            }`}
            title={
              agent.featured
                ? "Quitar de la página de inicio"
                : featuredAgentsCount >= 8
                ? "Límite de 8 alcanzado. Desmarca uno antes de agregar este."
                : "Mostrar en la página de inicio"
            }
          >
            <Star
              className={`w-3.5 h-3.5 ${
                agent.featured
                  ? "text-amber-500 fill-amber-500"
                  : featuredAgentsCount >= 8
                  ? "text-neutral-300"
                  : "text-neutral-400"
              }`}
            />
            <span>{agent.featured ? "En Inicio" : "No en Inicio"}</span>
          </button>
        </div>
      ))}
    </div>
  );
}
