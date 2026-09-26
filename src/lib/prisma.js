import { PrismaClient } from '@prisma/client';

// Evita que se abran múltiples conexiones a la BD en modo de desarrollo con Next.js
const globalForPrisma = global;

export const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    log: ['query'],
  });

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
