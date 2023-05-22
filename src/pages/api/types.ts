import { type NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client/edge'

export const config = {
    runtime: 'edge',
}
// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export default async function getAllGlassTypes(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        const glassTypes = await prisma.glassType.findMany()

        return NextResponse.json(glassTypes)
    } catch (error) {
        console.error('Error al obtener los tipos de vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
