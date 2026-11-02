"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Building2,
  LayoutDashboard,
  Home,
  Users,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Shield,
} from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";
import { logoutAction } from "@/app/admin/actions";

interface AdminSidebarProps {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

// Barra lateral colapsable verde oscuro con detalles naranja y tipografia blanca
export function AdminSidebar({ user }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const pathname = usePathname();

  const navItems = [
    {
      label: "Resumen",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Propiedades (CRUD)",
      href: "/admin/propiedades",
      icon: Home,
      active: pathname.startsWith("/admin/propiedades"),
    },
    {
      label: "Asesores Inmobiliarios",
      href: "/admin/asesores",
      icon: Users,
      active: pathname.startsWith("/admin/asesores"),
    },
  ];

  return (
    <aside
      className={`relative bg-brand-primary text-white flex flex-col shrink-0 shadow-2xl transition-[width] duration-300 ease-in-out z-20 ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Boton flotante para abrir y cerrar el sidebar sin comprimir el contenido */}
      <button
        type="button"
        onClick={() => setIsCollapsed(!isCollapsed)}
        title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
        className="absolute -right-3.5 top-6.5 z-30 w-7 h-7 rounded-full bg-brand-accent hover:bg-[#c94b21] text-white border-2 border-brand-primary flex items-center justify-center shadow-lg transition-transform hover:scale-110 active:scale-95"
      >
        {isCollapsed ? <ChevronRight className="w-3.5 h-3.5" /> : <ChevronLeft className="w-3.5 h-3.5" />}
      </button>

      {/* Cabecera con Logotipo */}
      <div className="h-20 border-b border-white/10 flex items-center px-4 overflow-hidden">
        <div className={`flex items-center gap-3 w-full ${isCollapsed ? "justify-center" : ""}`}>
          <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0 border border-white/20 shadow-sm">
            <Building2 className="w-5 h-5 text-brand-accent" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 transition-opacity duration-200">
              <span className="font-black text-sm block leading-tight text-white truncate">
                Panel de Control
              </span>
              <span className="text-[10px] text-white/70 uppercase tracking-widest block font-semibold truncate">
                {COMPANY_CONFIG.tradeName}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navegacion interna */}
      <nav className="p-3 flex-1 space-y-1.5 text-sm font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 group ${
                item.active
                  ? "bg-brand-accent text-white font-bold shadow-md shadow-brand-accent/20"
                  : "text-white/80 hover:text-white hover:bg-white/10"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                  item.active ? "text-white" : "text-brand-accent group-hover:scale-110"
                }`}
              />
              {!isCollapsed && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}

        {/* Separador hacia el sitio publico */}
        <div className="pt-3 mt-3 border-t border-white/10">
          <Link
            href="/"
            target="_blank"
            title={isCollapsed ? "Ver Catálogo Público" : undefined}
            className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-white/70 hover:text-white hover:bg-white/10 transition-all text-xs ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <ExternalLink className="w-4 h-4 shrink-0 text-white/60" />
            {!isCollapsed && <span className="truncate font-medium">Ver Catálogo Público</span>}
          </Link>
        </div>
      </nav>

      {/* Perfil del usuario y Cierre de sesion */}
      <div className="p-3 border-t border-white/10 bg-black/15">
        <div className={`flex items-center gap-2.5 ${isCollapsed ? "flex-col justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-full bg-white/10 border border-brand-accent/30 flex items-center justify-center text-brand-accent shrink-0 shadow-sm"
              title={`${user.name} (${user.email})`}
            >
              <Shield className="w-4 h-4" />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 truncate">
                <span className="text-xs font-bold block text-white truncate">{user.name}</span>
                <span className="text-[10px] text-white/60 block truncate font-medium">{user.email}</span>
              </div>
            )}
          </div>

          <form action={logoutAction} className={isCollapsed ? "pt-1" : ""}>
            <button
              type="submit"
              title="Cerrar Sesión"
              className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
