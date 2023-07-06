import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from './db'
import { type GlassMaterial } from '@prisma/client/edge'
export const config = {
    runtime: 'edge',
}

// GET /api/materials
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))
        if (id) {
            const response = await prisma.glassMaterial.findUnique({ where: { id } })

            return NextResponse.json(response)
        } else {
            const response = await prisma.glassMaterial.findMany({})

            return NextResponse.json(response)
        }
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// POST /api/materials
export async function POST(request: NextRequest) {
    try {
        const materialData = (await request.json()) as GlassMaterial


        if(materialData.density) {
            materialData.density = Number(materialData.density)
        }

        const createdMaterial = await prisma.glassMaterial.create({
            data: materialData,
        })
        

        return NextResponse.json(createdMaterial)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH /api/materials/:id
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))
        const materialData = (await request.json()) as GlassMaterial

        if(materialData.density) {
            materialData.density = Number(materialData.density)
        }

        const updatedMaterial = await prisma.glassMaterial.update({
            where: {
                id: id,
            },
            data: materialData,
        })

        return NextResponse.json(updatedMaterial)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// DELETE /api/materials/:id
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))

        const deletedMaterial = await prisma.glassMaterial.delete({ where: { id } })

        return NextResponse.json(deletedMaterial)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
