import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { PropertyGallery } from "@/components/public/PropertyGallery";
import { formatCurrency } from "@/lib/utils/format";
import { buildWhatsAppPropertyLink } from "@/lib/utils/whatsapp";
import {
  Bed,
  Bath,
  Car,
  Maximize2,
  MapPin,
  CheckCircle2,
  MessageCircle,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import { InstagramIcon } from "@/components/icons/InstagramIcon";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{
    slug: string;
  }>;
}

// Vista de detalle completa de una propiedad
export default async function PropertyDetailPage({ params }: PageProps) {
  const { slug } = await params;

  const property = await prisma.property.findUnique({
    where: { slug },
    include: {
      images: {
        orderBy: { order: "asc" },
      },
      agent: true,
    },
  });

  if (!property || property.status === "HIDDEN") {
    notFound();
  }

  // Enlace directo a WhatsApp del asesor asignado
  const whatsappUrl = buildWhatsAppPropertyLink({
    phone: property.agent.phone || "+584140000000",
    propertyTitle: property.title,
    agentName: property.agent.name,
    propertyUrl: `https://inmobiliarialosandes.com/propiedades/${property.slug}`,
  });

  const propertyTypeNameMap: Record<string, string> = {
    TOWNHOUSE: "Townhouse",
    HOUSE: "Casa",
    APARTMENT: "Apartamento",
    COMMERCIAL: "Local Comercial",
    LAND: "Terreno",
    OFFICE: "Oficina",
    OTHER: "Inmueble",
  };

  const propertyTypeLabel =
    property.propertyType === "OTHER" && property.customPropertyType
      ? property.customPropertyType
      : propertyTypeNameMap[property.propertyType] || property.propertyType;

  return (
    <div className="min-h-screen flex flex-col bg-ui-background">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
        {/* Enlace de regreso */}
        <div>
          <Link
            href="/#catalogo"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-text-secondary hover:text-brand-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Catálogo</span>
          </Link>
        </div>

        {/* Encabezado Principal */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-neutral-200">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-brand-accent text-white text-xs font-bold uppercase tracking-wider px-3.5 py-1 rounded-full shadow-sm">
                {property.operationType === "SALE" ? "En Venta" : "En Alquiler"}
              </span>
              <span className="bg-brand-primary text-white text-xs font-semibold px-3 py-1 rounded-full">
                {propertyTypeLabel}
              </span>
              {property.status === "SOLD" && (
                <span className="bg-neutral-900 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                  Vendido
                </span>
              )}
              {property.status === "RENTED" && (
                <span className="bg-neutral-800 text-white text-xs font-bold uppercase px-3 py-1 rounded-full">
                  Alquilado
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-4xl font-black text-brand-primary tracking-tight leading-tight">
              {property.title}
            </h1>

            {/* Direccion escrita descriptiva */}
            <div className="flex items-center gap-2 text-text-secondary text-sm">
              <MapPin className="w-4 h-4 text-neutral-400 shrink-0" />
              <span>
                {property.sector ? `${property.sector}, ` : ""}
                {property.city} • {property.address}
              </span>
            </div>

            {property.googleMapsUrl && (
              <div className="pt-2">
                <a
                  href={property.googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 pl-1.5 pr-3 py-1 rounded-xl bg-neutral-50/80 hover:bg-white text-text-primary hover:text-brand-accent border border-neutral-200/80 hover:border-brand-accent/40 text-xs font-semibold shadow-2xs hover:shadow-xs transition-all duration-150 group/map self-start"
                  title="Abrir ubicación en Google Maps"
                >
                  <span className="w-5 h-5 rounded-lg bg-white border border-neutral-200/70 flex items-center justify-center text-brand-accent shadow-2xs group-hover/map:border-brand-accent/30 group-hover/map:scale-105 transition-all shrink-0">
                    <MapPin className="w-3 h-3 text-brand-accent" />
                  </span>
                  <span>Ver en Google Maps</span>
                  <ExternalLink className="w-3 h-3 text-neutral-400 group-hover/map:text-brand-accent group-hover/map:translate-x-0.5 group-hover/map:-translate-y-0.5 transition-transform shrink-0 ml-0.5" />
                </a>
              </div>
            )}
          </div>

          {/* Precio Destacado */}
          <div className="bg-ui-surface p-4 sm:p-6 rounded-2xl border border-neutral-200 shadow-sm shrink-0">
            <span className="block text-xs uppercase font-bold text-text-secondary tracking-wider">
              Precio Asignado
            </span>
            <div className="text-3xl sm:text-4xl font-black text-brand-accent">
              {formatCurrency(property.price.toString(), property.currency)}
            </div>
            {property.operationType === "RENT" && (
              <span className="text-xs text-text-secondary">Canon mensual de arrendamiento</span>
            )}
          </div>
        </div>

        {/* Contenido en dos columnas: Galeria y Ficha vs Tarjeta del Asesor */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Columna Izquierda: Galeria y Ficha Tecnica (8 cols) */}
          <div className="lg:col-span-8 space-y-10">
            {/* Galeria */}
            <PropertyGallery images={property.images} title={property.title} />

            {/* Barra de Distribucion Cuantitativa */}
            <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm">
              <h2 className="text-xs font-bold uppercase tracking-wider text-text-secondary mb-6">
                Distribución Cuantitativa
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center">
                  <Bed className="w-6 h-6 text-brand-primary mb-2" />
                  <span className="text-2xl font-black text-text-primary">
                    {property.bedrooms ?? 0}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">Habitaciones</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center">
                  <Bath className="w-6 h-6 text-brand-primary mb-2" />
                  <span className="text-2xl font-black text-text-primary">
                    {property.bathrooms ?? 0}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">Baños</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center">
                  <Car className="w-6 h-6 text-brand-primary mb-2" />
                  <span className="text-2xl font-black text-text-primary">
                    {property.parkingSpots ?? 0}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">Puestos Est.</span>
                </div>

                <div className="p-4 rounded-2xl bg-neutral-50 border border-neutral-100 flex flex-col items-center justify-center">
                  <Maximize2 className="w-6 h-6 text-brand-primary mb-2" />
                  <span className="text-2xl font-black text-text-primary">
                    {property.areaSquareMeters ? property.areaSquareMeters.toString() : "-"}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">Área m²</span>
                </div>
              </div>
            </section>

            {/* Descripcion General */}
            <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
              <h2 className="text-lg font-bold text-brand-primary">Descripción General del Inmueble</h2>
              <div className="text-text-primary text-sm sm:text-base leading-relaxed whitespace-pre-line">
                {property.description}
              </div>
            </section>

            {/* Amenidades y Equipamiento */}
            {property.amenities.length > 0 && (
              <section className="bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-sm space-y-4">
                <h2 className="text-lg font-bold text-brand-primary">Amenidades y Equipamiento</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  {property.amenities.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-3 p-3 rounded-xl bg-neutral-50 border border-neutral-100 text-sm font-medium text-text-primary"
                    >
                      <CheckCircle2 className="w-5 h-5 text-brand-accent shrink-0" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* Columna Derecha: Tarjeta del Asesor Asignado (4 cols) */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="sticky top-28 bg-ui-surface p-6 sm:p-8 rounded-3xl border border-neutral-200 shadow-lg space-y-6">
              <div className="text-center space-y-3 pb-6 border-b border-neutral-100">
                <div className="relative w-24 h-24 mx-auto rounded-full overflow-hidden border-4 border-brand-accent/20 shadow-md">
                  <Image
                    src={
                      property.agent.avatarUrl ||
                      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"
                    }
                    alt={property.agent.name}
                    fill
                    sizes="96px"
                    className="object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg font-black text-brand-primary">{property.agent.name}</h3>
                  <p className="text-xs font-semibold text-text-secondary">Asesor Inmobiliario</p>
                </div>
              </div>

              {/* Informacion de Contacto */}
              <div className="space-y-3 text-xs text-text-secondary">
                {property.agent.phone && (
                  <div className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100">
                    <span className="font-medium">Teléfono / WhatsApp:</span>
                    <span className="font-bold text-text-primary">{property.agent.phone}</span>
                  </div>
                )}
                {property.agent.instagram && (
                  <a
                    href={`https://instagram.com/${property.agent.instagram.replace("@", "")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-3 rounded-xl bg-neutral-50 border border-neutral-100 hover:bg-neutral-100 transition-colors"
                  >
                    <span className="flex items-center gap-1.5 font-medium">
                      <InstagramIcon className="w-3.5 h-3.5 text-pink-600" />
                      Instagram:
                    </span>
                    <span className="font-bold text-brand-primary">@{property.agent.instagram.replace("@", "")}</span>
                  </a>
                )}
              </div>

              {/* Boton CTA Principal a WhatsApp */}
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-white font-bold text-sm flex items-center justify-center gap-2.5 shadow-lg shadow-green-600/20 transition-all active:scale-95 text-center leading-tight"
              >
                <MessageCircle className="w-5 h-5 fill-current" />
                <span>Consultar por WhatsApp</span>
              </a>

              <p className="text-[11px] text-center text-text-secondary leading-normal">
                Al presionar el botón se abrirá el chat con el asesor a cargo con la ficha de la propiedad prellenada.
              </p>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
