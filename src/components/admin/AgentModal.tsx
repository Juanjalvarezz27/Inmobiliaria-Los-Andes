"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import {
  X,
  Loader2,
  UserPlus,
  Save,
  UploadCloud,
  User,
  Mail,
  Phone,
  Check,
  UserCog,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { compressImage } from "@/lib/imageCompression";
import {
  createAgentAction,
  updateAgentAction,
  uploadAvatarAction,
} from "@/app/admin/actions";

export interface AgentFormData {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  position?: string;
  instagram: string | null;
  avatarUrl: string | null;
  isActive: boolean;
}

interface AgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  agent?: AgentFormData | null;
}

// Formulario de asesor con cabecera verde sólida, fondo blanco luminoso e iconos naranja
function AgentFormContent({
  agent,
  onClose,
}: {
  agent?: AgentFormData | null;
  onClose: () => void;
}) {
  const [name, setName] = useState(agent?.name || "");
  const [email, setEmail] = useState(agent?.email || "");
  const [phone, setPhone] = useState(agent?.phone || "+58");
  const [instagram, setInstagram] = useState(agent?.instagram || "");

  // Foto de perfil con carga directa desde el dispositivo
  const defaultAvatar =
    agent?.avatarUrl ||
    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80";
  const [previewUrl, setPreviewUrl] = useState<string>(defaultAvatar);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);

  const [isActive, setIsActive] = useState(agent?.isActive ?? true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Manejador para carga y compresion inteligente de imagen
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setFormError("Por favor selecciona un archivo de imagen válido (PNG, JPG o WEBP).");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      setFormError("La imagen no debe superar los 15MB de tamaño.");
      return;
    }

    setIsCompressing(true);
    setFormError(null);

    try {
      // Compresion silenciosa: reduce peso preservando nitidez visual en WebP HD
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.85,
        targetFormat: "image/webp",
      });

      setSelectedFile(compressed.file);
      setPreviewUrl(compressed.previewUrl);
    } catch (err: unknown) {
      console.error(err);
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    } finally {
      setIsCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError(null);

    try {
      let finalAvatarUrl = agent?.avatarUrl || defaultAvatar;

      // Si se seleccionó una imagen nueva, subirla directamente
      if (selectedFile) {
        const formData = new FormData();
        formData.append("file", selectedFile);
        const uploadRes = await uploadAvatarAction(formData);

        if (!uploadRes.success || !uploadRes.url) {
          throw new Error(uploadRes.error || "Error al subir la fotografía al servidor.");
        }
        finalAvatarUrl = uploadRes.url;
      }

      if (agent) {
        await updateAgentAction(agent.id, {
          name,
          email,
          phone,
          instagram,
          avatarUrl: finalAvatarUrl,
          isActive,
        });
      } else {
        await createAgentAction({
          name,
          email,
          phone,
          instagram,
          avatarUrl: finalAvatarUrl,
          isActive,
        });
      }
      onClose();
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Error al procesar el asesor.";
      setFormError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-brand-primary w-full max-w-2xl rounded-3xl shadow-2xl shadow-black/50 overflow-hidden my-6 border-0 animate-in fade-in zoom-in-95 duration-200">
      {/* Cabecera de un solo tono verde de marca */}
      <div className="p-6 text-white flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-white/10 flex items-center justify-center text-brand-accent shrink-0">
            <UserCog className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white font-heading tracking-tight leading-tight">
              {agent ? "Editar Datos del Asesor" : "Registrar Nuevo Asesor"}
            </h2>
            <p className="text-xs text-emerald-100/80 mt-0.5">
              {agent
                ? "Actualiza la fotografía, canales de contacto y disponibilidad."
                : "Agrega un nuevo asesor inmobiliario al equipo comercial."}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 hover:text-white flex items-center justify-center transition-colors shrink-0"
          title="Cerrar ventana"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Cuerpo del formulario con fondo blanco */}
      <form onSubmit={handleSubmit} className="bg-white p-6 sm:p-7 space-y-6 max-h-[80vh] overflow-y-auto">
        {formError && (
          <div className="p-4 bg-red-50 text-red-700 text-xs font-semibold rounded-2xl border border-red-200 flex items-center gap-2">
            <span>{formError}</span>
          </div>
        )}

        {/* Zona de Fotografia con carga directa */}
        <div className="p-5 bg-neutral-50/80 rounded-2xl border border-neutral-200/80">
          <span className="text-xs font-bold uppercase tracking-wider text-text-secondary flex items-center gap-2 mb-3.5">
            <UploadCloud className="w-4 h-4 text-brand-accent" />
            Fotografía del Asesor
          </span>

          <div className="flex flex-col sm:flex-row items-center gap-5">
            {/* Marco de vista previa */}
            <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border-2 border-brand-accent/30 shadow-xs bg-neutral-200 shrink-0 group">
              <Image
                src={previewUrl}
                alt="Vista previa del asesor"
                fill
                sizes="128px"
                className="object-cover object-top"
              />
              {isCompressing ? (
                <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white text-[10px] font-bold gap-1 z-10">
                  <Loader2 className="w-5 h-5 text-brand-accent animate-spin" />
                  <span>Optimizando...</span>
                </div>
              ) : (
                <label
                  htmlFor="agent-photo-upload"
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity text-white text-[11px] font-bold cursor-pointer"
                >
                  <UploadCloud className="w-5 h-5 mb-1 text-brand-accent" />
                  Cambiar foto
                </label>
              )}
            </div>

            {/* Selector de archivo directo con compresor integrado */}
            <div className="flex-1 w-full space-y-2">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/png,image/jpeg,image/webp"
                onChange={handleFileChange}
                disabled={isCompressing || isSubmitting}
                className="hidden"
                id="agent-photo-upload"
              />
              <label
                htmlFor="agent-photo-upload"
                className={`w-full flex flex-col items-center justify-center p-4 rounded-xl border-2 border-dashed transition-all group text-center cursor-pointer ${
                  isCompressing
                    ? "bg-neutral-100 border-neutral-300 opacity-70 pointer-events-none"
                    : "border-neutral-300 hover:border-brand-accent bg-white hover:bg-orange-50/20"
                }`}
              >
                {isCompressing ? (
                  <>
                    <Loader2 className="w-6 h-6 text-brand-accent animate-spin mb-1.5" />
                    <span className="text-xs font-bold text-text-primary">
                      Comprimiendo y optimizando fotografía...
                    </span>
                    <span className="text-[11px] text-text-secondary mt-0.5">
                      Codificando a WebP HD sin pérdida de nitidez
                    </span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-6 h-6 text-brand-accent group-hover:scale-110 transition-transform mb-1.5" />
                    <span className="text-xs font-bold text-text-primary">
                      {selectedFile ? selectedFile.name : "Subir foto desde tu dispositivo"}
                    </span>
                    <span className="text-[11px] text-text-secondary mt-0.5">
                      {selectedFile
                        ? "Click para elegir otra fotografía"
                        : "Formatos PNG, JPG o WEBP (máx. 15MB)"}
                    </span>
                  </>
                )}
              </label>
            </div>
          </div>
        </div>

        {/* Campos de información organizados en cuadrícula de 2 columnas */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Nombre Completo (ocupa todo el ancho) */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-brand-accent" />
              <span>Nombre Completo *</span>
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ej. Mariana Briceño"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all font-medium text-text-primary"
            />
          </div>

          {/* Correo Electrónico */}
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-brand-accent" />
              <span>Correo Electrónico *</span>
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="asesor@inmobiliarialosandes.com"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all font-medium text-text-primary"
            />
          </div>

          {/* Teléfono (WhatsApp) */}
          <div>
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-brand-accent" />
              <span>Teléfono (WhatsApp) *</span>
            </label>
            <input
              type="text"
              required
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="+584125550101"
              className="w-full text-sm px-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all font-medium text-text-primary"
            />
          </div>

          {/* Usuario de Instagram */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-bold text-text-primary uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <InstagramIcon className="w-3.5 h-3.5 text-brand-accent" />
              <span>Usuario de Instagram</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-2.5 text-neutral-400 text-sm font-medium">@</span>
              <input
                type="text"
                value={instagram}
                onChange={(e) => setInstagram(e.target.value.replace("@", ""))}
                placeholder="mariana.inmobiliaria"
                className="w-full text-sm pl-8 pr-4 py-2.5 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-brand-accent/20 focus:border-brand-accent transition-all font-medium text-text-primary"
              />
            </div>
          </div>
        </div>

        {/* Selector de Estado Operativo */}
        <div className="space-y-2 pt-1">
          <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider">
            Estado Operativo del Asesor
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Tarjeta Activo */}
            <button
              type="button"
              onClick={() => setIsActive(true)}
              className={`p-3.5 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
                isActive
                  ? "bg-emerald-50/70 border-emerald-500 shadow-xs text-emerald-950"
                  : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    isActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-300"
                  }`}
                />
                <div>
                  <span className="text-xs font-bold block">Activo (Disponible)</span>
                  <span className="text-[11px] text-text-secondary block">
                    Acepta nuevos inmuebles
                  </span>
                </div>
              </div>
              {isActive && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
            </button>

            {/* Tarjeta Inactivo */}
            <button
              type="button"
              onClick={() => setIsActive(false)}
              className={`p-3.5 rounded-xl border-2 flex items-center justify-between text-left transition-all ${
                !isActive
                  ? "bg-amber-50/70 border-amber-500 shadow-xs text-amber-950"
                  : "bg-white border-neutral-200 text-neutral-500 hover:border-neutral-300"
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-3 h-3 rounded-full ${
                    !isActive ? "bg-amber-500" : "bg-neutral-300"
                  }`}
                />
                <div>
                  <span className="text-xs font-bold block">Pausado (Inactivo)</span>
                  <span className="text-[11px] text-text-secondary block">
                    Preserva inmuebles sin altas
                  </span>
                </div>
              </div>
              {!isActive && <Check className="w-4 h-4 text-amber-600 shrink-0" />}
            </button>
          </div>
        </div>

        {/* Pie del modal con acciones */}
        <div className="flex items-center justify-end gap-3 pt-4 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-neutral-600 hover:bg-neutral-100 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-xs sm:text-sm font-bold px-7 py-2.5 rounded-xl shadow-md shadow-brand-accent/25 transition-all active:scale-95 disabled:opacity-50"
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
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <AgentFormContent key={agent?.id || "new"} agent={agent} onClose={onClose} />
    </div>
  );
}
