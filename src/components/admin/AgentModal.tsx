"use client";

import { useState } from "react";
import Image from "next/image";
import { X, Loader2, UserPlus, Save } from "lucide-react";
import { createAgentAction, updateAgentAction } from "@/app/admin/actions";

export interface AgentFormData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  instagram: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentFormData | null;
}

// Formulario interno con estado inicializado por llave de componente (sin cascading renders)
function AgentFormContent({
  agent,
  onClose,
}: {
  agent?: AgentFormData | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(agent?.name || "");
  const [email, setEmail] = useState(agent?.email || "");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState(agent?.phone || "+58");
  const [position, setPosition] = useState(agent?.position || "Asesor Inmobiliario");
  const [instagram, setInstagram] = useState(agent?.instagram || "");
  const [avatarUrl, setAvatarUrl] = useState(
    agent?.avatarUrl ||
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
  );
  const [isActive, setIsActive] = useState(agent?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (agent) {
        await updateAgentAction(agent.id, {
          name,
          email,
          phone,
          position,
          instagram,
          avatarUrl,
          isActive,
        });
      } else {
        await createAgentAction({
          name,
          email,
          password,
          phone,
          position,
          instagram,
          avatarUrl,
          isActive,
        });
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al procesar el asesor.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-ui-surface w-full max-w-lg rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6 my-8 animate-in fade-in zoom-in-95 duration-150">
      <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
        <div>
          <h2 className="text-xl font-bold text-brand-primary font-heading">
            {agent ? "Editar Datos del Asesor" : "Registrar Nuevo Asesor"}
          </h2>
          <p className="text-xs text-text-secondary mt-0.5">
            {agent
              ? "Actualiza el perfil profesional y canales de contacto."
              : "Agrega un nuevo miembro al equipo comercial."}
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-2 rounded-xl text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Vista previa de avatar */}
        <div className="flex items-center gap-4 p-3 bg-neutral-50 rounded-2xl border border-neutral-200/70">
          <div className="relative w-14 h-14 rounded-2xl overflow-hidden border-2 border-brand-accent/20 bg-neutral-200 shrink-0">
            <Image
              src={
                avatarUrl ||
                "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
              }
              alt="Vista previa"
              fill
              sizes="56px"
              className="object-cover"
            />
          </div>
          <div className="flex-1 min-w-0">
            <label className="block text-[11px] font-bold text-text-secondary uppercase tracking-wider mb-1">
              URL de Foto de Perfil
            </label>
            <input
              type="url"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
              placeholder="https://..."
              className="w-full text-xs px-3 py-2 rounded-xl border border-neutral-200 bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent truncate"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
            Nombre Completo *
          </label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej. Mariana Briceño"
            className="w-full text-sm px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Correo Electrónico *
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="asesor@inmobiliarialosandes.com"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Cargo / Especialidad
            </label>
            <input
              type="text"
              value={position}
              onChange={(e) => setPosition(e.target.value)}
              placeholder="Ej. Asesor Inmobiliario Senior"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Teléfono (WhatsApp) *
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+584125550101"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
            <p className="text-[10px] text-text-secondary mt-1">Con código internacional (+58).</p>
          </div>

          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Usuario de Instagram
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-neutral-400 text-sm">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
                placeholder="usuario.inmobiliaria"
                className="w-full text-sm pl-8 pr-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>
        </div>

        {!agent && (
          <div>
            <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
              Contraseña Temporal
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Opcional (Por defecto: Asesor123*)"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-neutral-200 bg-neutral-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent"
            />
          </div>
        )}

        {/* Selector de Estado Activo / Inactivo */}
        <div className="p-4 bg-neutral-50 rounded-2xl border border-neutral-200/80 space-y-2">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Estado de Actividad del Asesor
          </label>
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-text-primary">
              <input
                type="radio"
                name="isActive"
                checked={isActive}
                onChange={() => setIsActive(true)}
                className="w-4 h-4 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                Activo (Disponible)
              </span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-text-primary">
              <input
                type="radio"
                name="isActive"
                checked={!isActive}
                onChange={() => setIsActive(false)}
                className="w-4 h-4 text-neutral-600 focus:ring-neutral-500"
              />
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-neutral-400" />
                Inactivo (En Pausa)
              </span>
            </label>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            Un asesor inactivo no se elimina de la base de datos para preservar el historial de sus propiedades, pero no aparecerá disponible para asignar a nuevos inmuebles.
          </p>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-colors"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-sm font-bold px-6 py-2.5 rounded-xl shadow-md transition-all active:scale-95 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Guardando...</span>
              </>
            ) : agent ? (
              <>
                <Save className="w-4 h-4" />
                <span>Actualizar Asesor</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Crear Asesor</span>
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}

// Modal contenedor principal
export function AgentModal({ isOpen, onClose, agent }: AgentModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <AgentFormContent key={agent?.id || "new"} agent={agent} onClose={onClose} />
    </div>
  );
}
