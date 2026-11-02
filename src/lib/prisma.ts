import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@/generated/prisma/client";

// Mantiene una única instancia en memoria durante el desarrollo
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  pool: Pool | undefined;
  version: number | undefined;
};

// Incrementa para forzar recreacion del cliente Prisma ante cambios en schema
const SCHEMA_VERSION = 2;

const connectionString = process.env.DATABASE_URL;

const pool = globalForPrisma.pool ?? new Pool({ connectionString });
const adapter = new PrismaPg(pool);

if (globalForPrisma.version !== SCHEMA_VERSION) {
  globalForPrisma.prisma = undefined;
  globalForPrisma.version = SCHEMA_VERSION;
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
  globalForPrisma.pool = pool;
}
