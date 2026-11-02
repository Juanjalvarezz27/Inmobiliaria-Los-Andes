"use client";

import { useState } from "react";
import Image from "next/image";
import { UserPlus, Phone, Mail, X, Edit2 } from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { createAgentAction, updateAgentAction } from "@/app/admin/actions";

interface AgentItem {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  instagram: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

// Gestor interactivo para crear y actualizar asesores inmobiliarios
export function AgentManager({ agents }: { agents: AgentItem[] }) {
  const [showModal, setShowModal] = useState(false);
  const [editingAgent, setEditingAgent] = useState<AgentItem | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Campos del formulario
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState("Asesor Inmobiliario");
  const [instagram, setInstagram] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingAgent(null);
    setName("");
    setEmail("");
    setPassword("");
    setPhone("+58");
    setPosition("Asesor Inmobiliario");
    setInstagram("");
    setAvatarUrl("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80");
    setIsActive(true);
    setShowModal(true);
  };

  const openEditModal = (agent: AgentItem) => {
    setEditingAgent(agent);
    setName(agent.name);
    setEmail(agent.email);
    setPassword("");
    setPhone(agent.phone || "");
    setPosition(agent.position);
    setInstagram(agent.instagram || "");
    setAvatarUrl(agent.avatarUrl || "");
    setIsActive(agent.isActive);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (editingAgent) {
        await updateAgentAction(editingAgent.id, {
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
      setShowModal(false);
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al procesar el asesor.";
      alert(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Boton Agregar */}
      <div className="flex justify-end">
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-sm font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
        >
          <UserPlus className="w-4 h-4" />
          <span>Registrar Nuevo Asesor</span>
        </button>
      </div>

      {/* Grid de Tarjetas de Asesores */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {agents.map((agent) => (
          <div
            key={agent.id}
            className="bg-ui-surface p-6 rounded-3xl border border-neutral-200 shadow-sm flex flex-col justify-between space-y-5"
          >
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-brand-accent/20 bg-neutral-100 shadow-sm">
                  <Image
                    src={agent.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                    alt={agent.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                </div>
                <span
                  className={`text-[11px] font-bold px-3 py-1 rounded-full ${
                    agent.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-red-50 text-red-600 border border-red-200"
                  }`}
                >
                  {agent.isActive ? "Activo" : "Inactivo"}
                </span>
              </div>

              <div>
                <h3 className="text-base font-black text-brand-primary">{agent.name}</h3>
                <p className="text-xs font-semibold text-text-secondary">{agent.position}</p>
              </div>

              <div className="space-y-2 text-xs text-text-secondary pt-2 border-t border-neutral-100">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
                  <span className="truncate">{agent.email}</span>
                </div>
                {agent.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-green-600 shrink-0" />
                    <span className="font-semibold text-text-primary">{agent.phone}</span>
                  </div>
                )}
                {agent.instagram && (
                  <div className="flex items-center gap-2">
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-600 shrink-0" />
                    <span>@{agent.instagram.replace("@", "")}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="pt-4 border-t border-neutral-100 flex justify-end">
              <button
                onClick={() => openEditModal(agent)}
                className="text-xs font-bold text-brand-primary hover:text-brand-accent flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Editar Asesor</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal de Creacion / Edicion */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-ui-surface w-full max-w-lg rounded-3xl border border-neutral-200 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-6">
            <div className="flex items-center justify-between border-b border-neutral-100 pb-4">
              <h2 className="text-lg font-black text-brand-primary">
                {editingAgent ? "Editar Asesor Inmobiliario" : "Registrar Asesor Inmobiliario"}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="p-1 rounded-lg text-neutral-400 hover:text-neutral-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                  Nombre Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej. Carlos Mendoza"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
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
                    placeholder="carlos@inmobiliarialosandes.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                {!editingAgent && (
                  <div>
                    <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                      Contraseña *
                    </label>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Teléfono (WhatsApp internacional) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. +584125550101"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Cargo o Especialidad *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ej. Asesor Inmobiliario Senior"
                    value={position}
                    onChange={(e) => setPosition(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    Usuario de Instagram
                  </label>
                  <input
                    type="text"
                    placeholder="carlos.losandes"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1">
                    URL Foto de Perfil
                  </label>
                  <input
                    type="url"
                    placeholder="https://images.unsplash.com/..."
                    value={avatarUrl}
                    onChange={(e) => setAvatarUrl(e.target.value)}
                    className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-text-primary">
                  <input
                    type="checkbox"
                    checked={isActive}
                    onChange={(e) => setIsActive(e.target.checked)}
                    className="w-4 h-4 text-brand-accent rounded focus:ring-brand-accent"
                  />
                  <span>Asesor Activo (Disponible para asignación de inmuebles)</span>
                </label>
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2.5 rounded-xl border border-neutral-200 text-xs font-bold text-text-secondary hover:bg-neutral-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 rounded-xl bg-brand-accent hover:bg-[#c94b21] text-white text-xs font-bold transition-all shadow-md disabled:opacity-50"
                >
                  {isSubmitting ? "Guardando..." : "Guardar Asesor"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
