import { prisma } from "@/lib/prisma";
import { Navbar } from "@/components/public/Navbar";
import { Footer } from "@/components/public/Footer";
import { HeroSearch } from "@/components/public/HeroSearch";
import { PropertyCard, type PropertyCardData } from "@/components/public/PropertyCard";
import { Sparkles, FilterX } from "lucide-react";
import Link from "next/link";
import type { Prisma, OperationType, PropertyType } from "@/generated/prisma/client";

export const dynamic = "force-dynamic";

interface PageProps {
  searchParams: Promise<{
    operacion?: string;
    tipo?: string;
    q?: string;
  }>;
}

// Pagina principal y catalogo publico de propiedades
export default async function HomePage({ searchParams }: PageProps) {
  const params = await searchParams;
  const operation = params.operacion;
  const propertyType = params.tipo;
  const query = params.q;

  // Filtros dinamicos basados en parametros de consulta
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

  // Consulta a la base de datos
  const properties = await prisma.property.findMany({
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
    orderBy: [{ featured: "desc" }, { createdAt: "desc" }],
  });

  return (
    <div className="min-h-screen flex flex-col bg-ui-background">
      <Navbar />

      <HeroSearch />

      <main id="catalogo" className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-12">
        {/* Cabecera del catalogo */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-neutral-200/80 pb-6">
          <div>
            <div className="flex items-center gap-2 text-brand-accent text-xs font-bold uppercase tracking-wider mb-1">
              <Sparkles className="w-4 h-4" />
              <span>Inmuebles Verificados</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-brand-primary tracking-tight">
              Catálogo de Propiedades Disponibles
            </h2>
          </div>
          <div className="text-sm text-text-secondary font-medium">
            Mostrando <span className="font-bold text-text-primary">{properties.length}</span> inmuebles
          </div>
        </div>

        {/* Grilla de propiedades */}
        {properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {properties.map((property) => (
              <PropertyCard
                key={property.id}
                property={{
                  id: property.id,
                  title: property.title,
                  slug: property.slug,
                  operationType: property.operationType as "SALE" | "RENT",
                  propertyType: property.propertyType,
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
                }}
              />
            ))}
          </div>
        ) : (
          <div className="bg-ui-surface p-12 rounded-3xl border border-neutral-200 text-center max-w-md mx-auto space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-neutral-100 flex items-center justify-center text-text-secondary">
              <FilterX className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-bold text-text-primary">No se encontraron inmuebles</h3>
            <p className="text-sm text-text-secondary leading-relaxed">
              No hay propiedades que coincidan con los filtros aplicados. Intenta restablecer los filtros de búsqueda.
            </p>
            <div className="pt-2">
              <Link
                href="/#catalogo"
                className="inline-flex items-center justify-center px-5 py-2.5 bg-brand-primary text-white text-xs font-bold rounded-xl hover:bg-opacity-90 transition-all shadow-sm"
              >
                Ver todos los inmuebles
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
