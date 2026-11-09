"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { ShieldCheck, Menu, X } from "lucide-react";
import { COMPANY_CONFIG } from "@/config/company";

// Barra de navegacion flotante (Island / Capsule Navbar) con auto-ocultamiento inteligente
export function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;

      // Cerca del tope siempre visible
      if (currentScrollY < 60) {
        setIsVisible(true);
        setLastScrollY(currentScrollY);
        return;
      }

      // Si el menu movil esta abierto, mantener visible
      if (mobileMenuOpen) {
        setIsVisible(true);
        return;
      }

      // Umbral antiparpadeo para scroll
      if (currentScrollY > lastScrollY && currentScrollY - lastScrollY > 6) {
        setIsVisible(false);
      } else if (currentScrollY < lastScrollY && lastScrollY - currentScrollY > 6) {
        setIsVisible(true);
      }

      setLastScrollY(currentScrollY);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, [lastScrollY, mobileMenuOpen]);

  return (
    <div
      className={`fixed top-0 inset-x-0 z-50 flex flex-col items-center px-3.5 sm:px-6 pt-3.5 sm:pt-5 pointer-events-none transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-[160%]"
      }`}
    >
      {/* Capsula Flotante Principal */}
      <header className="pointer-events-auto w-full max-w-6xl bg-white/95 backdrop-blur-xl text-text-primary rounded-2xl sm:rounded-full border border-neutral-200/90 shadow-[0_12px_36px_-10px_rgba(0,0,0,0.15),0_2px_8px_rgba(0,0,0,0.04)] px-4 sm:px-6 h-16 sm:h-[70px] flex items-center justify-between gap-4 transition-all">
        {/* Identidad con Logotipo Oficial y Marco Naranja */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
          <div className="relative w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden shrink-0 ring-2 ring-brand-accent/40 group-hover:ring-brand-accent shadow-xs group-hover:shadow-md group-hover:shadow-brand-accent/20 transition-all duration-300 bg-white">
            <Image
              src="/Logo redondo.png"
              alt={COMPANY_CONFIG.tradeName}
              fill
              sizes="44px"
              className="object-cover"
              priority
            />
          </div>
          <div className="flex flex-col">
            <span className="text-sm sm:text-base font-black tracking-tight text-brand-primary font-heading leading-tight group-hover:text-neutral-900 transition-colors">
              {COMPANY_CONFIG.tradeName}
            </span>
            <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] font-extrabold tracking-wider uppercase text-neutral-500">
              <span className="w-1.5 h-1.5 rounded-full bg-brand-accent inline-block shrink-0" />
              <span>
                <strong className="text-brand-accent font-black">RIF</strong> {COMPANY_CONFIG.rifFormatted}
              </span>
            </div>
          </div>
        </Link>

        {/* Navegacion Central de Escritorio */}
        <nav className="hidden md:flex items-center gap-7 text-xs font-bold uppercase tracking-wider text-neutral-600">
          <Link
            href="/"
            className="hover:text-brand-accent transition-colors duration-200 py-1"
          >
            Inicio
          </Link>
          <Link
            href="/#catalogo"
            className="hover:text-brand-accent transition-colors duration-200 py-1"
          >
            Catálogo
          </Link>
          <Link
            href="/#asesores"
            className="hover:text-brand-accent transition-colors duration-200 py-1"
          >
            Nuestros Asesores
          </Link>
          <Link
            href="/#nosotros"
            className="hover:text-brand-accent transition-colors duration-200 py-1"
          >
            Nosotros
          </Link>
          <Link
            href="/#contacto"
            className="hover:text-brand-accent transition-colors duration-200 py-1"
          >
            Contacto
          </Link>
        </nav>

        {/* Acceso al Panel Admin y Menu Movil */}
        <div className="flex items-center gap-2">
          <a
            href="/admin/login"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-neutral-800 hover:text-brand-accent bg-orange-50/90 hover:bg-orange-100 border border-orange-200/80 hover:border-brand-accent/50 px-3 sm:px-4 py-2 rounded-full transition-all shadow-2xs active:scale-95 cursor-pointer"
            title="Acceso al panel administrativo"
          >
            <ShieldCheck className="w-4 h-4 text-brand-accent shrink-0" />
            <span className="inline text-[11px] sm:text-xs">Admin</span>
          </a>

          {/* Boton Hamburguesa para Pantallas Moviles */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-neutral-600 hover:text-brand-accent hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-brand-accent" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* Menu Desplegable Movil Flotante */}
      {mobileMenuOpen && (
        <div className="pointer-events-auto w-full max-w-6xl mt-2.5 p-4 bg-white/95 backdrop-blur-xl rounded-2xl border border-neutral-200/90 shadow-2xl space-y-1.5 animate-in slide-in-from-top-2 duration-150">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-brand-accent transition-colors"
          >
            Inicio
          </Link>
          <Link
            href="/#catalogo"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-brand-accent transition-colors"
          >
            Catálogo
          </Link>
          <Link
            href="/#asesores"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-brand-accent transition-colors"
          >
            Nuestros Asesores
          </Link>
          <Link
            href="/#nosotros"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-brand-accent transition-colors"
          >
            Nosotros
          </Link>
          <Link
            href="/#contacto"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3.5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider text-neutral-700 hover:text-brand-accent transition-colors"
          >
            Contacto
          </Link>

          {/* Enlace directo y destacado a Login Administrativo en menu movil */}
          <div className="pt-2 border-t border-neutral-200/80 mt-2">
            <a
              href="/admin/login"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center justify-center gap-2 px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-brand-primary text-white hover:bg-brand-accent transition-colors shadow-sm"
            >
              <ShieldCheck className="w-4 h-4 text-brand-accent" />
              <span>Acceso Administrativo</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
