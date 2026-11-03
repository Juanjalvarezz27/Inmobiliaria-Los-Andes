import { MessageCircle, Phone, Award, ShieldCheck } from "lucide-react";
import Image from "next/image";

export interface FeaturedAgentData {
  id: string;
  name: string;
  phone?: string | null;
  avatarUrl?: string | null;
  position?: string | null;
  propertiesCount: number;
}

// Generador de iniciales en texto para avatar fallback
function getInitials(name: string): string {
  if (!name) return "AS";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
}

interface FeaturedAgentsSectionProps {
  agents: FeaturedAgentData[];
}

// Seccion publica que humaniza la marca destacando a los asesores comerciales certificados
export function FeaturedAgentsSection({ agents }: FeaturedAgentsSectionProps) {
  if (agents.length === 0) return null;

  return (
    <section id="asesores" className="py-16 bg-white border-y border-neutral-200/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
        {/* Encabezado de Seccion */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="space-y-1.5">
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" />
              <span>Equipo Certificado</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary font-heading tracking-tight">
              Conoce a Nuestros Asesores Inmobiliarios
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary max-w-xl">
              Profesionales capacitados para guiarte en cada paso legal, financiero y operativo de tu inversión.
            </p>
          </div>
        </div>

        {/* Grilla de Asesores */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {agents.map((agent) => {
            const cleanPhone = (agent.phone || "").replace(/\D/g, "");
            const waUrl = `https://wa.me/${cleanPhone || "584140000000"}?text=${encodeURIComponent(
              `Hola ${agent.name}, deseo recibir asesoría inmobiliaria personalizada en Trujillo.`
            )}`;

            return (
              <div
                key={agent.id}
                className="bg-neutral-50/70 hover:bg-white rounded-3xl p-5 border border-neutral-200/90 shadow-2xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col items-center text-center space-y-4 group"
              >
                {/* Avatar con Marco Premium */}
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shadow-md border-2 border-white ring-2 ring-emerald-500/20 group-hover:ring-brand-accent/40 transition-all bg-neutral-200 shrink-0">
                  {agent.avatarUrl ? (
                    <Image
                      src={agent.avatarUrl}
                      alt={agent.name}
                      fill
                      sizes="96px"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-brand-primary text-white font-black text-2xl flex items-center justify-center">
                      {getInitials(agent.name)}
                    </div>
                  )}
                </div>

                {/* Informacion */}
                <div className="space-y-1 w-full min-w-0">
                  <h3 className="font-extrabold text-base text-brand-primary font-heading truncate">
                    {agent.name}
                  </h3>
                  <span className="inline-block bg-emerald-50 text-emerald-800 text-[11px] font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {agent.propertiesCount} {agent.propertiesCount === 1 ? "inmueble asignado" : "inmuebles asignados"}
                  </span>
                </div>

                {/* Accion Directa de WhatsApp */}
                <div className="w-full pt-2 border-t border-neutral-200/80">
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white text-xs font-bold py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-95 cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 fill-white text-emerald-700" />
                    <span>Contactar por WhatsApp</span>
                  </a>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

