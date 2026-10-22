import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

/**
 * Checks whether a valid Supabase DATABASE_URL is configured
 */
export function isDatabaseConfigured(): boolean {
  const url = process.env.DATABASE_URL;
  if (!url || typeof url !== "string") return false;
  const trimmed = url.trim();
  return (
    trimmed.length > 0 &&
    !trimmed.includes("[YOUR-") &&
    !trimmed.includes("YOUR-PROJECT-REF") &&
    (trimmed.startsWith("postgres://") || trimmed.startsWith("postgresql://"))
  );
}

function getPrismaInstance(): PrismaClient | null {
  if (!isDatabaseConfigured()) {
    return null;
  }

  try {
    if (!globalForPrisma.prisma) {
      globalForPrisma.prisma = new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
      });
    }
    return globalForPrisma.prisma;
  } catch (err) {
    console.warn("[Prisma] Client initialization deferred - check DATABASE_URL:", err);
    return null;
  }
}

export const prisma = getPrismaInstance();

export default prisma;
