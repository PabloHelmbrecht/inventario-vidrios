import { PrismaClient } from '@prisma/client/edge'

import { env } from '~/env.mjs'
/* eslint-disable-next-line */
const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
export const prisma =
    globalForPrisma.prisma ??
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    new PrismaClient({ log: env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'] })

if (env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
