import { notFound } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { prisma } from "@/lib/prisma";
import { formatCurrency, formatArea } from "@/lib/utils/format";
import {
  ArrowLeft,
  Phone,
  Mail,
  Home,
  Tag,
  Key,
  DollarSign,
  BedDouble,
  Bath,
  Car,
  Maximize2,
  ExternalLink,
  Edit3,
  Calendar,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";
import { AgentDetailActions } from "./AgentDetailActions";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Vista de detalle de un asesor inmobiliario con su cartera de propiedades
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

  // Calculo de metricas ejecutivas del asesor
  const totalProperties = agent.properties.length;
  const forSaleCount = agent.properties.filter((p) => p.operationType === "SALE").length;
  const forRentCount = agent.properties.filter((p) => p.operationType === "RENT").length;
  const portfolioValue = agent.properties.reduce(
    (sum, p) => sum + Number(p.price || 0),
    0
  );

  // Formato para WhatsApp
  const cleanPhone = agent.phone ? agent.phone.replace(/[^0-9]/g, "") : null;
  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=Hola%20${encodeURIComponent(
        agent.name
      )},%20te%20contacto%20desde%20la%20administracion%20de%20Inmobiliaria%20Los%20Andes.`
    : null;

  return (
    <div className="space-y-8 pb-12">
      {/* Navegacion y Breadcrumbs */}
      <div>
        <Link
          href="/admin/asesores"
          className="inline-flex items-center gap-2 text-xs sm:text-sm font-bold text-text-secondary hover:text-brand-accent transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Volver al listado de Asesores</span>
        </Link>
      </div>

      {/* Cabecera de Perfil del Asesor */}
      <div className="bg-ui-surface rounded-3xl border border-neutral-200/80 p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-3xl overflow-hidden border-4 border-white shadow-lg bg-neutral-100 shrink-0">
              <Image
                src={
                  agent.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                }
                alt={agent.name}
                fill
                sizes="112px"
                className="object-cover"
                priority
              />
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <h1 className="text-2xl sm:text-3xl font-bold text-brand-primary font-heading tracking-tight">
                  {agent.name}
                </h1>
                <span
                  className={`text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1.5 ${
                    agent.isActive
                      ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                      : "bg-neutral-100 text-neutral-600 border border-neutral-300"
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      agent.isActive ? "bg-emerald-500 animate-pulse" : "bg-neutral-400"
                    }`}
                  />
                  {agent.isActive ? "Asesor Activo" : "Asesor Inactivo (Pausado)"}
                </span>
              </div>

              <p className="text-sm font-semibold text-brand-accent">{agent.position}</p>

              <div className="flex flex-wrap items-center gap-y-2 gap-x-4 text-xs text-text-secondary pt-1">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                  Registrado el {new Date(agent.createdAt).toLocaleDateString("es-VE", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-neutral-400" />
                  {agent.email}
                </span>
              </div>
            </div>
          </div>

          {/* Acciones de modificacion de perfil */}
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
          />
        </div>

        {/* Canales de Contacto Directo */}
        <div className="mt-6 pt-6 border-t border-neutral-100 flex flex-wrap items-center gap-3">
          {whatsappUrl && (
            <a
              href={whatsappUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp: {agent.phone}</span>
            </a>
          )}

          <a
            href={`mailto:${agent.email}`}
            className="inline-flex items-center gap-2 bg-neutral-50 hover:bg-neutral-100 text-neutral-700 border border-neutral-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
          >
            <Mail className="w-3.5 h-3.5 text-neutral-500" />
            <span>Enviar Correo</span>
          </a>

          {agent.instagram && (
            <a
              href={`https://instagram.com/${agent.instagram.replace("@", "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 bg-pink-50 hover:bg-pink-100 text-pink-700 border border-pink-200 text-xs font-bold px-3.5 py-2 rounded-xl transition-colors"
            >
              <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
              <span>@{agent.instagram.replace("@", "")}</span>
            </a>
          )}
        </div>
      </div>

      {/* Tarjetas de Metricas Ejecutivas del Asesor */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Inmuebles Asignados */}
        <div className="group relative bg-ui-surface p-6 rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-brand-primary/30 transition-all duration-200 overflow-hidden">
          <Home className="absolute -right-3 -bottom-3 w-20 h-20 text-brand-primary/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-text-secondary">
              Inmuebles Asignados
            </span>
            <div className="w-10 h-10 rounded-2xl bg-brand-primary text-white flex items-center justify-center shadow-md shadow-brand-primary/20 group-hover:scale-110 transition-transform">
              <Home className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-brand-primary font-heading tracking-tight block">
              {totalProperties}
            </span>
          </div>
        </div>

        {/* Propiedades en Venta */}
        <div className="group relative bg-ui-surface p-6 rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-amber-300 transition-all duration-200 overflow-hidden">
          <Tag className="absolute -right-3 -bottom-3 w-20 h-20 text-amber-600/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
              En Venta
            </span>
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center shadow-md shadow-amber-500/20 group-hover:scale-110 transition-transform">
              <Tag className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-amber-800 font-heading tracking-tight block">
              {forSaleCount}
            </span>
          </div>
        </div>

        {/* Propiedades en Alquiler */}
        <div className="group relative bg-ui-surface p-6 rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-blue-300 transition-all duration-200 overflow-hidden">
          <Key className="absolute -right-3 -bottom-3 w-20 h-20 text-blue-600/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-800">
              En Alquiler
            </span>
            <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center shadow-md shadow-blue-600/20 group-hover:scale-110 transition-transform">
              <Key className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-3xl sm:text-4xl font-extrabold text-blue-800 font-heading tracking-tight block">
              {forRentCount}
            </span>
          </div>
        </div>

        {/* Valor de Cartera */}
        <div className="group relative bg-ui-surface p-6 rounded-3xl border border-neutral-200/80 shadow-sm hover:shadow-lg hover:border-brand-accent/30 transition-all duration-200 overflow-hidden">
          <DollarSign className="absolute -right-3 -bottom-3 w-20 h-20 text-brand-accent/[0.04] pointer-events-none group-hover:scale-110 transition-transform duration-300" />

          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-brand-accent">
              Valor de Cartera
            </span>
            <div className="w-10 h-10 rounded-2xl bg-brand-accent text-white flex items-center justify-center shadow-md shadow-brand-accent/20 group-hover:scale-110 transition-transform">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="mt-4">
            <span className="text-2xl sm:text-3xl font-extrabold text-brand-accent font-heading tracking-tight block truncate">
              {formatCurrency(portfolioValue)}
            </span>
          </div>
        </div>
      </div>

      {/* Seccion de Cartera de Propiedades Asignadas */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-brand-primary font-heading">
              Propiedades Asignadas a este Asesor ({totalProperties})
            </h2>
            <p className="text-xs text-text-secondary">
              Inmuebles donde este asesor actúa como el contacto directo para los clientes.
            </p>
          </div>
          <Link
            href={`/admin/propiedades/nueva?agentId=${agent.id}`}
            className="hidden sm:inline-flex items-center gap-2 text-xs font-bold text-brand-accent hover:underline"
          >
            <span>+ Publicar nueva propiedad con este asesor</span>
          </Link>
        </div>

        {totalProperties === 0 ? (
          <div className="bg-ui-surface rounded-3xl border border-neutral-200/80 p-12 text-center space-y-4">
            <div className="w-16 h-16 rounded-3xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
              <Home className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-1">
              <h3 className="text-base font-bold text-brand-primary font-heading">
                Sin propiedades asignadas actualmente
              </h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Este asesor no tiene inmuebles vinculados a su cartera comercial. Puedes publicar una nueva propiedad o reasignar una existente.
              </p>
            </div>
            <Link
              href={`/admin/propiedades/nueva?agentId=${agent.id}`}
              className="inline-flex items-center gap-2 bg-brand-accent hover:bg-[#c94b21] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-95"
            >
              <span>Asignar Primera Propiedad</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {agent.properties.map((property) => {
              const coverImage = property.images[0]?.url || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80";

              return (
                <div
                  key={property.id}
                  className="bg-ui-surface rounded-3xl border border-neutral-200/80 overflow-hidden shadow-sm hover:shadow-md transition-all flex flex-col justify-between group"
                >
                  <div>
                    {/* Imagen de Portada y Badges */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden bg-neutral-100">
                      <Image
                        src={coverImage}
                        alt={property.title}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-lg text-white shadow-sm ${
                            property.operationType === "SALE" ? "bg-brand-primary" : "bg-brand-accent"
                          }`}
                        >
                          {property.operationType === "SALE" ? "Venta" : "Alquiler"}
                        </span>
                        <span
                          className={`text-[10px] font-bold px-2 py-1 rounded-lg shadow-sm ${
                            property.status === "AVAILABLE"
                              ? "bg-emerald-600 text-white"
                              : property.status === "SOLD"
                              ? "bg-red-600 text-white"
                              : property.status === "RENTED"
                              ? "bg-blue-600 text-white"
                              : "bg-neutral-600 text-white"
                          }`}
                        >
                          {property.status === "AVAILABLE"
                            ? "Disponible"
                            : property.status === "SOLD"
                            ? "Vendido"
                            : property.status === "RENTED"
                            ? "Alquilado"
                            : property.status}
                        </span>
                      </div>
                    </div>

                    {/* Informacion de la propiedad */}
                    <div className="p-5 space-y-3">
                      <div>
                        <span className="text-xl font-extrabold text-brand-accent font-heading block">
                          {formatCurrency(Number(property.price))}
                        </span>
                        <h3 className="font-bold text-text-primary text-sm line-clamp-2 mt-1">
                          {property.title}
                        </h3>
                        <p className="text-xs text-text-secondary mt-0.5">
                          {property.sector ? `${property.sector}, ` : ""}
                          {property.city}
                        </p>
                      </div>

                      {/* Iconos de distribucion */}
                      <div className="grid grid-cols-4 gap-2 py-2.5 px-3 bg-neutral-50 rounded-2xl text-[11px] font-semibold text-text-secondary border border-neutral-100">
                        <div className="flex items-center gap-1.5" title="Habitaciones">
                          <BedDouble className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{property.bedrooms ?? "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Baños">
                          <Bath className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{property.bathrooms ?? "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Estacionamientos">
                          <Car className="w-3.5 h-3.5 text-neutral-400" />
                          <span>{property.parkingSpots ?? "-"}</span>
                        </div>
                        <div className="flex items-center gap-1.5" title="Área">
                          <Maximize2 className="w-3.5 h-3.5 text-neutral-400" />
                          <span className="truncate">{property.areaSquareMeters ? formatArea(property.areaSquareMeters) : "-"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Acciones de la propiedad */}
                  <div className="p-4 bg-neutral-50 border-t border-neutral-100 flex items-center justify-between">
                    <Link
                      href={`/propiedades/${property.slug}`}
                      target="_blank"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-text-secondary hover:text-brand-primary transition-colors"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                      <span>Ver ficha pública</span>
                    </Link>

                    <Link
                      href={`/admin/propiedades/${property.id}/editar`}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      <span>Editar</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

