import { type NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client/edge'

export const config = {
    runtime: 'edge',
}
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export default async function getAllGlass(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        const vidrios = await prisma.glass.findMany({
            include: {
                type: true,
                vendor: true,
                location: true,
            },
        })

        return NextResponse.json(vidrios)
    } catch (error) {
        console.error('Error al obtener los vidrios:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
