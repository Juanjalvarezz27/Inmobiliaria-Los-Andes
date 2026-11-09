"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  Users,
  ExternalLink,
  LogOut,
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Building,
  Zap,
  Menu,
  X,
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

// Barra lateral ejecutiva con soporte responsivo total (desktop persistente + drawer movil/tablet)
export function AdminSidebar({ user }: AdminSidebarProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const pathname = usePathname();

  // Cerrar drawer movil automaticamente en cada navegacion
  useEffect(() => {
    setIsMobileOpen(false);
  }, [pathname]);

  // Cierre accesible con tecla Escape y bloqueo de scroll en movil
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isMobileOpen) {
        setIsMobileOpen(false);
      }
    };
    if (isMobileOpen) {
      document.body.style.overflow = "hidden";
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => {
      document.body.style.overflow = "unset";
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isMobileOpen]);

  const navItems = [
    {
      label: "Resumen",
      href: "/admin",
      icon: LayoutDashboard,
      active: pathname === "/admin",
    },
    {
      label: "Propiedades",
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
    <>
      {/* 1. BARRA SUPERIOR PARA MOVILES Y TABLETS (< lg) CON ALTURA EJECUTIVA ROBUSTA */}
      <header className="lg:hidden sticky top-0 z-40 bg-gradient-to-r from-brand-header-from via-brand-header-via to-brand-header-to text-white border-b border-white/10 px-4 sm:px-6 min-h-[78px] py-4 flex items-center justify-between shadow-[0_4px_20px_rgba(0,0,0,0.12)] select-none">
        {/* Identidad con Logo y Marca */}
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="relative w-12 h-12 rounded-2xl overflow-hidden shrink-0 ring-2 ring-white/40 shadow-md bg-white/10 flex items-center justify-center">
            <Image
              src="/Logo redondo.png"
              alt={COMPANY_CONFIG.tradeName}
              fill
              sizes="48px"
              className="object-cover"
              priority
            />
          </div>
          <div className="min-w-0">
            <span className="font-black text-[15px] sm:text-base block leading-tight text-white truncate font-heading tracking-tight">
              Panel de Control
            </span>
            <span className="text-[10px] text-orange-200 font-extrabold tracking-widest uppercase block truncate mt-0.5">
              {COMPANY_CONFIG.tradeName}
            </span>
          </div>
        </div>

        {/* Acciones rapidas: nuevo inmueble y hamburguesa con mayor area de toque */}
        <div className="flex items-center gap-2.5">
          <Link
            href="/admin/propiedades?nuevo=true"
            title="Cargar Inmueble"
            className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2.5 rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 text-xs font-bold shadow-md transition-transform active:scale-95"
          >
            <PlusCircle strokeWidth={2.5} className="w-4 h-4" />
            <span className="font-extrabold">Nuevo</span>
          </Link>

          <button
            type="button"
            onClick={() => setIsMobileOpen(!isMobileOpen)}
            className="w-11 h-11 rounded-xl bg-white/15 hover:bg-white/25 active:bg-white/30 text-white flex items-center justify-center transition-colors cursor-pointer"
            aria-label={isMobileOpen ? "Cerrar menú" : "Abrir menú de navegación"}
          >
            {isMobileOpen ? <X className="w-6 h-6 text-white" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* 2. DRAWER OFF-CANVAS PARA MOVILES Y TABLETS (< lg) */}
      {isMobileOpen && (
        <div
          role="presentation"
          onClick={() => setIsMobileOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 lg:hidden animate-in fade-in duration-200"
        />
      )}

      <div
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] bg-gradient-to-b from-brand-header-from via-brand-header-via to-brand-header-to text-white flex flex-col shadow-2xl transition-transform duration-300 ease-out lg:hidden select-none ${
          isMobileOpen
            ? "translate-x-0 pointer-events-auto visible"
            : "-translate-x-full pointer-events-none invisible"
        }`}
      >
        {/* Cabecera del Drawer con Boton de Cierre */}
        <div className="h-20 shrink-0 border-b border-white/[0.08] flex items-center justify-between px-4 bg-black/10">
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative w-10 h-10 rounded-full overflow-hidden shrink-0 ring-2 ring-brand-accent/40 shadow-sm bg-white/10 flex items-center justify-center">
              <Image
                src="/Logo redondo.png"
                alt={COMPANY_CONFIG.tradeName}
                fill
                sizes="40px"
                className="object-cover"
              />
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm block leading-tight text-white truncate font-heading">
                Panel de Control
              </span>
              <span className="text-[10px] text-brand-accent font-extrabold tracking-widest uppercase block truncate mt-0.5">
                {COMPANY_CONFIG.tradeName}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileOpen(false)}
            className="p-1.5 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Cerrar panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navegacion del Drawer Movil */}
        <nav className="p-4 flex-1 min-h-0 space-y-6 overflow-y-auto text-sm">
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-3 block mb-2">
              Gestión Comercial
            </span>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  onClick={() => setIsMobileOpen(false)}
                  className={`relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all ${
                    item.active
                      ? "bg-gradient-to-r from-brand-accent to-[#c94b21] text-white font-bold shadow-lg shadow-brand-accent/30"
                      : "text-white/80 hover:text-white hover:bg-white/[0.12]"
                  }`}
                >
                  <Icon strokeWidth={2.5} className="w-5 h-5 shrink-0 text-white" />
                  <span className="truncate">{item.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
            <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-3 block mb-2">
              Canales Externos
            </span>
            <Link
              href="/"
              target="_blank"
              onClick={() => setIsMobileOpen(false)}
              className="relative flex items-center gap-3.5 px-3.5 py-3 rounded-2xl transition-all text-white/80 hover:text-white hover:bg-white/[0.12]"
            >
              <ExternalLink strokeWidth={2.5} className="w-5 h-5 shrink-0 text-white" />
              <div className="flex items-center justify-between flex-1 min-w-0">
                <span className="truncate">Ver Catálogo Público</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs" title="En línea" />
              </div>
            </Link>
          </div>

          {/* Widget de Carga Rapida en Drawer */}
          <div className="pt-2">
            <div className="p-4 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 shadow-lg relative overflow-hidden">
              <Building className="absolute -right-3 -bottom-3 w-16 h-16 text-white/[0.04] pointer-events-none" />
              <div className="flex items-center gap-1.5 mb-2">
                <Zap className="w-3.5 h-3.5 text-brand-accent fill-brand-accent/20" strokeWidth={2.5} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                  Acceso Rápido
                </span>
              </div>
              <p className="text-xs font-bold text-white leading-snug">Publicar Nuevo Inmueble</p>
              <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
                Sube fotos, asigna precio y vincula a un asesor.
              </p>
              <Link
                href="/admin/propiedades?nuevo=true"
                onClick={() => setIsMobileOpen(false)}
                className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-brand-accent hover:bg-[#c94b21] text-white text-xs font-bold shadow-md shadow-brand-accent/30 transition-all active:scale-95"
              >
                <PlusCircle strokeWidth={2.5} className="w-3.5 h-3.5" />
                <span>Cargar Inmueble</span>
              </Link>
            </div>
          </div>
        </nav>

        {/* Perfil del Administrador en Drawer */}
        <div className="p-4 shrink-0 border-t border-white/[0.08] bg-black/35 mt-auto">
          <div className="flex items-center justify-between gap-2.5">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center shadow-sm"
                  title={`${user.name} (${user.email})`}
                >
                  <Image src="/Logo redondo.png" alt={user.name} fill sizes="36px" className="object-cover" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#132c1c] absolute -bottom-0.5 -right-0.5 shadow-xs" />
              </div>
              <div className="min-w-0 truncate">
                <span className="text-xs font-bold block text-white truncate font-heading">
                  {user.name === "Administrador General" ? "Administrador" : user.name}
                </span>
                <span className="text-[10px] text-white/50 block truncate font-medium">{user.email}</span>
              </div>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                title="Cerrar Sesión"
                className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut strokeWidth={2.2} className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* 3. SIDEBAR PERSISTENTE PARA ESCRITORIO (>= lg) */}
      <aside
        className={`hidden lg:flex sticky top-0 h-screen bg-gradient-to-b from-brand-header-from via-brand-header-via to-brand-header-to text-white flex-col shrink-0 border-r border-white/[0.08] shadow-2xl transition-[width] duration-300 ease-in-out z-30 select-none ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Boton flotante para abrir y cerrar el sidebar */}
        <button
          type="button"
          onClick={() => setIsCollapsed(!isCollapsed)}
          title={isCollapsed ? "Expandir menú" : "Colapsar menú"}
          className="absolute -right-3.5 top-7 z-40 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white border-2 border-brand-header-from flex items-center justify-center shadow-xl transition-transform hover:scale-110 active:scale-95 cursor-pointer"
        >
          {isCollapsed ? (
            <ChevronRight strokeWidth={2.5} className="w-3.5 h-3.5" />
          ) : (
            <ChevronLeft strokeWidth={2.5} className="w-3.5 h-3.5" />
          )}
        </button>

        {/* Cabecera con Logotipo y Marca */}
        <div className="h-22 shrink-0 border-b border-white/[0.08] flex items-center px-4 overflow-hidden bg-black/10">
          <div className={`flex items-center gap-3.5 w-full ${isCollapsed ? "justify-center" : ""}`}>
            <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-brand-accent/40 shadow-lg shadow-black/30 bg-white/10 flex items-center justify-center">
              <Image
                src="/Logo redondo.png"
                alt={COMPANY_CONFIG.tradeName}
                fill
                sizes="44px"
                className="object-cover"
                priority
              />
            </div>

            {!isCollapsed && (
              <div className="min-w-0 transition-opacity duration-200">
                <span className="font-bold text-sm block leading-tight text-white truncate font-heading tracking-tight">
                  Panel de Control
                </span>
                <span className="text-[10px] text-brand-accent font-extrabold tracking-widest uppercase block truncate mt-0.5">
                  {COMPANY_CONFIG.tradeName}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Navegacion y Secciones */}
        <nav className="p-3.5 flex-1 min-h-0 space-y-6 overflow-y-auto overflow-x-hidden text-sm">
          {/* Seccion de Gestion */}
          <div className="space-y-1.5">
            {!isCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-3 block mb-2">
                Gestión Comercial
              </span>
            )}

            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  prefetch={true}
                  title={isCollapsed ? item.label : undefined}
                  className={`relative flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 ease-out group hover:scale-[1.03] hover:translate-x-1.5 active:scale-[0.98] ${
                    item.active
                      ? "bg-gradient-to-r from-brand-accent to-[#c94b21] text-white font-bold shadow-lg shadow-brand-accent/30"
                      : "text-white/80 hover:text-white hover:bg-white/[0.12] hover:shadow-md hover:shadow-black/20"
                  } ${isCollapsed ? "justify-center px-0 hover:translate-x-0 hover:scale-110" : ""}`}
                >
                  {/* Indicador de activo a la izquierda */}
                  {item.active && !isCollapsed && (
                    <span className="absolute left-1 top-1/2 -translate-y-1/2 w-1 h-5 bg-white rounded-full shadow-sm" />
                  )}

                  <Icon
                    strokeWidth={2.5}
                    className={`w-5 h-5 shrink-0 transition-transform duration-200 text-white ${
                      item.active ? "scale-105" : "opacity-90 group-hover:opacity-100 group-hover:scale-110"
                    }`}
                  />

                  {!isCollapsed && <span className="truncate">{item.label}</span>}
                </Link>
              );
            })}
          </div>

          {/* Seccion de Enlaces Externos */}
          <div className="space-y-1.5 pt-2 border-t border-white/[0.08]">
            {!isCollapsed && (
              <span className="text-[11px] font-bold uppercase tracking-wider text-white/60 px-3 block mb-2">
                Canales Externos
              </span>
            )}

            <Link
              href="/"
              target="_blank"
              title={isCollapsed ? "Ver Catálogo Público" : undefined}
              className={`relative flex items-center gap-3.5 px-3 py-3 rounded-2xl transition-all duration-200 ease-out group hover:scale-[1.03] hover:translate-x-1.5 active:scale-[0.98] text-white/80 hover:text-white hover:bg-white/[0.12] hover:shadow-md hover:shadow-black/20 ${
                isCollapsed ? "justify-center px-0 hover:translate-x-0 hover:scale-110" : ""
              }`}
            >
              <ExternalLink
                strokeWidth={2.5}
                className="w-5 h-5 shrink-0 transition-transform duration-200 text-white opacity-90 group-hover:opacity-100 group-hover:scale-110"
              />
              {!isCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="truncate">Ver Catálogo Público</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-xs" title="En línea" />
                </div>
              )}
            </Link>
          </div>

          {/* Tarjeta Widget de Accion Rapida */}
          {!isCollapsed && (
            <div className="pt-2">
              <div className="p-4 rounded-3xl bg-gradient-to-br from-white/[0.08] to-white/[0.02] border border-white/10 shadow-lg relative overflow-hidden group">
                <Building className="absolute -right-3 -bottom-3 w-16 h-16 text-white/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />
                <div className="flex items-center gap-1.5 mb-2">
                  <Zap className="w-3.5 h-3.5 text-brand-accent fill-brand-accent/20" strokeWidth={2.5} />
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-accent">
                    Acceso Rápido
                  </span>
                </div>
                <p className="text-xs font-bold text-white leading-snug">Publicar Nuevo Inmueble</p>
                <p className="text-[11px] text-white/60 mb-3 leading-relaxed">
                  Sube fotos, asigna precio y vincula a un asesor.
                </p>
                <Link
                  href="/admin/propiedades?nuevo=true"
                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-brand-accent hover:bg-[#c94b21] hover:scale-[1.02] text-white text-xs font-bold shadow-md shadow-brand-accent/30 transition-all active:scale-95"
                >
                  <PlusCircle strokeWidth={2.5} className="w-3.5 h-3.5" />
                  <span>Cargar Inmueble</span>
                </Link>
              </div>
            </div>
          )}

          {/* Acceso rapido condensado cuando el menu esta colapsado */}
          {isCollapsed && (
            <div className="pt-2 flex justify-center">
              <Link
                href="/admin/propiedades?nuevo=true"
                title="Cargar Nuevo Inmueble"
                className="w-10 h-10 rounded-2xl bg-brand-accent hover:bg-[#c94b21] text-white flex items-center justify-center shadow-md shadow-brand-accent/30 transition-transform hover:scale-110 active:scale-95"
              >
                <PlusCircle strokeWidth={2.5} className="w-5 h-5" />
              </Link>
            </div>
          )}
        </nav>

        {/* Perfil del Administrador y Footer Legal */}
        <div className="p-3.5 shrink-0 border-t border-white/[0.08] bg-black/35 mt-auto">
          <div className={`flex items-center gap-2.5 ${isCollapsed ? "flex-col justify-center" : "justify-between"}`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="relative shrink-0">
                <div
                  className="relative w-9 h-9 rounded-full overflow-hidden border border-white/20 bg-white/10 flex items-center justify-center shadow-sm"
                  title={`${user.name} (${user.email})`}
                >
                  <Image src="/Logo redondo.png" alt={user.name} fill sizes="36px" className="object-cover" />
                </div>
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 border-2 border-[#132c1c] absolute -bottom-0.5 -right-0.5 shadow-xs" />
              </div>

              {!isCollapsed && (
                <div className="min-w-0 truncate">
                  <span className="text-xs font-bold block text-white truncate font-heading">
                    {user.name === "Administrador General" ? "Administrador" : user.name}
                  </span>
                  <span className="text-[10px] text-white/50 block truncate font-medium">{user.email}</span>
                </div>
              )}
            </div>

            <form action={logoutAction} className={isCollapsed ? "pt-1" : ""}>
              <button
                type="submit"
                title="Cerrar Sesión"
                className="p-2 text-white/60 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors cursor-pointer"
              >
                <LogOut strokeWidth={2.2} className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </aside>
    </>
  );
}
