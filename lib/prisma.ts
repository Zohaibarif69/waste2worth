import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

const databaseUrl = process.env.DATABASE_URL ?? "";
const hasPlaceholderUrl = /YOUR_PASSWORD|YOUR_PROJECT_REF/.test(databaseUrl);
const hasValidDatabaseUrl = Boolean(databaseUrl) && !hasPlaceholderUrl;

if ((!databaseUrl || hasPlaceholderUrl) && process.env.NODE_ENV !== "production") {
  console.warn(
    "[prisma] DATABASE_URL is not configured with real credentials. Update .env.local (or .env) and replace placeholders."
  );
}

function createPrismaClient() {
  if (!hasValidDatabaseUrl) {
    throw new Error(
      "DATABASE_URL is not configured with real credentials. Set a valid Postgres connection string before using database-backed features."
    );
  }

  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });
}

function getPrismaClient() {
  if (globalForPrisma.prisma) return globalForPrisma.prisma;

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = client;
  return client;
}

export const prisma = new Proxy({} as PrismaClient, {
  get(_target, prop) {
    const client = getPrismaClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === "function" ? value.bind(client) : value;
  },
}) as PrismaClient;
