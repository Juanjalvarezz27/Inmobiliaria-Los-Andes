import { Building2, MapPin, FileText, Phone, MessageCircle, ShieldCheck } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";
import Link from "next/link";

// Pie de pagina corporativo con datos legales, fiscales y enlaces rapidos
export function Footer() {
  return (
    <footer id="contacto" className="bg-[#0a1c10] text-white border-t border-emerald-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Columna 1: Identidad y Mision */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-brand-accent to-[#c4441b] flex items-center justify-center shadow-md">
                <Building2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-xl font-black block font-heading">{COMPANY_CONFIG.tradeName}</span>
                <span className="text-[11px] text-emerald-300 font-bold uppercase tracking-wider block">
                  Bienes Raíces • Trujillo
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-emerald-100/70 leading-relaxed max-w-md">
              Firma inmobiliaria líder en el estado Trujillo. Especialistas en corretaje, asesoría jurídica notarial, avalúos y comercialización efectiva de inmuebles residenciales y comerciales.
            </p>

            <div className="pt-2 flex items-center gap-3">
              <a
                href="https://wa.me/584140000000?text=Hola,%20deseo%20asesor%C3%ADa"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/30 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Atención WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Columna 2: Datos Fiscales y Domicilio */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-accent">
              Razón Social & Domicilio
            </h3>
            <ul className="space-y-3 text-xs text-emerald-100/80">
              <li className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                <div>
                  <span className="block font-bold text-white">{COMPANY_CONFIG.legalName}</span>
                  <span className="text-[11px] text-emerald-300/80">RIF: {COMPANY_CONFIG.rifFormatted}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                <span className="text-[11px] leading-relaxed">
                  {COMPANY_CONFIG.address.fullAddress}
                </span>
              </li>
            </ul>
          </div>

          {/* Columna 3: Enlaces de Acceso y Administracion */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-brand-accent">
              Enlaces y Gestión
            </h3>
            <ul className="space-y-2 text-xs text-emerald-100/80">
              <li>
                <Link href="/#catalogo" className="hover:text-white transition-colors">
                  Catálogo de Inmuebles
                </Link>
              </li>
              <li>
                <Link href="/#asesores" className="hover:text-white transition-colors">
                  Nuestros Asesores
                </Link>
              </li>
              <li>
                <Link href="/#nosotros" className="hover:text-white transition-colors">
                  Sobre Nosotros
                </Link>
              </li>
              <li className="pt-2">
                <Link
                  href="/admin"
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-white bg-white/10 hover:bg-white/20 border border-white/20 px-3 py-1.5 rounded-xl transition-all"
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-brand-accent" />
                  <span>Acceso para Asesores</span>
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Barra Inferior de Derechos */}
        <div className="mt-12 pt-8 border-t border-emerald-500/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-emerald-100/60 gap-4">
          <p>© {new Date().getFullYear()} {COMPANY_CONFIG.legalName}. Todos los derechos reservados.</p>
          <p>Trujillo, Estado Trujillo, República Bolivariana de Venezuela.</p>
        </div>
      </div>
    </footer>
  );
}
