import { type NextRequest, NextResponse } from 'next/server'
import { type GlassMovement } from '@prisma/client/edge'
import { prisma } from './db'
import { isValidDate } from './variableChecker'
export const config = {
    runtime: 'edge',
}

// GET /api/movement
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const glassId = Number(searchParams.get('glassId'))
        const column = searchParams.get('column')?.split(',')
        const userId = searchParams.get('userId')?.split(',')
        const oldValue = searchParams.get('oldValue')?.split(',')
        const newValue = searchParams.get('newValue')?.split(',')
        const fromDate = searchParams.get('fromDate') ? new Date(searchParams.get('fromDate') as string) : undefined
        const toDate = searchParams.get('toDate') ? new Date(searchParams.get('toDate') as string) : undefined

        if (glassId) {
            const response = await prisma.glassMovement.findMany({
                orderBy: [
                    {
                      updatedAt: 'desc',
                    },
                    
                  ],
                include: {
                    user: true,
                },
                where: {
                    glassId,
                    column: column ? { in: column } : undefined,
                    userId: userId ? { in: userId } : undefined,
                    oldValue: oldValue ? { in: oldValue } : undefined,
                    newValue: newValue ? { in: newValue } : undefined,
                    updatedAt:
                        toDate && isValidDate(toDate) && fromDate && isValidDate(fromDate)
                            ? {
                                  lte: toDate && isValidDate(toDate) ? toDate : undefined,
                                  gte: fromDate && isValidDate(fromDate) ? fromDate : undefined,
                              }
                            : undefined,
                },
            })

            return NextResponse.json(response)
        } else {
            const response = await prisma.glassMovement.findMany({
                orderBy: [
                    {
                      updatedAt: 'desc',
                    },
                    
                  ],
                include: {
                    user: true,
                },
                where: {
                    column: column ? { in: column } : undefined,
                    userId: userId ? { in: userId } : undefined,
                    oldValue: oldValue ? { in: oldValue } : undefined,
                    newValue: newValue ? { in: newValue } : undefined,
                    updatedAt:
                        toDate && isValidDate(toDate) && fromDate && isValidDate(fromDate)
                            ? {
                                  lte: toDate && isValidDate(toDate) ? toDate : undefined,
                                  gte: fromDate && isValidDate(fromDate) ? fromDate : undefined,
                              }
                            : undefined,
                },
            })


            return NextResponse.json(response)
        }
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// POST /api/movement
export async function POST(request: NextRequest) {
    try {
        const movementData = (await request.json()) as GlassMovement
        const createdMovement = await prisma.glassMovement.create({
            data: movementData,
        })

        return NextResponse.json(createdMovement)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH /api/movement/:id
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))
        const movementData = (await request.json()) as GlassMovement
        const updatedMovement = await prisma.glassMovement.update({
            where: {
                id: id,
            },
            data: movementData,
        })

        return NextResponse.json(updatedMovement)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// DELETE /api/movement/:id
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))

        const deletedMovement = await prisma.glassMovement.delete({ where: { id } })

        return NextResponse.json(deletedMovement)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
