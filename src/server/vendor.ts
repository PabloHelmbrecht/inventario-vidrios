import { type NextRequest, NextResponse } from 'next/server'
import { type GlassVendor, PrismaClient } from '@prisma/client/edge'
export const config = {
    runtime: 'edge',
}

// GET /api/vendor
export async function GET(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))
        if (id) {
            const response = await prisma.glassVendor.findUnique({ where: { id } })

            return NextResponse.json(response)
        } else {
            const response = await prisma.glassVendor.findMany({})

            return NextResponse.json(response)
        }
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// POST /api/vendor
export async function POST(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const vendorData = (await request.json()) as GlassVendor
        const createdVendor = await prisma.glassVendor.create({
            data: vendorData,
        })

        return NextResponse.json(createdVendor)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH /api/vendor/:id
export async function PATCH(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))
        const vendorData = (await request.json()) as GlassVendor
        const updatedVendor = await prisma.glassVendor.update({
            where: {
                id: id,
            },
            data: vendorData,
        })

        return NextResponse.json(updatedVendor)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// DELETE /api/vendor/:id
export async function DELETE(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))

        const deletedVendor = await prisma.glassVendor.delete({ where: { id } })

        return NextResponse.json(deletedVendor)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}