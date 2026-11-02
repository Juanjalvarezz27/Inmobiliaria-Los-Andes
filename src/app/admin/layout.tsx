import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/admin/actions";
import Link from "next/link";
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  ExternalLink,
  LogOut,
  Shield,
} from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";

export const dynamic = "force-dynamic";

// Layout principal para el panel administrativo privado
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();

  // Si no hay usuario autenticado (ej. en la ruta de login), renderiza solo el contenido
  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-neutral-100 flex flex-col md:flex-row">
      {/* Barra lateral / Sidebar */}
      <aside className="w-full md:w-64 bg-brand-primary text-white flex flex-col shrink-0">
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center border border-white/20">
            <Building2 className="w-5 h-5 text-brand-accent" />
          </div>
          <div>
            <span className="font-bold text-sm block leading-tight">Panel de Control</span>
            <span className="text-[10px] text-white/70 uppercase tracking-widest block">
              {COMPANY_CONFIG.tradeName}
            </span>
          </div>
        </div>

        {/* Navegacion interna */}
        <nav className="p-4 flex-1 space-y-1.5 text-sm font-medium">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <LayoutDashboard className="w-4 h-4 text-brand-accent" />
            <span>Resumen</span>
          </Link>

          <Link
            href="/admin/propiedades"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Home className="w-4 h-4 text-brand-accent" />
            <span>Propiedades (CRUD)</span>
          </Link>

          <Link
            href="/admin/asesores"
            className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Users className="w-4 h-4 text-brand-accent" />
            <span>Asesores Inmobiliarios</span>
          </Link>

          <div className="pt-4 mt-4 border-t border-white/10">
            <Link
              href="/"
              target="_blank"
              className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-white/60 hover:text-white hover:bg-white/5 transition-colors text-xs"
            >
              <ExternalLink className="w-4 h-4" />
              <span>Ver Catálogo Público</span>
            </Link>
          </div>
        </nav>

        {/* Perfil del usuario y Cierre de sesion */}
        <div className="p-4 border-t border-white/10 bg-black/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-brand-accent/20 border border-brand-accent/40 flex items-center justify-center text-brand-accent shrink-0">
              <Shield className="w-4 h-4" />
            </div>
            <div className="truncate">
              <span className="text-xs font-bold block text-white truncate">{user.name}</span>
              <span className="text-[10px] text-white/60 block truncate">{user.email}</span>
            </div>
          </div>

          <form action={logoutAction}>
            <button
              type="submit"
              title="Cerrar Sesión"
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </aside>

      {/* Contenedor principal de vistas */}
      <main className="flex-1 p-6 sm:p-10 overflow-y-auto">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>
    </div>
  );
}
