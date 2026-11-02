"use client";

import { useState } from "react";
import Link from "next/link";
import { Power, Edit2, PlusCircle, Loader2 } from "lucide-react";
import { toggleAgentStatusAction } from "@/app/admin/actions";
import { AgentModal, AgentFormData } from "@/components/admin/AgentModal";
import { ConfirmModal } from "@/components/ui/ConfirmModal";

interface AgentDetailActionsProps {
  agent: AgentFormData;
}

// Botones de accion y cambio de estado para la vista de detalle del asesor
export function AgentDetailActions({ agent }: AgentDetailActionsProps) {
  const [isActive, setIsActive] = useState(agent.isActive);
  const [isLoading, setIsLoading] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  const handleToggle = async () => {
    setIsLoading(true);
    try {
      const res = await toggleAgentStatusAction(agent.id);
      setIsActive(res.isActive);
      setShowConfirmModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al cambiar el estado del asesor.";
      console.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-full sm:w-56 shrink-0 lg:border-l lg:border-emerald-500/20 lg:pl-6 justify-center">
        {/* Asignar nueva propiedad (Accion Principal Terracota) */}
        <Link
          href={`/admin/propiedades/nueva?agentId=${agent.id}`}
          className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-[#e85d30] via-brand-accent to-[#c4441b] hover:shadow-lg hover:shadow-brand-accent/30 hover:-translate-y-0.5 text-white text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-md shadow-brand-accent/20 transition-all active:scale-95"
        >
          <PlusCircle className="w-4 h-4 shrink-0" />
          <span>Asignar Propiedad</span>
        </Link>

        {/* Abrir modal de edicion (Secundaria Solida Blanca de Alto Contraste) */}
        <button
          type="button"
          onClick={() => setShowEditModal(true)}
          className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-neutral-100 text-brand-primary text-xs sm:text-sm font-bold px-4 py-2.5 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <Edit2 className="w-4 h-4 text-brand-accent shrink-0" />
          <span>Editar Datos</span>
        </button>

        {/* Accion para alternar el estado (Inactivar / Reactivar Asesor) */}
        <button
          type="button"
          onClick={() => setShowConfirmModal(true)}
          disabled={isLoading}
          title={isActive ? "Pausar actividad del asesor" : "Reactivar asesor en el equipo"}
          className={`w-full group inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shadow-xs active:scale-95 border ${
            isActive
              ? "bg-white/10 hover:bg-white/20 text-white border-white/20 hover:border-white/35 backdrop-blur-xs"
              : "bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-950/40"
          }`}
        >
          {isLoading ? (
            <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          ) : (
            <Power className="w-4 h-4 shrink-0 text-white/80 group-hover:text-white transition-colors" />
          )}
          <span>{isActive ? "Inactivar Asesor" : "Reactivar Asesor"}</span>
        </button>
      </div>

      {/* Modal de confirmacion de cambio de estado */}
      <ConfirmModal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        onConfirm={handleToggle}
        isLoading={isLoading}
        variant={isActive ? "warning" : "info"}
        title={isActive ? "Pausar Asesor Inmobiliario" : "Reactivar Asesor Inmobiliario"}
        description={
          isActive
            ? `¿Estás seguro de que deseas pausar a ${agent.name}? Sus inmuebles asignados seguirán registrados, pero el asesor no figurará en estado activo.`
            : `¿Estás seguro de que deseas reactivar a ${agent.name}? El asesor volverá a figurar como activo en el equipo.`
        }
        itemHighlight={agent.name}
        confirmText={isActive ? "Pausar Asesor" : "Reactivar Asesor"}
        cancelText="Volver"
      />

      <AgentModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        agent={{ ...agent, isActive }}
      />
    </>
  );
}

