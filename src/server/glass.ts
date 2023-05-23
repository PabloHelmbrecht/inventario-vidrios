import { type NextRequest, NextResponse } from 'next/server'
/*import { authOptions } from "./auth";
import { getServerSession } from 'next-auth'*/

import { type Glass, type GlassMovement, type GlassStatus } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
export const config = {
    runtime: 'edge',
}

interface ModifiedGlass extends Glass {
    [key: string]: number | string | Date | null | GlassStatus
}

// GET /api/glass
export async function getGlass(req: NextRequest) {
    const prisma = new PrismaClient()

    try {
        //Query Params
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const status = searchParams.get('status')?.split(',') as GlassStatus[] | null

        if (id) {
            const response = await prisma.glass.findUnique({
                include: {
                    type: true,
                    vendor: true,
                    location: true,
                },
                where: {
                    id: parseInt(id),
                },
            })

            return NextResponse.json(response)
        } else {
            const response = await prisma.glass.findMany({
                include: {
                    type: true,
                    vendor: true,
                    location: true,
                },
                where: {
                    status: status != null ? { in: status } : undefined,
                },
            })

            return NextResponse.json(response)
        }
    } catch (error) {
        console.error('Error al obtener los vidrios:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// POST /api/glass
export async function createGlass(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const glass = (await request.json()) as Glass
        if(glass.width) glass.width = Number(glass.width)
        if(glass.height)glass.height = Number(glass.height)
        if(glass.quantity)glass.quantity = Number(glass.quantity)
        glass.status = 'STORED'

        if (glass.quantity <= 0) glass.status = 'CONSUMED'
        if (!glass.locationId) glass.status = 'TRANSIT'

        const createdGlass: Glass = await prisma.glass.create({
            data: glass,
        })

        const glassMovements = Object.entries(glass).map(([column, newValue]) => {
            return {
                glassId: createdGlass.id,
                column,
                oldValue: null,
                newValue: String(newValue),
                userId: 'cli0a7a3v0000qk0ghwh6yxki',
            }
        })

        await prisma.glassMovement.createMany({
            data: glassMovements,
        })

        return NextResponse.json(glassMovements)
    } catch (error) {
        console.error('Error al crear el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH /api/glass/:id
export async function updateGlass(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const glass = (await request.json()) as Glass
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))
        if(glass.width) glass.width = Number(glass.width)
        if(glass.height)glass.height = Number(glass.height)
        if(glass.quantity)glass.quantity = Number(glass.quantity)

        glass.status = 'STORED'
        if (glass.quantity <= 0) glass.status = 'CONSUMED'
        if (!glass.locationId) glass.status = 'TRANSIT'

        const existingGlass: ModifiedGlass | null = await prisma.glass.findUnique({
            where: {
                id,
            },
        })

        if (!existingGlass) {
            return NextResponse.json({ error: 'Vidrio no encontrado' }, { status: 404 })
        }

        const updatedGlass = await prisma.glass.update({
            where: {
                id: id,
            },
            data: glass,
        })

        const glassMovements = Object.entries(glass).reduce((movements: GlassMovement[], [column, newValue]) => {
            const oldValue = existingGlass[column] as string

            if (oldValue !== newValue) {
                movements.push({
                    glassId: updatedGlass.id,
                    column,
                    oldValue: String(oldValue),
                    newValue: String(newValue),
                    userId: 'cli0a7a3v0000qk0ghwh6yxki',
                } as GlassMovement)
            }

            return movements
        }, [])

        await prisma.glassMovement.createMany({
            data: glassMovements,
        })

        return NextResponse.json(updatedGlass)
    } catch (error) {
        console.error('Error al actualizar el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// DELETE /api/glass/:id
export async function deleteGlass(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))

        await prisma.glassMovement.deleteMany({
            where: {
                glassId: id,
            },
        })

        const deletedGlass = await prisma.glass.delete({
            where: {
                id,
            },
            include: {
                GlassMovement: true,
            },
        })

        return NextResponse.json(deletedGlass)
    } catch (error) {
        console.error('Error al eliminar el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    }
}
