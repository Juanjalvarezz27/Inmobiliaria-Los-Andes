import Link from "next/link";
import { Building2, ShieldCheck } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";

// Barra de navegacion superior publica con identidad corporativa
export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full bg-brand-primary text-white shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-11 h-11 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 group-hover:bg-white/20 transition-colors">
            <Building2 className="w-6 h-6 text-brand-accent" />
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight block leading-tight">
              {COMPANY_CONFIG.tradeName}
            </span>
            <span className="text-xs text-white/70 tracking-wider uppercase block">
              Bienes Raíces • Trujillo
            </span>
          </div>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm font-medium">
          <Link href="/" className="text-white hover:text-white/80 transition-colors">
            Inicio
          </Link>
          <Link href="/#catalogo" className="text-white/80 hover:text-white transition-colors">
            Catálogo de Inmuebles
          </Link>
          <Link href="/#contacto" className="text-white/80 hover:text-white transition-colors">
            Contacto
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          <Link
            href="/admin"
            className="flex items-center gap-2 text-xs sm:text-sm font-semibold bg-white/10 hover:bg-white/20 border border-white/20 px-4 py-2.5 rounded-lg transition-colors"
          >
            <ShieldCheck className="w-4 h-4 text-brand-accent" />
            <span>Panel Admin</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

