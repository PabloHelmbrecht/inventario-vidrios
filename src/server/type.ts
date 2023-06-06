import { type NextRequest, NextResponse } from 'next/server'

import { type GlassType, PrismaClient } from '@prisma/client/edge'
export const config = {
    runtime: 'edge',
}

// GET /api/type
export async function GET(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id')??searchParams.get('nextParamid'))
        if (id) {
            const response = await prisma.glassType.findUnique({ where: { id } })

            return NextResponse.json(response)
        } else {
            const response = await prisma.glassType.findMany({})

            return NextResponse.json(response)
        }
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// POST /api/type
export async function POST(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const typeData = (await request.json()) as GlassType
        const createdType = await prisma.glassType.create({
            data: typeData,
        })

        return NextResponse.json(createdType)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH /api/type/:id
export async function PATCH(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id')??searchParams.get('nextParamid'))
        const typeData = (await request.json()) as GlassType
        const updatedType = await prisma.glassType.update({
            where: {
                id: id,
            },
            data: typeData,
        })

        console.log({ updatedType })

        return NextResponse.json(updatedType)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// DELETE /api/type/:id
export async function DELETE(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id')??searchParams.get('nextParamid'))

        const deletedType = await prisma.glassType.delete({ where: { id } })

        return NextResponse.json(deletedType)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
