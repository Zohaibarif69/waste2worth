import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL ?? "";
const hasPlaceholderUrl = /YOUR_PASSWORD|YOUR_PROJECT_REF/.test(databaseUrl);

if ((!databaseUrl || hasPlaceholderUrl) && process.env.NODE_ENV !== "production") {
  console.warn(
    "[prisma] DATABASE_URL is not configured with real credentials. Update .env.local (or .env) and replace placeholders."
  );
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
