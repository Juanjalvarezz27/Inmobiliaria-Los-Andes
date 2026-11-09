import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { cache } from "react";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { PropertyGallery } from "@/components/public/PropertyGallery";
import { PropertyActionsBar } from "@/components/public/PropertyActionsBar";
import { PropertyCard } from "@/components/public/PropertyCard";
import { formatCurrency, getInitials } from "@/lib/utils/format";
import { COMPANY_CONFIG } from "@/config/company";
import {
  buildWhatsAppPropertyLink,
  cleanPhoneNumber,
  COMPANY_CENTRAL_PHONE,
} from "@/lib/utils/whatsapp";
import {
  Bed,
  Bath,
  Car,
  Maximize2,
  MapPin,
  CheckCircle2,
  MessageCircle,
  Phone,
  Calendar,
  Layers,
  ExternalLink,
  FileText,
  Building2,
  AlertCircle,
  Map,
  Navigation,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

// ISR: Cachea la ficha de propiedad en Edge CDN por 120s o se revalida al instante con revalidatePath
export const revalidate = 120;

// Pre-renderiza en tiempo de compilación las propiedades disponibles más destacadas
export async function generateStaticParams() {
  try {
    const properties = await prisma.property.findMany({
      where: { status: "AVAILABLE" },
      select: { slug: true },
      take: 16,
    });
    return properties.map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Consulta memoizada para evitar duplicar viajes a Neon entre generateMetadata y el render de la pagina
const getPropertyBySlug = cache(async (slug: string) => {
  return prisma.property.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: [{ isMain: "desc" }, { order: "asc" }],
      },
      agent: {
        select: {
          id: true,
          name: true,
          phone: true,
          position: true,
          avatarUrl: true,
          instagram: true,
          isActive: true,
        },
      },
    },
  });
});

// Metadatos dinámicos Open Graph optimizados para previsualización en WhatsApp y redes sociales
export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const property = await getPropertyBySlug(slug);

  if (!property) {
    return {
      title: "Inmueble no disponible",
      description: "La propiedad solicitada no se encuentra disponible actualmente.",
    };
  }

  const opLabel = property.operationType === "SALE" ? "En Venta" : "En Alquiler";
  const formattedPrice = formatCurrency(property.price.toString(), property.currency);
  const location = property.sector ? `${property.sector}, ${property.city}` : property.city;
  const pageTitle = `${property.title} | ${opLabel} ${formattedPrice}`;
  const pageDescription = property.description
    ? property.description.slice(0, 155).replace(/\s+/g, " ").trim() + "..."
    : `${property.title} ubicado en ${location}. Conoce características, precio y agenda tu visita.`;
  const mainImage = property.images[0]?.url;

  return {
    title: pageTitle,
    description: pageDescription,
    openGraph: {
      title: pageTitle,
      description: pageDescription,
      url: `/propiedades/${slug}`,
      type: "article",
      locale: "es_VE",
      siteName: COMPANY_CONFIG.tradeName,
      ...(mainImage
        ? {
            images: [
              {
                url: mainImage,
                width: 1200,
                height: 630,
                alt: property.title,
              },
            ],
          }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title: pageTitle,
      description: pageDescription,
      ...(mainImage ? { images: [mainImage] } : {}),
    },
  };
}

const PROPERTY_TYPE_NAMES: Record<string, string> = {
  TOWNHOUSE: "Townhouse",
  HOUSE: "Casa",
  APARTMENT: "Apartamento",
  COMMERCIAL: "Local Comercial",
  LAND: "Terreno",
  OFFICE: "Oficina",
  OTHER: "Inmueble",
};

// Vista arquitectonica moderna estilo revista inmobiliaria de lujo con fondo topografico andino
export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const property = await getPropertyBySlug(slug);

  if (!property || property.status === "HIDDEN" || property.status === "ARCHIVED") {
    notFound();
  }

  const isUnavailable = property.status === "SOLD" || property.status === "RENTED";

  // Obtención optimizada de hasta 4 inmuebles similares en una sola consulta
  const similarProperties = await prisma.property.findMany({
    where: {
      status: "AVAILABLE",
      id: { not: property.id },
      OR: [
        { propertyType: property.propertyType },
        { city: property.city },
      ],
    },
    select: {
      id: true,
      title: true,
      slug: true,
      operationType: true,
      propertyType: true,
      customPropertyType: true,
      status: true,
      price: true,
      currency: true,
      bedrooms: true,
      bathrooms: true,
      parkingSpots: true,
      areaSquareMeters: true,
      city: true,
      sector: true,
      images: {
        orderBy: [{ isMain: "desc" }, { order: "asc" }],
        take: 1,
        select: {
          url: true,
          caption: true,
          isMain: true,
        },
      },
      _count: {
        select: { images: true },
      },
      agent: {
        select: {
          name: true,
          phone: true,
          avatarUrl: true,
          isActive: true,
        },
      },
    },
    take: 4,
    orderBy: { createdAt: "desc" },
  });

  // Determina si el asesor asignado esta activo para derivar atencion a Central si esta pausado
  const isAgentActive = Boolean(property.agent?.isActive);

  // Mensaje adaptado para captacion de lead si la propiedad ya fue cerrada
  const customWhatsAppMessage = isUnavailable
    ? `Hola, estuve viendo la propiedad "${property.title}" que ya se encuentra ${property.status === "SOLD" ? "vendida" : "alquilada"}. ¿Tienen disponibles otras opciones similares en ${property.sector ? `${property.sector}, ` : ""}${property.city}?`
    : undefined;

  // Enlace directo a WhatsApp (asesor asignado o Central si el asesor esta inactivo)
  const whatsappUrl = buildWhatsAppPropertyLink({
    phone: property.agent?.phone,
    propertyTitle: property.title,
    agentName: property.agent?.name,
    propertyUrl: `https://inmobiliarialosandes.com/propiedades/${property.slug}`,
    isAgentActive,
    customMessage: customWhatsAppMessage,
  });

  const propertyTypeLabel =
    property.propertyType === "OTHER" && property.customPropertyType
      ? property.customPropertyType
      : PROPERTY_TYPE_NAMES[property.propertyType] || property.propertyType;

  // Resolucion de enlaces y proyeccion cartografica de Google Maps
  const locationQuery = [property.address, property.sector, property.city, "Venezuela"]
    .filter(Boolean)
    .join(", ");

  const googleMapsExternalUrl =
    property.googleMapsUrl && property.googleMapsUrl.trim()
      ? property.googleMapsUrl.trim()
      : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(locationQuery)}`;

  const mapEmbedUrl = `https://maps.google.com/maps?q=${encodeURIComponent(locationQuery)}&t=&z=15&ie=UTF8&iwloc=&output=embed`;

  // Secciones editoriales (descripcion, mapa interactivo y amenidades) para renderizado responsivo
  const propertyEditorialSections = (
    <>
      {/* Descripcion Editorial de la Propiedad con Sombra y Profundidad Real */}
      <section className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#DFD1B8] shadow-[0_12px_36px_rgba(24,38,28,0.10),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] space-y-3">
        <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 font-heading flex items-center gap-2">
          <FileText className="w-4 h-4 text-brand-accent" />
          <span>Sobre esta propiedad</span>
        </h2>
        <div className="text-neutral-700 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
          {property.description}
        </div>
      </section>

      {/* Card Monumental de Ubicacion Satelital y Google Maps */}
      <section
        id="ubicacion"
        className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#DFD1B8] shadow-[0_12px_36px_rgba(24,38,28,0.10),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] space-y-4 scroll-mt-28"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-neutral-100">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-orange-100/70 text-brand-accent flex items-center justify-center shrink-0">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 font-heading">
                Ubicación y Entorno
              </h2>
            </div>
            <h3 className="text-base sm:text-lg font-black text-brand-primary font-heading pl-8">
              {property.sector ? `${property.sector}, ` : ""}{property.city}
            </h3>
            <p className="text-xs sm:text-sm text-neutral-600 font-medium pl-8">
              {property.address}
            </p>
          </div>

          <div className="shrink-0 pl-8 sm:pl-0">
            <a
              href={googleMapsExternalUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-brand-primary to-[#255236] hover:from-[#132d1d] hover:to-[#1b3e28] text-white text-xs font-bold shadow-md shadow-brand-primary/15 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all cursor-pointer group"
              title="Abrir ubicación en Google Maps"
            >
              <Navigation className="w-3.5 h-3.5 text-orange-300 group-hover:rotate-45 transition-transform" />
              <span>Cómo llegar</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>

        {/* Visor Cartografico Embebido con Relieve Editorial */}
        <div className="relative w-full aspect-[16/10] sm:aspect-[21/9] rounded-2xl overflow-hidden border border-[#DFD1B8] shadow-inner bg-neutral-100">
          <iframe
            src={mapEmbedUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen={false}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            title={`Mapa de ubicación para ${property.title}`}
            className="w-full h-full min-h-[260px] sm:min-h-[300px] rounded-2xl"
          />

          {/* Insignia Flotante Satelital en el Mapa */}
          <div className="absolute bottom-3 left-3 pointer-events-none">
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-950/80 backdrop-blur-md border border-white/20 text-white text-[11px] font-bold shadow-lg">
              <MapPin className="w-3.5 h-3.5 text-brand-accent shrink-0" />
              <span className="truncate max-w-[200px] sm:max-w-xs">{property.sector || property.city}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Amenidades y Equipamiento en Chips Modernos con Sombra y Profundidad */}
      {property.amenities.length > 0 && (
        <section className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#DFD1B8] shadow-[0_12px_36px_rgba(24,38,28,0.10),0_2px_8px_rgba(0,0,0,0.04)] ring-1 ring-black/[0.03] space-y-3.5">
          <h2 className="text-xs font-black uppercase tracking-widest text-neutral-400 font-heading flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Amenidades y Equipamiento ({property.amenities.length})</span>
          </h2>

          <div className="flex flex-wrap gap-2 pt-1">
            {property.amenities.map((item, index) => (
              <div
                key={index}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-gradient-to-b from-white to-[#FAF8F4] border border-[#DFD1B8] text-xs sm:text-sm font-bold text-neutral-800 shadow-[0_2px_8px_-2px_rgba(26,59,38,0.06),0_1px_2px_rgba(0,0,0,0.02)] hover:border-brand-accent/50 hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="w-4 h-4 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 shadow-xs">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                </div>
                <span>{item}</span>
              </div>
            ))}
          </div>
        </section>
      )}
    </>
  );

  return (
    <div className="relative isolate z-10 min-h-screen flex flex-col bg-gradient-to-b from-[#FAF7F2] via-[#F3ECE0] to-[#EBE0D2] text-text-primary">
      {/* Capa decorativa: relieve topografico andino refinado con iluminacion calida */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 pointer-events-none overflow-hidden"
      >
        {/* Orbes de luz ambiental calida muy difusos para dar profundidad */}
        <div className="absolute -top-28 -right-24 w-[480px] h-[480px] rounded-full blur-[130px] opacity-[0.12] bg-[#F27441]" />
        <div className="absolute top-1/2 -left-32 -translate-y-1/2 w-[520px] h-[520px] rounded-full blur-[130px] opacity-[0.15] bg-[#D9B382]" />
        <div className="absolute -bottom-28 right-1/4 w-[450px] h-[450px] rounded-full blur-[130px] opacity-[0.12] bg-[#F27441]" />

        {/* Patron SVG de curvas de nivel topograficas andinas estilo grabado cartografico */}
        <svg
          className="absolute inset-0 w-full h-full"
          xmlns="http://www.w3.org/2000/svg"
          style={{
            maskImage: "radial-gradient(ellipse at center, black 65%, transparent 96%)",
            WebkitMaskImage: "radial-gradient(ellipse at center, black 65%, transparent 96%)",
          }}
        >
          <defs>
            <pattern
              id="andean-topography-refined"
              width="360"
              height="360"
              patternUnits="userSpaceOnUse"
            >
              <g stroke="#8E7A60" strokeWidth="0.95" fill="none" opacity="0.35">
                {/* Curvas concentricas del pico principal */}
                <path d="M 125 135 C 135 120 160 125 165 140 C 170 155 152 165 140 162 C 128 160 120 148 125 135 Z" />
                <path d="M 110 125 C 125 102 175 108 185 132 C 195 158 168 180 140 178 C 114 176 98 150 110 125 Z" />
                <path d="M 92 112 C 115 80 192 88 205 125 C 218 165 182 198 140 195 C 100 192 75 152 92 112 Z" />
                <path d="M 75 98 C 105 58 212 68 228 118 C 244 172 198 215 140 210 C 85 205 52 152 75 98 Z" />
                <path d="M 56 82 C 95 38 232 48 250 110 C 268 178 214 232 140 226 C 68 220 28 150 56 82 Z" />
                <path d="M 38 68 C 85 18 252 28 272 102 C 292 185 230 248 140 242 C 50 236 6 148 38 68 Z" />

                {/* Relieve del collado secundario */}
                <path d="M 265 252 C 272 242 290 245 292 255 C 295 265 282 274 272 272 C 262 270 258 260 265 252 Z" />
                <path d="M 250 240 C 265 220 305 228 312 248 C 318 268 296 290 272 286 C 250 282 238 258 250 240 Z" />
                <path d="M 232 225 C 255 198 322 208 332 238 C 342 272 312 305 272 300 C 235 295 218 258 232 225 Z" />

                {/* Curvas topograficas transversales continuas */}
                <path d="M 0 35 C 70 35 120 22 180 25 C 240 28 290 35 360 35" />
                <path d="M 0 195 C 70 195 90 218 135 218 C 180 218 225 195 290 195 C 325 195 345 195 360 195" />
                <path d="M 0 325 C 70 325 145 345 215 338 C 285 330 320 325 360 325" />
                <path d="M 22 0 C 22 70 10 135 12 180 C 14 235 22 290 22 360" />
                <path d="M 180 0 C 180 60 195 105 195 160 C 195 225 180 295 180 360" />
                <path d="M 338 0 C 338 70 350 135 348 180 C 345 235 338 290 338 360" />

                {/* Arcos concentricos en esquinas para ensamble continuo */}
                <path d="M 0 22 C 12 22 22 12 22 0" />
                <path d="M 338 0 C 338 12 348 22 360 22" />
                <path d="M 0 338 C 12 338 22 348 22 360" />
                <path d="M 338 360 C 338 348 348 338 360 338" />

                <path d="M 0 50 C 28 50 50 28 50 0" />
                <path d="M 310 0 C 310 28 332 50 360 50" />
                <path d="M 0 310 C 28 310 50 332 50 360" />
                <path d="M 310 360 C 310 332 332 310 360 310" />
              </g>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#andean-topography-refined)" />
        </svg>

        {/* Microtextura de papel fino para tacto editorial */}
        <div
          className="absolute inset-0 opacity-[0.022] mix-blend-multiply"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
            backgroundSize: "180px 180px",
          }}
        />
      </div>

      <Navbar />

      <main className="flex-1 w-full max-w-7xl 2xl:max-w-[1420px] mx-auto px-4 sm:px-6 lg:px-8 pt-24 sm:pt-28 pb-24 sm:pb-16 space-y-6">
        {/* Barra Superior con Navegacion y Compartir */}
        <PropertyActionsBar propertyTitle={property.title} propertyType={propertyTypeLabel} />

        {/* Aviso de Inmueble No Disponible (Vendido / Alquilado) para preservar SEO y canalizar el lead */}
        {isUnavailable && (
          <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-xs flex items-start sm:items-center gap-3.5 text-amber-950">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-800 flex items-center justify-center shrink-0 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-black font-heading text-amber-950">
                Inmueble {property.status === "SOLD" ? "Vendido" : "Alquilado"}
              </h4>
              <p className="text-xs text-amber-900/90 font-medium mt-0.5 leading-relaxed">
                Esta propiedad ya concretó su operación y no se encuentra disponible. Puedes consultar con nuestro equipo alternativas similares o explorar las opciones sugeridas al final de esta página.
              </p>
            </div>
          </div>
        )}

        {/* LAYOUT EDITORIAL DE ALTO IMPACTO (Galeria y Contenido a la izquierda, Ficha Maestra con Precio y Asesor a la derecha sin espacios vacios) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* COLUMNA IZQUIERDA (7 de 12 cols): Galeria de fotos + Descripcion detallada + Amenidades */}
          <div className="lg:col-span-7 space-y-6">
            {/* 1. Galeria Interactiva de Fotografias (El elemento visual protagonista) */}
            <PropertyGallery images={property.images} title={property.title} />

            {/* Contenido editorial en pantallas de escritorio (lg+) */}
            <div className="hidden lg:block space-y-6">
              {propertyEditorialSections}
            </div>
          </div>

          {/* COLUMNA DERECHA (5 de 12 cols): Panel Maestro de Decision, Precio, Especificaciones y Asesor */}
          <div className="lg:col-span-5 lg:sticky lg:top-24 self-start space-y-4">
            {/* Tarjeta Maestra Integrada: Titulo + Precio + Medidas Clave + Asesor con Sombra y Profundidad */}
            <div className="bg-white rounded-[28px] p-6 sm:p-7 border border-[#DFD1B8] shadow-[0_18px_48px_rgba(24,38,28,0.13),0_4px_12px_rgba(0,0,0,0.05)] ring-1 ring-black/[0.04] space-y-5">
              {/* Badges de Operacion y Tipo */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-white text-xs font-black uppercase tracking-wider px-3 py-1 rounded-full shadow-md ${
                      property.operationType === "SALE"
                        ? "bg-gradient-to-r from-brand-accent via-[#ea5a2a] to-[#d64516] border border-white/20 shadow-brand-accent/30"
                        : "bg-gradient-to-r from-brand-primary to-[#255236] border border-white/20 shadow-brand-primary/30"
                    }`}
                  >
                    {property.operationType === "SALE" ? "En Venta" : "En Alquiler"}
                  </span>
                  <span className="bg-white text-brand-primary text-xs font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-neutral-200/90 shadow-2xs">
                    {propertyTypeLabel}
                  </span>
                </div>

                {property.status === "SOLD" && (
                  <span className="bg-red-600 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                    Vendido
                  </span>
                )}
                {property.status === "RENTED" && (
                  <span className="bg-neutral-800 text-white text-[11px] font-black uppercase px-2.5 py-0.5 rounded-full shadow-sm">
                    Alquilado
                  </span>
                )}
              </div>

              {/* Titulo Monumental */}
              <h1 className="font-heading font-black text-2xl sm:text-3xl text-brand-primary tracking-tight leading-snug">
                {property.title}
              </h1>

              {/* Ubicacion y Enlace a Google Maps */}
              <div className="space-y-1 text-xs text-neutral-600 font-medium pb-2 border-b border-neutral-100">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-brand-accent shrink-0" />
                  <span className="font-bold text-neutral-800 text-sm">
                    {property.sector ? `${property.sector}, ` : ""}{property.city}
                  </span>
                </div>
                <p className="text-neutral-500 pl-5 leading-relaxed">{property.address}</p>

                <div className="pt-1.5 pl-5 flex items-center gap-3">
                  <a
                    href="#ubicacion"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-primary hover:text-brand-accent transition-colors"
                  >
                    <Map className="w-3.5 h-3.5 text-brand-accent" />
                    <span>Ver mapa interactivo</span>
                  </a>
                  <span className="text-neutral-300">•</span>
                  <a
                    href={googleMapsExternalUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-accent hover:underline"
                  >
                    <span>Google Maps</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Bloque Destacado de Precio con Mayor Relieve */}
              <div className="p-4.5 rounded-2xl bg-gradient-to-br from-[#FAF7F1] via-[#F5EFE3] to-[#ECE3D2] border border-[#DFD1B8] shadow-[inset_0_2px_5px_rgba(26,59,38,0.05),0_2px_6px_rgba(0,0,0,0.03)]">
                <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400 block mb-0.5">
                  {property.operationType === "SALE" ? "Precio de Venta" : "Canon de Arrendamiento"}
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl sm:text-4xl font-black font-heading tracking-tight text-brand-primary">
                    {formatCurrency(property.price.toString(), property.currency)}
                  </span>
                  {property.operationType === "RENT" && (
                    <span className="text-xs font-bold text-brand-accent">/ mes</span>
                  )}
                </div>
              </div>

              {/* Tira Unificada de Especificaciones con Profundidad Inset */}
              <div className="py-3 px-1.5 bg-gradient-to-b from-[#FDFBF7] via-[#F8F3EA] to-[#EFE7D8] rounded-2xl border border-[#DFD1B8] shadow-[inset_0_2px_5px_rgba(26,59,38,0.06),0_2px_6px_rgba(0,0,0,0.03)] grid grid-cols-4 divide-x divide-[#DFD1B8] text-center">
                <div className="flex flex-col items-center justify-center px-1">
                  <div className="flex items-center gap-1 text-brand-primary">
                    <Bed className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span className="font-black text-sm text-neutral-900 leading-none">
                      {property.bedrooms ?? "-"}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider mt-1 block">
                    Hab
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-1">
                  <div className="flex items-center gap-1 text-brand-primary">
                    <Bath className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span className="font-black text-sm text-neutral-900 leading-none">
                      {property.bathrooms ?? "-"}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider mt-1 block">
                    Baños
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-1">
                  <div className="flex items-center gap-1 text-brand-primary">
                    <Car className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span className="font-black text-sm text-neutral-900 leading-none">
                      {property.parkingSpots ?? "-"}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider mt-1 block">
                    Estac.
                  </span>
                </div>

                <div className="flex flex-col items-center justify-center px-1">
                  <div className="flex items-center gap-1 text-brand-primary">
                    <Maximize2 className="w-3.5 h-3.5 text-brand-accent shrink-0" />
                    <span className="font-black text-sm text-neutral-900 leading-none truncate max-w-full">
                      {property.areaSquareMeters ? Number(property.areaSquareMeters) : "-"}
                    </span>
                  </div>
                  <span className="text-[9.5px] text-neutral-500 font-bold uppercase tracking-wider mt-1 block">
                    m²
                  </span>
                </div>
              </div>

              {/* Terreno y Año si existen (chips secundarios armoniosos) */}
              {(property.lotSquareMeters || property.yearBuilt) && (
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-neutral-600">
                  {property.lotSquareMeters && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-white to-[#F9F6F0] border border-[#DFD1B8] text-neutral-700 text-[11px] shadow-xs">
                      <Layers className="w-3 h-3 text-brand-accent" />
                      <span>Terreno: {Number(property.lotSquareMeters)} m²</span>
                    </span>
                  )}
                  {property.yearBuilt && (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-b from-white to-[#F9F6F0] border border-[#DFD1B8] text-neutral-700 text-[11px] shadow-xs">
                      <Calendar className="w-3 h-3 text-brand-accent" />
                      <span>Año: {property.yearBuilt}</span>
                    </span>
                  )}
                </div>
              )}

              {/* Ficha del Asesor o Atencion Central y Canales de Contacto Directo */}
              <div className="pt-3 border-t border-neutral-100 space-y-4">
                {isAgentActive && property.agent ? (
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-brand-primary text-white font-black text-base flex items-center justify-center shrink-0 ring-4 ring-white shadow-[0_8px_20px_-4px_rgba(26,59,38,0.22)]">
                      {property.agent.avatarUrl ? (
                        <Image
                          src={property.agent.avatarUrl}
                          alt={property.agent.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      ) : (
                        <span>{getInitials(property.agent.name)}</span>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-neutral-400 block leading-none">
                        Asesor Asignado
                      </span>
                      <h3 className="text-base font-black text-brand-primary font-heading truncate mt-0.5">
                        {property.agent.name}
                      </h3>
                      <p className="text-xs font-medium text-neutral-500 truncate">
                        {property.agent.position || "Asesor Inmobiliario"}
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden shrink-0 ring-4 ring-white shadow-[0_8px_20px_-4px_rgba(26,59,38,0.22)] bg-white">
                      <Image
                        src="/Logo redondo.png"
                        alt="Inmobiliaria Los Andes"
                        fill
                        sizes="56px"
                        className="object-cover"
                      />
                    </div>

                    <div className="min-w-0 flex-1">
                      <span className="text-[9px] font-extrabold uppercase tracking-widest text-brand-accent block leading-none">
                        Atención Central
                      </span>
                      <h3 className="text-base font-black text-brand-primary font-heading truncate mt-0.5">
                        Inmobiliaria Los Andes
                      </h3>
                      <p className="text-xs font-medium text-neutral-500 truncate">
                        Equipo de Asesoría Inmobiliaria
                      </p>
                    </div>
                  </div>
                )}

                {/* Boton Primario WhatsApp de Alta Conversion con Mayor Profundidad */}
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-3.5 px-5 rounded-2xl bg-gradient-to-r from-emerald-600 via-emerald-600 to-[#128c46] hover:from-emerald-500 hover:to-[#0f7a3d] text-white font-black text-sm flex items-center justify-center gap-2 shadow-[0_10px_28px_-6px_rgba(16,149,76,0.40),0_4px_10px_-2px_rgba(0,0,0,0.06)] hover:shadow-[0_16px_34px_-6px_rgba(16,149,76,0.50)] hover:-translate-y-0.5 transition-all active:scale-95 text-center cursor-pointer group"
                >
                  <MessageCircle className="w-4 h-4 fill-white text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span>{isUnavailable ? "Consultar opciones similares" : "Consultar por WhatsApp"}</span>
                </a>

                {/* Canales Secundarios Directos */}
                <div className="grid grid-cols-2 gap-2 text-xs font-bold text-neutral-700">
                  <a
                    href={`tel:${cleanPhoneNumber(isAgentActive && property.agent?.phone ? property.agent.phone : COMPANY_CENTRAL_PHONE)}`}
                    className="p-2.5 rounded-xl bg-gradient-to-b from-white to-[#FBF9F5] hover:to-white border border-[#DFD1B8] shadow-xs hover:shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-1.5 transition-all"
                    title={isAgentActive ? "Llamar directo al asesor" : "Llamar a Central Los Andes"}
                  >
                    <Phone className="w-3.5 h-3.5 text-brand-primary" />
                    <span>Llamar</span>
                  </a>

                  {isAgentActive && property.agent?.instagram ? (
                    <a
                      href={`https://instagram.com/${property.agent.instagram.replace("@", "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-gradient-to-b from-white to-[#FBF9F5] hover:to-white border border-[#DFD1B8] shadow-xs hover:shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-1.5 transition-all"
                      title="Ver Instagram del asesor"
                    >
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                      <span>Instagram</span>
                    </a>
                  ) : (
                    <a
                      href={COMPANY_CONFIG.social.instagramUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2.5 rounded-xl bg-gradient-to-b from-white to-[#FBF9F5] hover:to-white border border-[#DFD1B8] shadow-xs hover:shadow-sm hover:-translate-y-0.5 flex items-center justify-center gap-1.5 transition-all"
                      title="Ver Instagram oficial"
                    >
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                      <span>Instagram</span>
                    </a>
                  )}
                </div>
              </div>
            </div>

            {/* Contenido editorial en pantallas moviles y tablets (< lg), ordenado intuitivamente tras la ficha de precio */}
            <div className="lg:hidden space-y-6">
              {propertyEditorialSections}
            </div>
          </div>
        </div>

        {/* SECCION INFERIOR: Inmuebles que tambien te pueden interesar (4 aleatorios) */}
        {similarProperties.length > 0 && (
          <section className="pt-12 sm:pt-16 border-t border-[#E8DEC9]/80 space-y-6">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-accent/10 border border-brand-accent/25 text-brand-accent text-xs font-black uppercase tracking-wider shadow-2xs">
                <span className="w-1.5 h-1.5 rounded-full bg-brand-accent" />
                <span>Recomendaciones para ti</span>
              </div>

              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-heading text-brand-primary tracking-tight">
                Inmuebles que también te pueden interesar
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
              {similarProperties.map((simProp) => (
                <PropertyCard
                  key={simProp.id}
                  property={{
                    id: simProp.id,
                    title: simProp.title,
                    slug: simProp.slug,
                    operationType: simProp.operationType as "SALE" | "RENT",
                    propertyType: simProp.propertyType,
                    customPropertyType: simProp.customPropertyType,
                    status: simProp.status as "AVAILABLE" | "RESERVED" | "SOLD" | "RENTED",
                    price: simProp.price.toString(),
                    currency: simProp.currency,
                    bedrooms: simProp.bedrooms,
                    bathrooms: simProp.bathrooms,
                    parkingSpots: simProp.parkingSpots,
                    areaSquareMeters: simProp.areaSquareMeters?.toString(),
                    city: simProp.city,
                    sector: simProp.sector,
                    coverImageUrl: simProp.images[0]?.url || null,
                    imagesCount: simProp._count.images,
                    images: simProp.images,
                    agent: simProp.agent,
                  }}
                />
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Barra de Conversion Flotante Inferior en Moviles con Mayor Profundidad y Safe Area */}
      <div className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-xl border-t border-[#DFD1B8] px-4 py-3 pb-[calc(0.75rem+env(safe-area-inset-bottom,0px))] flex items-center justify-between gap-3 shadow-[0_-12px_36px_rgba(26,59,38,0.15)] ring-1 ring-black/[0.04]">
        <div>
          <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
            {property.operationType === "SALE" ? "Venta" : "Alquiler"}
          </span>
          <span className="text-lg font-black font-heading text-brand-primary">
            {formatCurrency(property.price.toString(), property.currency)}
          </span>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="py-2.5 px-4 rounded-xl bg-emerald-600 text-white font-black text-xs flex items-center gap-1.5 shadow-md active:scale-95"
        >
          <MessageCircle className="w-4 h-4 fill-white text-emerald-600" />
          <span>Consultar</span>
        </a>
      </div>

      <Footer />
    </div>
  );
}
