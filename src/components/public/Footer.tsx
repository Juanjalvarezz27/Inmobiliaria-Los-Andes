import { Building2, MapPin, FileText } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";
import Link from "next/link";

// Pie de pagina con datos legales y fiscales centralizados
export function Footer() {
  return (
    <footer id="contacto" className="bg-brand-primary text-white mt-20 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          {/* Identidad Corporativa */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20">
                <Building2 className="w-5 h-5 text-brand-accent" />
              </div>
              <span className="text-xl font-bold">{COMPANY_CONFIG.tradeName}</span>
            </div>
            <p className="text-sm text-white/80 leading-relaxed">
              Plataforma inmobiliaria líder en Trujillo. Especialistas en corretaje, asesoría legal
              y comercialización de inmuebles residenciales y comerciales.
            </p>
          </div>

          {/* Datos Legales y Fiscales */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
              Información Legal y Fiscal
            </h3>
            <ul className="space-y-3 text-sm text-white/80">
              <li className="flex items-start gap-2.5">
                <FileText className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                <div>
                  <span className="block font-semibold text-white">{COMPANY_CONFIG.legalName}</span>
                  <span className="text-xs text-white/70">RIF: {COMPANY_CONFIG.rifFormatted}</span>
                </div>
              </li>
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-brand-accent mt-0.5 shrink-0" />
                <span className="text-xs leading-normal">
                  {COMPANY_CONFIG.address.fullAddress}
                </span>
              </li>
            </ul>
          </div>

          {/* Contacto Directo */}
          <div className="space-y-4">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-brand-accent">
              Atención Inmobiliaria
            </h3>
            <p className="text-sm text-white/80">
              ¿Deseas vender o alquilar tu propiedad? Nuestros asesores certificados están a tu disposición.
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <Link
                href="/admin"
                className="text-xs text-white/70 hover:text-white underline transition-colors"
              >
                Acceso exclusivo para Asesores y Administradores
              </Link>
            </div>
          </div>
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-white/60 gap-4">
          <p>© {new Date().getFullYear()} {COMPANY_CONFIG.legalName}. Todos los derechos reservados.</p>
          <p>Trujillo, Estado Trujillo, Venezuela.</p>
        </div>
      </div>
    </footer>
  );
}
