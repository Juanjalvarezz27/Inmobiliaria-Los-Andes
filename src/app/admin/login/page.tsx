"use client";

import { useActionState } from "react";
import { loginAction } from "@/app/admin/actions";
import { Building2, Lock, Mail, ArrowRight, ShieldCheck } from "lucide-react";
import Link from "next/link";
import { COMPANY_CONFIG } from "@/config/company";
import { AdminAtmosphereBackground } from "@/components/admin/AdminAtmosphereBackground";

// Pantalla de inicio de sesion privada para administradores y asesores
export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState(loginAction, null);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#FAF7F2] via-[#F3ECE0] to-[#EBE0D2] flex flex-col justify-center items-center px-4 py-12 relative isolate">
      {/* Fondo atmosferico beige andino con relieve topografico y microtextura */}
      <AdminAtmosphereBackground />

      <div className="w-full max-w-md space-y-8 relative z-10">
        {/* Cabecera y Logotipo */}
        <div className="text-center space-y-3">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-12 h-12 rounded-2xl bg-brand-primary flex items-center justify-center text-white shadow-lg group-hover:bg-opacity-95 transition-all">
              <Building2 className="w-6 h-6 text-brand-accent" />
            </div>
          </Link>
          <h1 className="text-2xl font-extrabold text-brand-primary tracking-tight font-heading">
            Acceso Administrativo
          </h1>
          <p className="text-xs text-text-secondary uppercase tracking-widest font-semibold">
            {COMPANY_CONFIG.tradeName}
          </p>
        </div>

        {/* Tarjeta de Formulario */}
        <div className="bg-ui-surface p-8 rounded-3xl border border-neutral-200 shadow-xl space-y-6">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-xs text-text-secondary">
            <ShieldCheck className="w-4 h-4 text-brand-primary shrink-0" />
            <span>Área restringida. Ingrese con sus credenciales autorizadas.</span>
          </div>

          {state?.error && (
            <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold">
              {state.error}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="admin@inmobiliarialosandes.com"
                  defaultValue="admin@inmobiliarialosandes.com"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-text-secondary uppercase tracking-wider mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  name="password"
                  required
                  placeholder="••••••••••••"
                  defaultValue="Admin123*LosAndes"
                  className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-3.5 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-accent"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full py-3.5 px-4 bg-brand-primary hover:bg-[#12281a] text-white font-bold rounded-xl text-sm flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <span>{isPending ? "Validando credenciales..." : "Iniciar Sesión"}</span>
              <ArrowRight className="w-4 h-4 text-brand-accent" />
            </button>
          </form>

          <div className="pt-2 text-center">
            <Link
              href="/"
              className="text-xs text-text-secondary hover:text-brand-primary transition-colors font-medium"
            >
              ← Volver al sitio web principal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

