import { type NextRequest, NextResponse } from 'next/server'

import { type GlassLocation, PrismaClient } from '@prisma/client/edge'
export const config = {
    runtime: 'edge',
}

// GET /api/location
export async function GET(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))
        if (id) {
            const response = await prisma.glassLocation.findUnique({ where: { id } })

            return NextResponse.json(response)
        } else {
            const response = await prisma.glassLocation.findMany({})

            return NextResponse.json(response)
        }
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// POST /api/location
export async function POST(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const locationData = (await request.json()) as GlassLocation
        const createdLocation = await prisma.glassLocation.create({
            data: locationData,
        })

        return NextResponse.json(createdLocation)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH /api/location/:id
export async function PATCH(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))
        const locationData = (await request.json()) as GlassLocation
        const updatedLocation = prisma.glassLocation.update({
            where: {
                id: id,
            },
            data: locationData,
        })

        return NextResponse.json(updatedLocation)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// DELETE /api/location/:id
export async function DELETE(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))

        const deletedLocation = await prisma.glassLocation.delete({ where: { id } })

        return NextResponse.json(deletedLocation)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
