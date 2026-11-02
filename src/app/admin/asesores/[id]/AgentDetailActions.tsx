"use client";

import { useState } from "react";
import Link from "next/link";
import { Power, Edit2, PlusCircle, Loader2 } from "lucide-react";
import { toggleAgentStatusAction } from "@/app/admin/actions";
import { AgentModal, AgentFormData } from "@/components/admin/AgentModal";

interface AgentDetailActionsProps {
  agent: AgentFormData;
}

// Botones de accion y cambio de estado para la vista de detalle del asesor
export function AgentDetailActions({ agent }: AgentDetailActionsProps) {
  const [isActive, setIsActive] = useState(agent.isActive);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const handleToggle = async () => {
    const actionText = isActive ? "inactivar (pausar)" : "reactivar";
    if (!confirm(`¿Estás seguro de que deseas ${actionText} a ${agent.name}?`)) {
      return;
    }

    setIsLoading(true);
    try {
      const res = await toggleAgentStatusAction(agent.id);
      setIsActive(res.isActive);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cambiar el estado del asesor.";
      alert(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-3">
        {/* Accion para alternar el estado sin eliminar */}
        <button
          type="button"
          onClick={handleToggle}
          disabled={isLoading}
          title={isActive ? "Pausar actividad del asesor" : "Reactivar asesor en el equipo"}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-sm active:scale-95 border ${
            isActive
              ? "bg-neutral-100 hover:bg-neutral-200 text-neutral-700 border-neutral-300"
              : "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Power className="w-4 h-4" />
          )}
          <span>{isActive ? "Inactivar Asesor" : "Reactivar Asesor"}</span>
        </button>

        {/* Abrir modal de edicion */}
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="inline-flex items-center gap-2 bg-white hover:bg-neutral-50 text-brand-primary border border-neutral-300 text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all active:scale-95"
        >
          <Edit2 className="w-4 h-4 text-brand-accent" />
          <span>Editar Datos</span>
        </button>

        {/* Asignar nueva propiedad */}
        <Link
          href={`/admin/propiedades/nueva?agentId=${agent.id}`}
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Asignar Propiedad</span>
        </Link>
      </div>

      <AgentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        agent={{ ...agent, isActive }}
      />
    </>
  );
}

