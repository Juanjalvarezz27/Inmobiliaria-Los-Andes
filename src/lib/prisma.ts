import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Configura WebSocket para conexion sobre puerto 443 compatible con redes y suspensiones serverless
neonConfig.webSocketConstructor = ws;

// Mantiene una única instancia en memoria durante el desarrollo y lambdas serverless cálidas
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  version: number | undefined;
};

// Incrementa para forzar recreacion del cliente Prisma ante cambios en schema
const SCHEMA_VERSION = 4;

function getPrismaClient(): PrismaClient {
  const connectionString = process.env.DATABASE_URL;
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
}

if (!globalForPrisma.prisma || globalForPrisma.version !== SCHEMA_VERSION) {
  globalForPrisma.prisma = getPrismaClient();
  globalForPrisma.version = SCHEMA_VERSION;
}

export const prisma = globalForPrisma.prisma;
