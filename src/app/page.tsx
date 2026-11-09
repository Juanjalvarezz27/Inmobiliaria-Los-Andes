import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { HeroSearch } from "@/components/public/HeroSearch";
import { PropertyCard, type PropertyCardData } from "@/components/public/PropertyCard";
import { CatalogBanner } from "@/components/public/CatalogBanner";
import { FeaturedAgentsSection, type FeaturedAgentData } from "@/components/public/FeaturedAgentsSection";
import { TrustSection } from "@/components/public/TrustSection";
import { FloatingWhatsApp } from "@/components/public/FloatingWhatsApp";
import { PublicPagination } from "@/components/public/PublicPagination";
import { FilterX } from "lucide-react";
import Link from "next/link";
import type { Prisma, OperationType, PropertyType } from "@/generated/prisma/client";

// ISR: Cachea la portada en el Edge CDN de Vercel por 60s y se revalida al instante con revalidatePath al editar en /admin
export const revalidate = 60;

const PAGE_SIZE = 16;

interface PageProps {
  searchParams: Promise<{
    operacion?: string;
    tipo?: string;
    q?: string;
    orden?: string;
    page?: string;
    estado?: string;
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

  // Filtros dinamicos: por defecto solo inmuebles plenamente disponibles en el catalogo publico
  const whereClause: Prisma.PropertyWhereInput = {
    status: params.estado === "todos" ? { notIn: ["HIDDEN", "ARCHIVED"] } : "AVAILABLE",
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
  const orderByClause: Prisma.PropertyOrderByWithRelationInput[] = [];
  if (sortOrder === "menor-precio") {
    orderByClause.push({ price: "asc" });
  } else if (sortOrder === "mayor-precio") {
    orderByClause.push({ price: "desc" });
  } else {
    // Orden visual personalizado determinado por el administrador
    orderByClause.push({ displayOrder: "asc" });
    orderByClause.push({ createdAt: "desc" });
  }

  // Consultas concurrentes en base de datos
  const [
    totalPropertiesCount,
    totalAgentsCount,
    properties,
    activeAgents,
    locationRecords,
  ] = await Promise.all([
    prisma.property.count({ where: whereClause }),
    prisma.user.count({ where: { role: "AGENT", isActive: true } }),
    prisma.property.findMany({
      where: whereClause,
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
      orderBy: orderByClause,
      skip: (currentPage - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.user.findMany({
      where: { role: "AGENT", isActive: true, featured: true },
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
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      take: 8,
    }),
    // Sectores y ciudades de inmuebles disponibles para el autocompletado en tiempo real
    prisma.property.findMany({
      where: { status: "AVAILABLE" },
      select: { sector: true, city: true },
      distinct: ["sector", "city"],
    }),
  ]);

  // Consolidar sectores y ciudades unicas para sugerencias del buscador
  const uniqueLocationsSet = new Set<string>();
  for (const item of locationRecords) {
    if (item.sector && item.sector.trim()) {
      uniqueLocationsSet.add(item.sector.trim());
    }
  }
  for (const item of locationRecords) {
    if (item.city && item.city.trim()) {
      uniqueLocationsSet.add(item.city.trim());
    }
  }
  const availableLocations = Array.from(uniqueLocationsSet);

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

  // Fotografias reales de propiedades combinadas con el Monumento a la Virgen de la Paz para el carrusel de fondo del Hero
  const propertySlides = properties
    .filter((p) => p.images.length > 0)
    .map((p) => ({
      url: p.images[0].url,
      caption: p.title,
    }))
    .slice(0, 4);

  const heroBackgroundSlides =
    propertySlides.length > 0
      ? [
          propertySlides[0],
          {
            url: "/images/virgen_de_la_paz_0.jpg",
            caption: "Monumento a la Virgen de la Paz, Trujillo",
          },
          ...propertySlides.slice(1),
        ]
      : [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1920&q=80",
            caption: "Residencia Contemporánea",
          },
          {
            url: "/images/virgen_de_la_paz_0.jpg",
            caption: "Monumento a la Virgen de la Paz, Trujillo",
          },
          {
            url: "https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1920&q=80",
            caption: "Townhouse con Jardín",
          },
        ];

  const sectionComponents: Record<string, React.ReactNode> = {
    hero: (
      <HeroSearch
        key="hero"
        slides={heroBackgroundSlides}
        availableLocations={availableLocations}
      />
    ),
    banner: (
      <CatalogBanner
        key="banner"
        totalProperties={totalPropertiesCount}
        totalAgents={totalAgentsCount}
      />
    ),
    catalog: (
      <main
        key="catalog"
        id="catalogo"
        className="relative isolate z-10 flex-1 w-full overflow-hidden bg-gradient-to-b from-[#FAF7F2] via-[#F3ECE0] to-[#EBE0D2]"
      >
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

        <div className="relative max-w-7xl 2xl:max-w-[1520px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 space-y-8">
          {/* Grilla de Propiedades de 4 en 4 con mayor profundidad */}
          {properties.length > 0 ? (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-6">
                {properties.map((property, index) => (
                  <PropertyCard
                    key={property.id}
                    eager={index === 0}
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
                      coverImageUrl: property.images[0]?.url || null,
                      imagesCount: property._count.images,
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
        </div>
      </main>
    ),
    agents: (
      <FeaturedAgentsSection
        key="agents"
        agents={featuredAgents}
        totalAgents={totalAgentsCount}
      />
    ),
    trust: <TrustSection key="trust" />,
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#f8faf8]">
      {/* Navegacion Superior */}
      <Navbar />

      {/* Hero Principal con Buscador y Fondo Dinamico */}
      <HeroSearch slides={heroBackgroundSlides} availableLocations={availableLocations} />

      {/* Franja destacada del catalogo (ancho completo) */}
      <CatalogBanner totalProperties={totalPropertiesCount} totalAgents={totalAgentsCount} />

      {/* Seccion Principal del Catalogo */}
      {sectionComponents.catalog}

      {/* Seccion Destacada de Asesores Inmobiliarios */}
      {sectionComponents.agents}

      {/* Pilares Institucionales de Confianza */}
      {sectionComponents.trust}

      {/* Pie de Pagina */}
      <Footer />

      {/* Acceso Flotante de WhatsApp Concierge */}
      <FloatingWhatsApp />
    </div>
  );
}
