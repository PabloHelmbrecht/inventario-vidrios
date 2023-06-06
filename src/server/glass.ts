import { type NextRequest, NextResponse } from 'next/server'
/*import { authOptions } from "./auth";
import { getServerSession } from 'next-auth'*/

import { type Glass, type GlassMovement, type GlassStatus } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
export const config = {
    runtime: 'edge',
}

/*eslint-disable no-useless-escape*/

// GET /api/glass
export async function GET(req: NextRequest) {
    const prisma = new PrismaClient()

    try {
        //Optengo el id y status pasados por query params
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id')
        const status = searchParams.get('status')?.split(',') as GlassStatus[] | null

        //Si existe un id entonces devuelvo ese vidrio específico
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
        }

        //Si no existe entonces traigo todos los vidrios de la base de datos que tienen el status obtenido
        else {
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
        //Si no obtengo vidrios devuelvo error
        console.error('Error al obtener los vidrios:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        //Por último termino la conexión con prisma
        await prisma.$disconnect()
    }
}

// POST /api/glass
export async function POST(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        //Obtengo el vidrio a través de request
        const { user, glass: requestData } = (await request.json()) as {
            user?: { id?: string; email: string }
            glass: Glass
        }

        if (!user?.id) throw new Error('Se debe proveer un usuario válido')

        if (requestData.width) requestData.width = Number(requestData.width)
        if (requestData.height) requestData.height = Number(requestData.height)
        if (requestData.quantity) requestData.quantity = Number(requestData.quantity)
        requestData.status = 'STORED'

        //Busco en la base de datos si existe un vidrio con las mismas características
        let createdGlass: Glass | null = await prisma.glass.findFirst({
            where: {
                typeId: requestData.typeId ?? null,
                locationId: requestData.locationId ?? null,
                vendorId: requestData.vendorId ?? null,
                height: requestData.height ?? null,
                width: requestData.width ?? null,
            },
        })

        //Si existe entonces sumo las cantidades de vidrio y actualizo el vidrio ya existente
        if (createdGlass) {
            requestData.quantity = parseInt(String(requestData.quantity)) + parseInt(String(createdGlass.quantity))
            if (requestData.quantity <= 0) requestData.status = 'CONSUMED'
            if (!requestData.locationId) requestData.status = 'TRANSIT'

            createdGlass = await prisma.glass.update({
                where: {
                    id: parseInt(String(createdGlass.id)),
                },
                data: requestData,
            })
        }
        //Si no existe creo el vidrio nuevo
        else {
            if (requestData.quantity <= 0) requestData.status = 'CONSUMED'
            if (!requestData.locationId) requestData.status = 'TRANSIT'

            createdGlass = await prisma.glass.create({
                data: requestData,
            })
        }

        //Luego guardo los movimientos por cada vidrio creado
        const glassMovements = Object.entries(requestData).map(([column, newValue]) => {
            return {
                glassId: parseInt(String(createdGlass?.id)),
                column,
                oldValue: null,
                newValue: String(newValue),
                userId: user?.id,
            }
        })

        await prisma.glassMovement.createMany({
            data: glassMovements,
        })

        // Por último devuelvo el vidrio actualizado
        return NextResponse.json(createdGlass)
    } catch (error) {
        //En caso de errores devuelvo 500
        console.error('Error al crear el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        //Termino la conexión con prisma
        await prisma.$disconnect()
    }
}

// PATCH /api/glass/:id
export async function PATCH(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        //Obtengo el vidrio de la petición y el id de los query params
        const { user, glass: glassUpdates } = (await request.json()) as {
            user?: { id?: string; email: string }
            glass: Glass
        }
        const { searchParams } = new URL(request.url)

        if (!user?.id) throw new Error('Se debe proveer un usuario válido')

        const id = Number(searchParams.get('id'))

        if (!id || isNaN(id)) throw new Error('Se debe proveer un id válido')

        if (glassUpdates.quantity === null || glassUpdates === undefined)
            throw new Error('Se debe proveer las cantidades del vidrio a modificar')

        if (glassUpdates.width) glassUpdates.width = Number(glassUpdates.width)
        if (glassUpdates.height) glassUpdates.height = Number(glassUpdates.height)
        if (glassUpdates.quantity) glassUpdates.quantity = Number(glassUpdates.quantity)
        if (!glassUpdates.status) glassUpdates.status = 'STORED'

        let originalGlass: (Glass & { [key: string]: string | number | null | Date }) | null =
            await prisma.glass.findFirst({
                where: {
                    id: {
                        not: id,
                    },
                    typeId: glassUpdates.typeId ?? null,
                    locationId: glassUpdates.locationId ?? null,
                    vendorId: glassUpdates.vendorId ?? null,
                    height: glassUpdates.height ?? null,
                    width: glassUpdates.width ?? null,
                },
            })

        let updatedGlass: Glass | null = null

        //Si existe un vidrio similar entonces sumo las cantidades, calculo el nuevo estado y actualizo los datos de este y borro el vidrio anterior
        if (originalGlass) {
            glassUpdates.quantity = glassUpdates.quantity + originalGlass.quantity
            if (glassUpdates.quantity <= 0) glassUpdates.status = 'CONSUMED'
            if (!glassUpdates.locationId) glassUpdates.status = 'TRANSIT'

            updatedGlass = await prisma.glass.update({
                where: {
                    id: originalGlass.id,
                },
                data: glassUpdates,
            })

            await prisma.glassMovement.deleteMany({
                where: {
                    glassId: id,
                },
            })

            await prisma.glass.delete({
                where: {
                    id,
                },
            })
        }

        //Si no existe entonces actualizo el vidrio existente
        else {
            if (glassUpdates.quantity <= 0) glassUpdates.status = 'CONSUMED'
            if (!glassUpdates.locationId) glassUpdates.status = 'TRANSIT'
            originalGlass = await prisma.glass.findUnique({
                where: {
                    id,
                },
            })

            updatedGlass = await prisma.glass.update({
                where: {
                    id,
                },
                data: glassUpdates,
            })
        }

        //Creo los movimientos de vidrio
        const glassMovements = Object.entries(updatedGlass).reduce((movements: GlassMovement[], [column, newValue]) => {
            const oldValue = originalGlass ? (originalGlass[column] as string) : null
            if (oldValue !== newValue) {
                movements.push({
                    glassId: originalGlass?.id,
                    column,
                    oldValue: String(oldValue),
                    newValue: String(newValue),
                    userId: user?.id,
                } as GlassMovement)
            }

            return movements
        }, [])
        await prisma.glassMovement.createMany({
            data: glassMovements,
        })

        //Devuelvo el vidrio actualizado
        return NextResponse.json(originalGlass)
    } catch (error) {
        //Si obtengo un error devuelvo el estado 500
        console.error('Error al actualizar el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        //por último cierro la conexión con prisma
        await prisma.$disconnect()
    }
}

// DELETE /api/glass/:id
export async function DELETE(request: NextRequest) {
    const prisma = new PrismaClient()

    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        await prisma.glassMovement.deleteMany({
            where: {
                glassId: parseInt(String(id)),
            },
        })

        const deletedGlass = await prisma.glass.delete({
            where: {
                id: parseInt(String(id)),
            },
            include: {
                GlassMovement: true,
            },
        })

        return NextResponse.json(deletedGlass)
    } catch (error) {
        console.error('Error al eliminar el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
