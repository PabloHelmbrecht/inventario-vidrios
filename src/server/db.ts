import { PrismaClient } from '@prisma/client'

import { env } from '~/env.mjs'
/* eslint-disable-next-line */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log: env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
        //datasources: { db: { url: process.env.DATABASE_URL_PLANETSCALE}}
    })

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
