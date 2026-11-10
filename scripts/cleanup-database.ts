import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function cleanup() {
  console.log("=== INICIANDO PURGA CONTROLADA DE BASE DE DATOS ===");

  // 1. Contar registros iniciales
  const initialPropertiesCount = await prisma.property.count();
  const initialImagesCount = await prisma.propertyImage.count();
  const initialInquiriesCount = await prisma.inquiry.count();
  const initialUsersCount = await prisma.user.count();

  console.log("Registros previos detectados:", {
    properties: initialPropertiesCount,
    images: initialImagesCount,
    inquiries: initialInquiriesCount,
    users: initialUsersCount,
  });

  // 2. Eliminar imagenes de propiedades
  const deletedImages = await prisma.propertyImage.deleteMany();
  console.log(`✓ Imagenes eliminadas: ${deletedImages.count}`);

  // 3. Eliminar consultas / inquiries si existen
  const deletedInquiries = await prisma.inquiry.deleteMany();
  console.log(`✓ Inquiries eliminadas: ${deletedInquiries.count}`);

  // 4. Eliminar todas las propiedades
  const deletedProperties = await prisma.property.deleteMany();
  console.log(`✓ Propiedades eliminadas: ${deletedProperties.count}`);

  // 5. Eliminar asesores mock (conservando unicamente al ADMIN y al asesor institucional "central-los-andes")
  const deletedAgents = await prisma.user.deleteMany({
    where: {
      id: { not: "central-los-andes" },
      role: { not: "ADMIN" },
    },
  });
  console.log(`✓ Asesores mock eliminados: ${deletedAgents.count}`);

  // 6. Normalizar el asesor institucional "central-los-andes"
  await prisma.user.update({
    where: { id: "central-los-andes" },
    data: {
      displayOrder: 0,
      isActive: true,
      featured: true,
    },
  });
  console.log("✓ Asesor institucional 'central-los-andes' actualizado como principal (displayOrder: 0)");

  // 7. Verificar estado final de la base de datos
  const remainingProperties = await prisma.property.count();
  const remainingImages = await prisma.propertyImage.count();
  const remainingInquiries = await prisma.inquiry.count();
  const remainingUsers = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true, isActive: true },
  });

  console.log("\n=== ESTADO FINAL DE LA BASE DE DATOS ===");
  console.log(`Propiedades restantes: ${remainingProperties}`);
  console.log(`Imagenes restantes: ${remainingImages}`);
  console.log(`Inquiries restantes: ${remainingInquiries}`);
  console.log(`Usuarios restantes (${remainingUsers.length}):`);
  for (const u of remainingUsers) {
    console.log(` - [${u.role}] ${u.name} (${u.email}) | ID: ${u.id} | Activo: ${u.isActive}`);
  }
}

cleanup()
  .catch((err) => {
    console.error("Error durante la purga:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

