import { PrismaClient } from '@prisma/client';

/** Single shared Prisma client instance (see docs/backend-standards.md). */
export const prisma = new PrismaClient();
