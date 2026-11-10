import "dotenv/config";
import { prisma } from "../src/lib/prisma";

async function main() {
  const central = await prisma.user.findUnique({
    where: { id: "central-los-andes" },
  });
  console.log("=== ASESOR CENTRAL ===", central);

  const allUsers = await prisma.user.findMany();
  console.log("=== TOTAL USUARIOS ===", allUsers.length);
  for (const u of allUsers) {
    console.log(`- [${u.role}] ID: ${u.id} | Email: ${u.email} | Name: ${u.name} | Active: ${u.isActive} | Featured: ${u.featured}`);
  }

  const properties = await prisma.property.findMany({
    select: { id: true, title: true, slug: true, agentId: true },
  });
  console.log("=== PROPIEDADES EN BD ===", properties.length);
  for (const p of properties) {
    console.log(`- ID: ${p.id} | Slug: ${p.slug} | AgentId: ${p.agentId} | Title: ${p.title}`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
