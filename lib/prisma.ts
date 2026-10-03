import { PrismaClient } from '../src/generated/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const connectionString = process.env.DATABASE_URL;

const globalForPrisma = global as unknown as {
    prisma?: PrismaClient;
    pool?: Pool;
    adapter?: PrismaPg;
};

const pool = globalForPrisma.pool ?? new Pool({ connectionString });
const adapter = globalForPrisma.adapter ?? new PrismaPg(pool);

export const prisma =
    globalForPrisma.prisma ||
    new PrismaClient({
        adapter,
        log: [],
    });

globalForPrisma.prisma = prisma;
globalForPrisma.pool = pool;
globalForPrisma.adapter = adapter;
