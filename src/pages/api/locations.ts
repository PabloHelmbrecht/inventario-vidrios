import { type NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client/edge'

export const config = {
    runtime: 'edge',
}
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export default async function getAllGlassLocations(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        const glassLocations = await prisma.glassLocation.findMany()

        return NextResponse.json(glassLocations)
    } catch (error) {
        console.error('Error al obtener las ubicaciones de vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
