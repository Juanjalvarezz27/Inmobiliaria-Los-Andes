import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import {
  ArrowLeft,
  Phone,
  Mail,
  Home,
  Tag,
  Key,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { AgentDetailActions } from "./AgentDetailActions";
import { AgentPropertiesGrid, SerializedProperty } from "@/components/admin/AgentPropertiesGrid";

export const dynamic = "force-dynamic";
export const revalidate = 0;

interface PageProps {
  params: Promise<{ id: string }>;
}

// Vista de detalle de un asesor inmobiliario con su cartera de propiedades rediseñada con estetica premium
export default async function AgentDetailPage({ params }: PageProps) {
  const { id } = await params;

  const agent = await prisma.user.findUnique({
    where: { id },
    include: {
      properties: {
        orderBy: { createdAt: "desc" },
        include: {
          images: {
            orderBy: { order: "asc" },
          },
        },
      },
    },
  });

  if (!agent || agent.role !== "AGENT") {
    notFound();
  }

  // Consulta de todos los asesores para el selector de asignacion
  const allAgents = await prisma.user.findMany({
    where: { role: "AGENT", isActive: true },
    select: { id: true, name: true, position: true, avatarUrl: true },
    orderBy: { name: "asc" },
  });

  // Calculo de metricas operativas reales del asesor
  const totalProperties = agent.properties.length;
  const forSaleCount = agent.properties.filter((p) => p.operationType === "SALE").length;
  const forRentCount = agent.properties.filter((p) => p.operationType === "RENT").length;

  // Serializacion segura de propiedades para el componente cliente y modal
  const serializedProperties: SerializedProperty[] = agent.properties.map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    description: p.description,
    operationType: p.operationType,
    propertyType: p.propertyType,
    customPropertyType: p.customPropertyType,
    status: p.status,
    price: Number(p.price),
    currency: p.currency,
    featured: p.featured,
    bedrooms: p.bedrooms,
    bathrooms: p.bathrooms,
    parkingSpots: p.parkingSpots,
    areaSquareMeters: p.areaSquareMeters ? Number(p.areaSquareMeters) : null,
    lotSquareMeters: p.lotSquareMeters ? Number(p.lotSquareMeters) : null,
    yearBuilt: p.yearBuilt,
    city: p.city,
    sector: p.sector,
    address: p.address,
    googleMapsUrl: p.googleMapsUrl,
    amenities: p.amenities,
    agentId: p.agentId,
    images: p.images.map((img) => ({
      id: img.id,
      url: img.url,
      caption: img.caption,
      isMain: img.isMain,
      order: img.order,
    })),
  }));

  // Formato para WhatsApp
  const cleanPhone = agent.phone ? agent.phone.replace(/[^0-9]/g, "") : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
        agent.name
      )},%20te%20contacto%20desde%20la%20administracion%20de%20Inmobiliaria%20Los%20Andes.`
    : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Navegacion y Retorno */}
      <div>
        <Link
          href="/admin/asesores"
          className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-neutral-200/80 shadow-xs text-xs font-bold text-text-secondary hover:text-brand-primary hover:border-brand-primary/30 transition-all group"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
          <span>Volver al Directorio de Asesores</span>
        </Link>
      </div>

      {/* Tarjeta Ejecutiva Hero del Asesor con el verde corporativo de la marca */}
      <div className="relative bg-gradient-to-br from-[#122b1c] via-brand-primary to-[#0e2115] text-white rounded-3xl border border-emerald-500/25 shadow-[0_16px_40px_-12px_rgba(18,43,28,0.4),inset_0_1px_0_rgba(255,255,255,0.12)] p-6 sm:p-7 overflow-hidden">
        {/* Sutil resalte de cabecera */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emerald-400/30 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-6 sm:gap-8">
          {/* Bloque Izquierdo: Avatar e Informacion */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 sm:gap-6 flex-1 min-w-0">
            {/* Avatar enmarcado con aro de alto contraste */}
            <div className="relative w-22 h-22 sm:w-24 sm:h-24 rounded-2xl overflow-hidden ring-4 ring-white/20 shadow-xl bg-neutral-900 shrink-0">
              <Image
                src={
                  agent.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                }
                alt={agent.name}
                fill
                sizes="(max-width: 640px) 88px, 96px"
                className="object-cover"
                priority
              />
            </div>

            <div className="space-y-3 flex-1 min-w-0">
              {/* Nombre y Estado */}
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-black text-white font-heading tracking-tight truncate">
                  {agent.name}
                </h1>
                <span
                  className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1.5 shrink-0 shadow-xs ${
                    agent.isActive
                      ? "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30"
                      : "bg-white/10 text-neutral-300 border border-white/15"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      agent.isActive ? "bg-emerald-400 animate-pulse" : "bg-neutral-400"
                    }`}
                  />
                  {agent.isActive ? "Asesor Activo" : "Asesor Pausado"}
                </span>
              </div>

              {/* Canales de Contacto con solidez y contraste */}
              <div className="flex flex-wrap items-center gap-2.5 pt-0.5">
                {whatsappUrl && (
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e2115]/90 hover:bg-[#09170e] border border-emerald-500/30 hover:border-emerald-400 text-xs font-semibold text-white transition-all shadow-xs group"
                    title="Chatear por WhatsApp"
                  >
                    <Phone className="w-3.5 h-3.5 text-emerald-400 group-hover:scale-110 transition-transform" />
                    <span>{agent.phone}</span>
                  </a>
                )}

                <a
                  href={`mailto:${agent.email}`}
                  className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e2115]/90 hover:bg-[#09170e] border border-emerald-500/30 hover:border-emerald-400 text-xs font-semibold text-white transition-all shadow-xs group"
                  title="Enviar correo electrónico"
                >
                  <Mail className="w-3.5 h-3.5 text-emerald-200 group-hover:scale-110 transition-transform" />
                  <span>{agent.email}</span>
                </a>

                {agent.instagram && (
                  <a
                    href={`https://instagram.com/${agent.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-[#0e2115]/90 hover:bg-[#09170e] border border-emerald-500/30 hover:border-pink-400 text-xs font-semibold text-white transition-all shadow-xs group"
                    title="Ver perfil de Instagram"
                  >
                    <InstagramIcon className="w-3.5 h-3.5 text-pink-400 group-hover:scale-110 transition-transform" />
                    <span>@{agent.instagram.replace("@", "")}</span>
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Bloque Derecho: Columna Vertical de Acciones (Uno debajo de otro con solidez) */}
          <AgentDetailActions
            agent={{
              id: agent.id,
              name: agent.name,
              email: agent.email,
              phone: agent.phone,
              position: agent.position,
              instagram: agent.instagram,
              avatarUrl: agent.avatarUrl,
              isActive: agent.isActive,
            }}
            agents={allAgents}
          />
        </div>
      </div>

      {/* Tarjetas de Metricas Ejecutivas del Asesor (3 Columnas Equilibradas) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        {/* Inmuebles Asignados */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(26,59,38,0.06),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(26,59,38,0.14),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-brand-primary/30 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-brand-primary/[0.05] to-transparent pointer-events-none group-hover:from-brand-primary/[0.09] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-brand-primary/[0.05] rounded-full blur-xl pointer-events-none" />
          <Home className="absolute -right-3 -bottom-3 w-24 h-24 text-brand-primary/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-brand-primary/80 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/70" />
                Inmuebles Asignados
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-brand-primary font-heading tracking-tight block mt-1.5">
                {totalProperties}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#122b1c] via-[#1a3b26] to-[#0d1f14] text-white border border-emerald-500/25 flex items-center justify-center shadow-md shadow-brand-primary/20 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Home className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Propiedades en Venta */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(217,119,6,0.08),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(217,119,6,0.16),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-amber-500/40 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-amber-500/[0.07] to-transparent pointer-events-none group-hover:from-amber-500/[0.12] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-amber-500/[0.07] rounded-full blur-xl pointer-events-none" />
          <Tag className="absolute -right-3 -bottom-3 w-24 h-24 text-amber-600/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                En Venta
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-amber-700 font-heading tracking-tight block mt-1.5">
                {forSaleCount}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#d97706] via-amber-600 to-[#b45309] text-white border border-amber-300/35 flex items-center justify-center shadow-md shadow-amber-600/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Tag className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>

        {/* Propiedades en Alquiler */}
        <div className="group relative bg-white p-5 sm:p-6 rounded-3xl border border-neutral-200/80 shadow-[0_4px_20px_-4px_rgba(37,99,235,0.08),0_2px_6px_-1px_rgba(0,0,0,0.03),inset_0_1px_0_rgba(255,255,255,1)] hover:shadow-[0_12px_28px_-6px_rgba(37,99,235,0.16),inset_0_1px_0_rgba(255,255,255,1)] hover:-translate-y-0.5 hover:border-blue-500/40 transition-[transform,box-shadow,border-color] duration-150 ease-out overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-blue-500/[0.07] to-transparent pointer-events-none group-hover:from-blue-500/[0.12] transition-colors duration-200" />
          <div className="absolute -right-6 -top-6 w-32 h-32 bg-blue-500/[0.07] rounded-full blur-xl pointer-events-none" />
          <Key className="absolute -right-3 -bottom-3 w-24 h-24 text-blue-600/[0.03] pointer-events-none" />

          <div className="flex items-start justify-between gap-3 relative z-10">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-blue-800 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                En Alquiler
              </span>
              <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-blue-700 font-heading tracking-tight block mt-1.5">
                {forRentCount}
              </span>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#2563eb] via-blue-600 to-[#1d4ed8] text-white border border-blue-300/35 flex items-center justify-center shadow-md shadow-blue-600/25 group-hover:scale-105 transition-transform duration-150 shrink-0">
              <Key className="w-6 h-6 text-white drop-shadow-sm" />
            </div>
          </div>
        </div>
      </div>

      {/* Cuadrícula interactiva de propiedades con modal de edición */}
      <AgentPropertiesGrid
        properties={serializedProperties}
        agentId={agent.id}
        agents={allAgents}
      />

    </div>
  );
}
