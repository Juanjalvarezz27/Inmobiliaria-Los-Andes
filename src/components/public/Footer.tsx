import Link from "next/link";
import { ArrowUpRight, MessageCircle, Phone, Mail, MapPin } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

// Pie de pagina editorial compacto con colores de marca y tipografia monumental
export function Footer() {
  return (
    <footer id="contacto" className="w-full border-t border-neutral-200/90 bg-[#f4f5f2] text-neutral-900 overflow-hidden pt-8 sm:pt-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Cabecera superior compacta: Titular de marca y Boton de Contacto */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 sm:pb-8 border-b border-neutral-300/60">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-accent block mb-1">
              Bienes Raíces
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-extrabold text-brand-primary tracking-tight leading-tight">
              Tu aliado inmobiliario de confianza
            </h2>
          </div>

          <div className="shrink-0">
            <a
              href={`https://wa.me/${COMPANY_CONFIG.contact.phoneRaw}?text=${encodeURIComponent("Hola, deseo asesoría inmobiliaria")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="group inline-flex items-center justify-center gap-2 rounded-full bg-brand-primary px-7 py-3 text-sm sm:text-base font-bold text-white transition-all duration-300 hover:bg-brand-accent active:scale-95 shadow-md shadow-brand-primary/10"
            >
              <span>Contacto</span>
              <ArrowUpRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </a>
          </div>
        </div>

        {/* Columnas intermedias limpias y compactas */}
        <div className="pt-6 sm:pt-8 pb-2">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 lg:gap-8">
            {/* Columna 1: Inmuebles */}
            <div className="space-y-2.5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
                Inmuebles
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 font-medium">
                <li>
                  <Link href="/?tipo=APARTMENT#catalogo" className="hover:text-brand-accent transition-colors">
                    Apartamentos
                  </Link>
                </li>
                <li>
                  <Link href="/?tipo=HOUSE#catalogo" className="hover:text-brand-accent transition-colors">
                    Casas & Residencias
                  </Link>
                </li>
                <li>
                  <Link href="/?tipo=LAND#catalogo" className="hover:text-brand-accent transition-colors">
                    Terrenos & Parcelas
                  </Link>
                </li>
                <li>
                  <Link href="/?tipo=COMMERCIAL#catalogo" className="hover:text-brand-accent transition-colors">
                    Locales Comerciales
                  </Link>
                </li>
                <li>
                  <Link href="/?tipo=OFFICE#catalogo" className="hover:text-brand-accent transition-colors">
                    Galpones & Oficinas
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 2: Explorar */}
            <div className="space-y-2.5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
                Explorar
              </h3>
              <ul className="space-y-2 text-xs sm:text-sm text-neutral-600 font-medium">
                <li>
                  <Link href="/#catalogo" className="hover:text-brand-accent transition-colors">
                    Catálogo Completo
                  </Link>
                </li>
                <li>
                  <Link href="/#asesores" className="hover:text-brand-accent transition-colors">
                    Nuestros Asesores
                  </Link>
                </li>
                <li>
                  <Link href="/#nosotros" className="hover:text-brand-accent transition-colors">
                    Por Qué Elegirnos
                  </Link>
                </li>
              </ul>
            </div>

            {/* Columna 3: Hablemos */}
            <div className="space-y-2.5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
                Hablemos
              </h3>
              <ul className="space-y-2.5 text-xs sm:text-sm font-medium">
                <li>
                  <a
                    href={`https://wa.me/${COMPANY_CONFIG.contact.phoneRaw}?text=${encodeURIComponent("Hola, deseo asesoría")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-emerald-700 transition-colors"
                  >
                    <MessageCircle className="h-4 w-4 text-emerald-600 shrink-0" />
                    <span>WhatsApp directo</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:+${COMPANY_CONFIG.contact.phoneRaw}`}
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-brand-accent transition-colors"
                  >
                    <Phone className="h-4 w-4 text-brand-accent shrink-0" />
                    <span>{COMPANY_CONFIG.contact.phoneFormatted}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={`mailto:${COMPANY_CONFIG.contact.email}`}
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-brand-primary transition-colors"
                  >
                    <Mail className="h-4 w-4 text-neutral-500 shrink-0" />
                    <span className="truncate max-w-[210px] sm:max-w-none">{COMPANY_CONFIG.contact.email}</span>
                  </a>
                </li>
                <li>
                  <a
                    href={COMPANY_CONFIG.social.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-neutral-600 hover:text-pink-600 transition-colors group"
                  >
                    <InstagramIcon className="h-4 w-4 text-pink-600 shrink-0 group-hover:scale-110 transition-transform" />
                    <span>@{COMPANY_CONFIG.social.instagram}</span>
                  </a>
                </li>
              </ul>
            </div>

            {/* Columna 4: Sede y Legal */}
            <div className="space-y-2.5">
              <h3 className="font-heading text-xs font-bold uppercase tracking-[0.16em] text-brand-primary">
                Sede & Legal
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-neutral-600 font-medium leading-relaxed">
                <div className="flex items-start gap-2">
                  <MapPin className="h-4 w-4 text-brand-accent shrink-0 mt-0.5" />
                  <span>Av. Independencia, Centro Chiquinquirá, Trujillo.</span>
                </div>
                <p className="text-xs text-neutral-500 pl-6">
                  RIF: {COMPANY_CONFIG.rifFormatted}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tipografía Monumental Gigante Naranja en la base */}
      <div className="relative overflow-hidden select-none pointer-events-none mt-2 sm:mt-4">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex justify-center sm:justify-start">
          <span className="font-heading text-[17.5vw] font-black leading-[0.74] tracking-[-0.05em] text-brand-accent block translate-y-[8%]">
            los andes
          </span>
        </div>
      </div>
    </footer>
  );
}
