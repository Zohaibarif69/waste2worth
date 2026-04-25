import { Prisma } from "@prisma/client";

export function isDatabaseUnavailableError(error: unknown): boolean {
  if (error instanceof Prisma.PrismaClientInitializationError) {
    return true;
  }

  const message = error instanceof Error ? error.message : String(error ?? "");
  return /P1001|Can't reach database server|ECONNREFUSED|ENOTFOUND|DATABASE_URL/i.test(message);
}

export function databaseUnavailableMessage() {
  return "Database temporarily unavailable. Please check Supabase connection settings and try again.";
}
