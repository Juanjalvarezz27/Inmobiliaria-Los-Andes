import Link from "next/link";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";
import { Home, ArrowLeft, MessageCircle, Building2 } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";

// Página personalizada 404 para inmuebles no encontrados o enlaces caducados
export default function NotFound() {
  const whatsappUrl = `https://wa.me/${COMPANY_CONFIG.contact.phoneRaw}?text=${encodeURIComponent(
    "Hola, estaba navegando en su sitio web y no encontré una propiedad. ¿Podrían orientarme con las opciones disponibles?"
  )}`;

  return (
    <div className="min-h-screen flex flex-col bg-ui-background">
      <Navbar />

      <main className="flex-1 flex items-center justify-center px-4 py-20 sm:py-28 relative overflow-hidden">
        {/* Fondo sutil con relieve topográfico */}
        <div className="absolute inset-0 bg-[radial-gradient(#1a3b26_1px,transparent_1px)] [background-size:24px_24px] opacity-[0.03] pointer-events-none" />
        <div className="absolute -top-32 -right-32 w-96 h-96 bg-brand-accent/5 rounded-full pointer-events-none" />
        <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-brand-primary/5 rounded-full pointer-events-none" />

        <div className="relative z-10 max-w-lg w-full text-center space-y-6 bg-white p-8 sm:p-10 rounded-3xl border border-neutral-200/80 shadow-xl shadow-brand-primary/5">
          <div className="w-16 h-16 rounded-2xl bg-orange-100 text-brand-accent flex items-center justify-center mx-auto shadow-md shadow-brand-accent/20">
            <Building2 className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-widest text-brand-accent">
              Error 404 • No disponible
            </span>
            <h1 className="text-2xl sm:text-3xl font-heading font-black text-brand-primary tracking-tight">
              Inmueble o página no encontrada
            </h1>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              Es posible que este inmueble ya haya sido vendido, reservado o que el enlace haya cambiado. Explora nuestro catálogo actualizado con las mejores opciones en Trujillo.
            </p>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
            <Link
              href="/"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-brand-accent hover:bg-[#c94b21] text-white text-xs sm:text-sm font-bold shadow-md shadow-brand-accent/25 transition-all active:scale-95"
            >
              <Home className="w-4 h-4" />
              <span>Ver Catálogo de Inmuebles</span>
            </Link>

            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 text-xs sm:text-sm font-bold transition-all active:scale-95 shadow-2xs"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600" />
              <span>Consultar por WhatsApp</span>
            </a>
          </div>
        </div>
      </main>

      <Footer />
      <FloatingWhatsApp />
    </div>
  );
}

