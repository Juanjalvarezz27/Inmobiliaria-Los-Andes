import "dotenv/config";
import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

async function main() {
  console.log("Iniciando sembrado de datos (seed)...");

  // Limpieza previa opcional para garantizar idempotencia
  await prisma.inquiry.deleteMany();
  await prisma.propertyImage.deleteMany();
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash("Admin123*LosAndes", 10);

  // 1. Crear Administrador
  const admin = await prisma.user.create({
    data: {
      email: "admin@inmobiliarialosandes.com",
      name: "Administrador",
      passwordHash,
      role: "ADMIN",
      position: "Director de Operaciones",
      phone: "+584147000000",
      avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
      isActive: true,
    },
  });

  // 2. Crear Asesores Inmobiliarios
  const agent1 = await prisma.user.create({
    data: {
      email: "carlos.mendoza@inmobiliarialosandes.com",
      name: "Carlos Mendoza",
      passwordHash,
      role: "AGENT",
      position: "Asesor Inmobiliario Senior",
      phone: "+584125550101",
      instagram: "carlos.losandes",
      avatarUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
      isActive: true,
    },
  });

  const agent2 = await prisma.user.create({
    data: {
      email: "mariana.briceno@inmobiliarialosandes.com",
      name: "Mariana Briceño",
      passwordHash,
      role: "AGENT",
      position: "Especialista en Inversiones Inmobiliarias",
      phone: "+584245550202",
      instagram: "mariana.inmobiliaria",
      avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
      isActive: true,
    },
  });

  // 3. Crear Propiedades Realistas en Trujillo
  await prisma.property.create({
    data: {
      title: "Hermoso y moderno Townhouse en Urb. Vista Real",
      slug: "hermoso-y-moderno-townhouse-en-urb-vista-real",
      description:
        "Exclusivo townhouse de arquitectura contemporánea con amplios ventanales y finos acabados. Cuenta con espaciosa sala principal, comedor independiente, cocina empotrada equipada con tope de granito, área social techada con parrillera y family room en la planta alta. Ubicado en una de las zonas de mayor revalorización y seguridad de Trujillo.",
      operationType: "SALE",
      propertyType: "TOWNHOUSE",
      status: "AVAILABLE",
      price: 72000,
      currency: "USD",
      featured: true,
      bedrooms: 5,
      bathrooms: 4,
      parkingSpots: 2,
      areaSquareMeters: 280,
      lotSquareMeters: 200,
      yearBuilt: 2021,
      city: "Trujillo Capital",
      sector: "Urb. Vista Real, sector La Raya",
      address: "Avenida Principal de Vista Real, Manzana B, Casa 14",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Urb+Vista+Real,+Trujillo,+Venezuela",
      amenities: [
        "Tanque de agua subterráneo 10.000L",
        "Termo calentador",
        "Aires acondicionados",
        "Urbanización privada con portón eléctrico",
        "Vigilancia 24/7",
        "Zona tranquila",
        "Cocina empotrada con granito",
      ],
      agentId: agent1.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1200&q=80",
            caption: "Fachada frontal moderna",
            isMain: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=80",
            caption: "Amplia sala de estar y comedor",
            isMain: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1600566752355-35792bedcfea?auto=format&fit=crop&w=1200&q=80",
            caption: "Cocina con isla y tope de granito",
            isMain: false,
            order: 2,
          },
          {
            url: "https://images.unsplash.com/photo-1600585154526-990dced4db0d?auto=format&fit=crop&w=1200&q=80",
            caption: "Habitación principal con baño en suite",
            isMain: false,
            order: 3,
          },
        ],
      },
    },
  });

  await prisma.property.create({
    data: {
      title: "Apartamento de Lujo en Residencias El Country",
      slug: "apartamento-de-lujo-en-residencias-el-country",
      description:
        "Impecable apartamento en piso alto con espectacular vista panorámica a las montañas de Trujillo. Distribución funcional con excelente ventilación e iluminación natural. Pisos de porcelanato español, habitaciones con closets de madera y línea blanca completa incluida.",
      operationType: "SALE",
      propertyType: "APARTMENT",
      status: "AVAILABLE",
      price: 48000,
      currency: "USD",
      featured: true,
      bedrooms: 3,
      bathrooms: 2,
      parkingSpots: 1,
      areaSquareMeters: 115,
      yearBuilt: 2018,
      city: "Trujillo Capital",
      sector: "Sector El Country",
      address: "Calle Los Pinos, Torre B, Piso 5, Apto 5-A",
      amenities: [
        "Planta eléctrica para áreas comunes",
        "Ascensor operativo",
        "Tanque de agua con bomba hidroneumática",
        "Balcón con vista panorámica",
        "Pisos de porcelanato",
        "Gas directo",
      ],
      agentId: agent2.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?auto=format&fit=crop&w=1200&q=80",
            caption: "Vista exterior de la torre residencial",
            isMain: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&w=1200&q=80",
            caption: "Sala integrada con balcón",
            isMain: false,
            order: 1,
          },
          {
            url: "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&w=1200&q=80",
            caption: "Cocina moderna concepto abierto",
            isMain: false,
            order: 2,
          },
        ],
      },
    },
  });

  await prisma.property.create({
    data: {
      title: "Casa Colonial Restaurada en Sector Centro Chiquinquirá",
      slug: "casa-colonial-restaurada-en-sector-centro-chiquinquira",
      description:
        "Propiedad histórica de alto valor patrimonial totalmente remodelada en sus instalaciones eléctricas y de tuberías. Conserva techos altos de madera de teca curada, patio central empedrado con fuente y amplios corredores coloniales. Ideal para residencia familiar o sede corporativa/comercial.",
      operationType: "SALE",
      propertyType: "HOUSE",
      status: "AVAILABLE",
      price: 65000,
      currency: "USD",
      featured: true,
      bedrooms: 4,
      bathrooms: 3,
      parkingSpots: 2,
      areaSquareMeters: 320,
      lotSquareMeters: 350,
      yearBuilt: 1965,
      city: "Trujillo Capital",
      sector: "Sector Centro Chiquinquirá",
      address: "Av. Independencia, a pocos metros de la Plaza Chiquinquirá",
      amenities: [
        "Patio central con jardín y fuente",
        "Techos de madera de teca curada",
        "Tanque de agua aéreo y subterráneo",
        "Ubicación céntrica privilegiada",
        "Línea telefónica e internet",
      ],
      agentId: agent1.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=1200&q=80",
            caption: "Fachada colonial restaurada",
            isMain: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=80",
            caption: "Corredor interno y patio central",
            isMain: false,
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.property.create({
    data: {
      title: "Local Comercial Estratégico en Avenida Independencia",
      slug: "local-comercial-estrategico-en-avenida-independencia",
      description:
        "Gran local comercial a pie de calle con alto tráfico peatonal y vehicular en pleno corazón comercial de Trujillo. Posee santamarías motorizadas, vitrina de exhibición en vidrio templado, dos baños, área de depósito y preinstalación de cableado para puntos de venta y cámaras de seguridad.",
      operationType: "RENT",
      propertyType: "COMMERCIAL",
      status: "AVAILABLE",
      price: 650,
      currency: "USD",
      featured: true,
      bedrooms: 0,
      bathrooms: 2,
      parkingSpots: 3,
      areaSquareMeters: 180,
      yearBuilt: 2015,
      city: "Trujillo Capital",
      sector: "Sector Centro",
      address: "Avenida Independencia, Local 6-22",
      amenities: [
        "Santamarías eléctricas motorizadas",
        "Conexión de fibra óptica",
        "Pisos de alto tráfico",
        "Área de depósito independiente",
        "Tanque de agua propio",
      ],
      agentId: agent2.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=80",
            caption: "Entrada principal y área de exhibición",
            isMain: true,
            order: 0,
          },
          {
            url: "https://images.unsplash.com/photo-1497366811353-6870744d04b2?auto=format&fit=crop&w=1200&q=80",
            caption: "Área interna diáfana",
            isMain: false,
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.property.create({
    data: {
      title: "Townhouse en Alquiler en Residencias Don Carmelo",
      slug: "townhouse-en-alquiler-en-residencias-don-carmelo",
      description:
        "Cómodo townhouse semi-amoblado dentro de conjunto cerrado. Cuenta con cocina equipada, tanque de agua, patio trasero privado y dos puestos de estacionamiento techados. Excelente ambiente familiar.",
      operationType: "RENT",
      propertyType: "TOWNHOUSE",
      status: "RENTED",
      price: 450,
      currency: "USD",
      featured: false,
      bedrooms: 3,
      bathrooms: 3,
      parkingSpots: 2,
      areaSquareMeters: 160,
      yearBuilt: 2019,
      city: "Trujillo Capital",
      sector: "Sector La Vega",
      address: "Urb. Don Carmelo, Casa 8",
      googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=Sector+La+Vega,+Trujillo,+Venezuela",
      amenities: [
        "Semi-amoblado",
        "Tanque de agua con bomba",
        "Portón eléctrico con control remoto",
        "Área parrillera",
      ],
      agentId: agent1.id,
      images: {
        create: [
          {
            url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?auto=format&fit=crop&w=1200&q=80",
            caption: "Vista de fachada residencial",
            isMain: true,
            order: 0,
          },
        ],
      },
    },
  });

  console.log("¡Sembrado de datos finalizado con éxito!");
  console.log(`Usuario Admin creado: ${admin.email} (Contraseña: Admin123*LosAndes)`);
}

main()
  .catch((e) => {
    console.error("Error durante el sembrado:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
