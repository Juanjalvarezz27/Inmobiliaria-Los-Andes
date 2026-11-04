import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { HeroSearch } from "@/components/public/HeroSearch";
import { CatalogFilterBar } from "@/components/public/CatalogFilterBar";
import { PropertyCard, type PropertyCardData } from "@/components/public/PropertyCard";
import { FeaturedAgentsSection, type FeaturedAgentData } from "@/components/public/FeaturedAgentsSection";
import { TrustSection } from "@/components/public/TrustSection";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";
import { PublicPagination } from "@/components/public/PublicPagination";
import { Sparkles, FilterX } from "lucide-react";
import Link from "next/link";
import type { Prisma, OperationType, PropertyType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 9;

interface PageProps {
  searchParams: Promise<{
    operacion?: string;
    tipo?: string;
    q?: string;
    orden?: string;
    page?: string;
  }>;
}

// Portal publico principal con catalogo paginado, filtros ejecutivos y showcase de asesores
export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const operation = params.operacion;
  const propertyType = params.tipo;
  const query = params.q;
  const sortOrder = params.orden || "recientes";
  const currentPage = Math.max(1, parseInt(params.page || "1", 10) || 1);

  // Filtros dinamicos basados en la consulta
  const whereClause: Prisma.PropertyWhereInput = {
    status: {
      not: "HIDDEN",
    },
  };

  if (operation && operation !== "ALL") {
    whereClause.operationType = operation as OperationType;
  }

  if (propertyType && propertyType !== "ALL") {
    whereClause.propertyType = propertyType as PropertyType;
  }

  if (query && query.trim()) {
    whereClause.OR = [
      { title: { contains: query.trim(), mode: "insensitive" } },
      { sector: { contains: query.trim(), mode: "insensitive" } },
      { city: { contains: query.trim(), mode: "insensitive" } },
      { description: { contains: query.trim(), mode: "insensitive" } },
    ];
  }

  // Ordenamiento dinamico
  let orderByClause: Prisma.PropertyOrderByWithRelationInput[] = [{ featured: "desc" }];
  if (sortOrder === "menor-precio") {
    orderByClause.push({ price: "asc" });
  } else if (sortOrder === "mayor-precio") {
    orderByClause.push({ price: "desc" });
  } else {
    orderByClause.push({ createdAt: "desc" });
  }

  // Consultas concurrentes en base de datos
  const [totalPropertiesCount, properties, activeAgents] = await Promise.all([
    prisma.property.count({ where: whereClause }),
    prisma.property.findMany({
      where: whereClause,
      include: {
        images: {
          orderBy: { order: "asc" },
        },
        agent: {
          select: {
            name: true,
            phone: true,
            avatarUrl: true,
          },
        },
      },
      orderBy: orderByClause,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.findMany({
      where: { role: "AGENT", isActive: true },
      select: {
        id: true,
        name: true,
        phone: true,
        avatarUrl: true,
        position: true,
        _count: {
          select: { properties: true },
        },
      },
      orderBy: { properties: { _count: "desc" } },
      take: 4,
    }),
  ]);

  const totalPages = Math.ceil(totalPropertiesCount / PAGE_SIZE);

  // Mapeo seguro de asesores destacados
  const featuredAgents: FeaturedAgentData[] = activeAgents.map((a) => ({
    id: a.id,
    name: a.name,
    phone: a.phone,
    avatarUrl: a.avatarUrl,
    position: a.position,
    propertiesCount: a._count.properties,
  }));

  // Fotografias reales de propiedades para el carrusel de fondo del Hero
  const heroBackgroundSlides = properties
    .filter((p) => p.images.length > 0)
    .map((p) => ({
      url: p.images[0].url,
      caption: p.title,
    }))
    .slice(0, 5);

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8]">
      {/* Navegacion Superior */}
      <Navbar />

      {/* Hero Principal con Buscador y Fondo Dinamico */}
      <HeroSearch slides={heroBackgroundSlides} />

      {/* Seccion Principal del Catalogo */}
      <main id="catalogo" className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-8">
        {/* Cabecera del Catalogo */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200/80 pb-6">
          <div className="space-y-1">
            <div className="inline-flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>Inventario Disponible</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary font-heading tracking-tight">
              Catálogo de Inmuebles Disponibles
            </h2>
            <p className="text-xs sm:text-sm text-text-secondary">
              Propiedades verificadas con asesoría personalizada y trámites al día.
            </p>
          </div>
        </div>

        {/* Barra de Filtros Interactiva y Ordenamiento */}
        <CatalogFilterBar totalResults={totalPropertiesCount} />

        {/* Grilla de Propiedades o Estado Vacio */}
        {properties.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {properties.map((property) => (
                <PropertyCard
                  key={property.id}
                  property={{
                    id: property.id,
                    title: property.title,
                    slug: property.slug,
                    operationType: property.operationType as "SALE" | "RENT",
                    propertyType: property.propertyType,
                    customPropertyType: property.customPropertyType,
                    status: property.status as PropertyCardData["status"],
                    price: property.price.toString(),
                    currency: property.currency,
                    bedrooms: property.bedrooms,
                    bathrooms: property.bathrooms,
                    parkingSpots: property.parkingSpots,
                    areaSquareMeters: property.areaSquareMeters?.toString(),
                    city: property.city,
                    sector: property.sector,
                    images: property.images,
                    agent: property.agent,
                  }}
                />
              ))}
            </div>

            {/* Paginacion Paginada Dinamica */}
            <PublicPagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalItems={totalPropertiesCount}
              itemsPerPage={PAGE_SIZE}
            />
          </>
        ) : (
          /* Estado Vacio cuando no hay coincidencias */
          <div className="bg-white p-12 sm:p-16 rounded-3xl border border-neutral-200 text-center max-w-lg mx-auto space-y-4 shadow-sm">
            <div className="w-16 h-16 mx-auto rounded-2xl bg-orange-50 text-brand-accent flex items-center justify-center border border-orange-100">
              <FilterX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-black text-brand-primary font-heading">
              No se encontraron inmuebles
            </h3>
            <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              No encontramos propiedades que coincidan exactamente con tu criterio de búsqueda. Prueba modificando los filtros o restableciendo los valores.
            </p>
            <div className="pt-2">
              <Link
                href="/#catalogo"
                className="inline-flex items-center justify-center px-6 py-2.5 bg-brand-primary hover:bg-[#122b1c] text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95"
              >
                Ver todos los inmuebles
              </Link>
            </div>
          </div>
        )}
      </main>

      {/* Seccion Destacada de Asesores Inmobiliarios */}
      <FeaturedAgentsSection agents={featuredAgents} />

      {/* Pilares Institucionales de Confianza */}
      <TrustSection />

      {/* Pie de Pagina */}
      <Footer />

      {/* Acceso Flotante de WhatsApp Concierge */}
      <FloatingWhatsApp />
    </div>
  );
}
