import ws from "ws";
import { neonConfig } from "@neondatabase/serverless";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "@/generated/prisma/client";

// Configura WebSocket para conexion sobre puerto 443 compatible con redes y suspensiones serverless
neonConfig.webSocketConstructor = ws;

// Mantiene una única instancia en memoria durante el desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  version: number | undefined;
};

// Incrementa para forzar recreacion del cliente Prisma ante cambios en schema
const SCHEMA_VERSION = 3;

const connectionString = process.env.DATABASE_URL;

if (globalForPrisma.version !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined;
  globalForPrisma.version = SCHEMA_VERSION;
}

const adapter = new PrismaNeon({ connectionString });

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
