import { PrismaClient } from "@/generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import path from "node:path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function getDatabaseUrl(): string {
  const envUrl = process.env.DATABASE_URL || "file:./prisma/dev.db";
  if (envUrl.startsWith("file:")) {
    const rawPath = envUrl.replace(/^file:/, "");
    const absolutePath = path.isAbsolute(rawPath) ? rawPath : path.resolve(process.cwd(), rawPath);
    return `file:${absolutePath}`;
  }
  return envUrl;
}

function createPrismaClient() {
  const adapter = new PrismaLibSql({ url: getDatabaseUrl() });
  return new PrismaClient({ adapter });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
