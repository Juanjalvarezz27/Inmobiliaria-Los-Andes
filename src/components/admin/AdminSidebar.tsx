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

// Barra lateral colapsable con paleta naranja corporativa y detalles verdes
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
      className={`relative bg-brand-accent text-white flex flex-col shrink-0 shadow-xl transition-all duration-300 ease-in-out ${
        isCollapsed ? "w-20" : "w-64"
      }`}
    >
      {/* Cabecera con Logotipo y Boton de Colapso */}
      <div className="p-4 h-20 border-b border-white/20 flex items-center justify-between gap-3 overflow-hidden">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl bg-brand-primary flex items-center justify-center shrink-0 border border-white/20 shadow-md">
            <Building2 className="w-5 h-5 text-white" />
          </div>

          <div
            className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
              isCollapsed ? "opacity-0 w-0 pointer-events-none" : "opacity-100 w-auto"
            }`}
          >
            <span className="font-black text-sm block leading-tight text-white">Panel de Control</span>
            <span className="text-[10px] text-white/80 uppercase tracking-widest block font-semibold truncate">
              {COMPANY_CONFIG.tradeName}
            </span>
          </div>
        </div>

        {/* Boton Toggle para abrir y cerrar el sidebar */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir panel lateral" : "Colapsar panel lateral"}
          className="w-8 h-8 rounded-lg bg-brand-primary hover:bg-[#12281a] text-white flex items-center justify-center shrink-0 transition-colors shadow-sm"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navegacion interna */}
      <nav className="p-3 flex-1 space-y-2 text-sm font-medium">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              title={isCollapsed ? item.label : undefined}
              className={`flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 group ${
                item.active
                  ? "bg-brand-primary text-white font-bold shadow-md shadow-black/10"
                  : "text-white/85 hover:text-white hover:bg-white/15"
              } ${isCollapsed ? "justify-center px-0" : ""}`}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 ${
                  item.active ? "text-white" : "text-white/90 group-hover:scale-110"
                }`}
              />
              <span
                className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                  isCollapsed ? "opacity-0 w-0 pointer-events-none hidden" : "opacity-100 w-auto"
                }`}
              >
                {item.label}
              </span>
            </Link>
          );
        })}

        {/* Separador hacia el sitio publico */}
        <div className="pt-3 mt-3 border-t border-white/20">
          <Link
            href="/"
            target="_blank"
            title={isCollapsed ? "Ver Catálogo Público" : undefined}
            className={`flex items-center gap-3.5 px-3 py-2.5 rounded-2xl text-white/80 hover:text-white hover:bg-white/15 transition-all text-xs ${
              isCollapsed ? "justify-center px-0" : ""
            }`}
          >
            <ExternalLink className="w-4 h-4 shrink-0" />
            <span
              className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isCollapsed ? "opacity-0 w-0 pointer-events-none hidden" : "opacity-100 w-auto font-medium"
              }`}
            >
              Ver Catálogo Público
            </span>
          </Link>
        </div>
      </nav>

      {/* Perfil del usuario y Boton de cierre de sesion */}
      <div className="p-3 border-t border-white/20 bg-black/15">
        <div className={`flex items-center gap-2.5 ${isCollapsed ? "flex-col justify-center" : "justify-between"}`}>
          <div className="flex items-center gap-2.5 min-w-0">
            <div
              className="w-9 h-9 rounded-full bg-brand-primary border border-white/30 flex items-center justify-center text-white shrink-0 shadow-sm"
              title={`${user.name} (${user.email})`}
            >
              <Shield className="w-4 h-4" />
            </div>

            <div
              className={`transition-all duration-300 overflow-hidden whitespace-nowrap ${
                isCollapsed ? "opacity-0 w-0 pointer-events-none hidden" : "opacity-100 w-auto min-w-0"
              }`}
            >
              <span className="text-xs font-bold block text-white truncate">{user.name}</span>
              <span className="text-[10px] text-white/80 block truncate font-medium">{user.email}</span>
            </div>
          </div>

          <form action={logoutAction} className={isCollapsed ? "w-full flex justify-center pt-2" : ""}>
            <button
              type="submit"
              title="Cerrar Sesión"
              className="p-2 text-white/80 hover:text-white hover:bg-brand-primary rounded-xl transition-colors shadow-sm"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </aside>
  );
}
