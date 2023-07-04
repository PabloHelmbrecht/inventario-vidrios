/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from './db'

import { z } from 'zod'

import { type Glass, type GlassMovement, type GlassStatus } from '@prisma/client'

//Env variables
import { env } from '~/env.mjs'

export const config = {
    runtime: 'edge',
}

const prismaX = prisma
    .$extends({
        name: `squareMetersComputed`,
        result: {
            glass: {
                squaredMeters: {
                    needs: { height: true, width: true, quantity: true },
                    compute(data: { height: number; width: number; quantity: number }) {
                        return (data.height * data.width * data.quantity) / 1000000
                    },
                },
            },
        },
    })
    .$extends({
        name: `typeComputed`,
        result: {
            glass: {
                type: {
                    needs: { height: true, width: true },
                    compute(data: { height: number; width: number }) {
                        return (data.height * data.width) / 1000000 >= env.SQUARED_METERS_LIMIT ? 'Jumbo' : 'Small'
                    },
                },
            },
        },
    })

// GET /api/glasses
export async function GET(req: NextRequest) {
    try {
        //Optengo el id y status pasados por query params
        const { searchParams } = new URL(req.url)
        const id = searchParams.get('id') ?? searchParams.get('nextParamid')
        const status = searchParams.get('status')?.split(',') as GlassStatus[] | null

        const glassSchema = z.object({
            squaredMeters: z.number(),
            material: z.object({
                density: z.number(),
            }),
        })

        //Si existe un id entonces devuelvo ese vidrio específico
        if (id) {
            const response = await prismaX.glass.findUnique({
                include: {
                    material: true,
                    vendor: true,
                    location: true,
                },
                where: {
                    id: parseInt(id),
                },
            })

            try {
                const responseParsed = glassSchema.parse(response)

                return NextResponse.json({
                    ...response,
                    weight: responseParsed.squaredMeters * responseParsed.material.density,
                })
            } catch (e) {
                return NextResponse.json({ ...response, weight: null })
            }
        }

        //Si no existe entonces traigo todos los vidrios de la base de datos que tienen el status obtenido
        else {
            const response = (
                await prismaX.glass.findMany({
                    orderBy: [
                        {
                            updatedAt: 'desc',
                        },
                    ],
                    include: {
                        material: true,
                        vendor: true,
                        location: true,
                    },
                    where: {
                        status: status != null ? { in: status } : undefined,
                    },
                })
            ).map((glass) => {
                try {
                    const glassParsed = glassSchema.parse(glass)

                    return { ...glass, weight: glassParsed.squaredMeters * glassParsed.material.density }
                } catch (e) {
                    return { ...glass, weight: null }
                }
            })

            return NextResponse.json(response)
        }
    } catch (error) {
        //Si no obtengo vidrios devuelvo error
        console.error('Error al obtener los vidrios:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        //Por último termino la conexión con prisma
        await prismaX.$disconnect()
    }
}

// POST /api/glasses
export async function POST(request: NextRequest) {
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

        const createdGlass = await prismaX.$transaction(async (tx) => {
            //Busco en la base de datos si existe un vidrio con las mismas características
            let createdGlass: Glass | null = await tx.glass.findFirst({
                where: {
                    materialId: requestData.materialId ?? null,
                    locationId: requestData.locationId ?? null,
                    vendorId: requestData.vendorId ?? null,
                    height: requestData.height ?? null,
                    width: requestData.width ?? null,
                    batch: requestData.batch ?? null,
                },
            })

            //Si existe entonces sumo las cantidades de vidrio y actualizo el vidrio ya existente
            if (createdGlass) {
                requestData.quantity = parseInt(String(requestData.quantity)) + parseInt(String(createdGlass.quantity))
                if (requestData.quantity <= 0) requestData.status = 'CONSUMED'
                if (!requestData.locationId) requestData.status = 'TRANSIT'

                createdGlass = await tx.glass.update({
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

                createdGlass = await tx.glass.create({
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

            await tx.glassMovement.createMany({
                data: glassMovements,
            })

            return createdGlass
        })

        // Por último devuelvo el vidrio actualizado
        return NextResponse.json(createdGlass)
    } catch (error) {
        //En caso de errores devuelvo 500
        console.error('Error al crear el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        //Termino la conexión con prisma
        await prismaX.$disconnect()
    }
}

// PATCH /api/glasses/:id
export async function PATCH(request: NextRequest) {
    try {
        //Obtengo el vidrio de la petición y el id de los query params
        const { user, glass: glassUpdates } = (await request.json()) as {
            user?: { id?: string; email: string }
            glass: Glass
        }
        const { searchParams } = new URL(request.url)

        if (!user?.id) throw new Error('Se debe proveer un usuario válido')

        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))

        if (!id || isNaN(id)) throw new Error('Se debe proveer un id válido')

        if (glassUpdates.quantity === null || glassUpdates === undefined)
            throw new Error('Se debe proveer las cantidades del vidrio a modificar')

        if (glassUpdates.width) glassUpdates.width = Number(glassUpdates.width)
        if (glassUpdates.height) glassUpdates.height = Number(glassUpdates.height)
        if (glassUpdates.quantity) glassUpdates.quantity = Number(glassUpdates.quantity)
        if (!glassUpdates.status) glassUpdates.status = 'STORED'

        const originalGlass = await prismaX.$transaction(async (tx) => {
            let originalGlass: (Glass & { [key: string]: string | number | null | Date }) | null =
                await tx.glass.findFirst({
                    where: {
                        id: {
                            not: id,
                        },
                        materialId: glassUpdates.materialId ?? null,
                        locationId: glassUpdates.locationId ?? null,
                        vendorId: glassUpdates.vendorId ?? null,
                        height: glassUpdates.height ?? null,
                        width: glassUpdates.width ?? null,
                        batch: glassUpdates.batch ?? null,
                    },
                })

            let updatedGlass: Glass | null = null

            //Si existe un vidrio similar entonces sumo las cantidades, calculo el nuevo estado y actualizo los datos de este y borro el vidrio anterior
            if (originalGlass) {
                glassUpdates.quantity = glassUpdates.quantity + originalGlass.quantity
                if (glassUpdates.quantity <= 0) glassUpdates.status = 'CONSUMED'
                if (!glassUpdates.locationId) glassUpdates.status = 'TRANSIT'
                if (!glassUpdates.batch) glassUpdates.batch = null
                if (!glassUpdates.expirationDate) glassUpdates.expirationDate = null

                updatedGlass = await tx.glass.update({
                    where: {
                        id: originalGlass.id,
                    },
                    data: glassUpdates,
                })

                await tx.glassMovement.deleteMany({
                    where: {
                        glassId: id,
                    },
                })

                await tx.glass.delete({
                    where: {
                        id,
                    },
                })
            }

            //Si no existe entonces actualizo el vidrio existente
            else {
                if (glassUpdates.quantity <= 0) glassUpdates.status = 'CONSUMED'
                if (!glassUpdates.locationId) glassUpdates.status = 'TRANSIT'
                if (!glassUpdates.batch) glassUpdates.batch = null
                if (!glassUpdates.expirationDate) glassUpdates.expirationDate = null
                originalGlass = await tx.glass.findUnique({
                    where: {
                        id,
                    },
                })

                updatedGlass = await tx.glass.update({
                    where: {
                        id,
                    },
                    data: glassUpdates,
                })
            }

            //Creo los movimientos de vidrio
            const glassMovements = Object.entries(updatedGlass).reduce(
                (movements: GlassMovement[], [column, newValue]) => {
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
                },
                [],
            )
            await tx.glassMovement.createMany({
                data: glassMovements,
            })

            return originalGlass
        })

        //Devuelvo el vidrio actualizado
        return NextResponse.json(originalGlass)
    } catch (error) {
        //Si obtengo un error devuelvo el estado 500
        console.error('Error al actualizar el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        //por último cierro la conexión con prisma
        await prismaX.$disconnect()
    }
}

// DELETE /api/glasses/:id
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id') ?? searchParams.get('nextParamid')

        const deletedGlass = await prismaX.$transaction(async (tx) => {
            await tx.glassMovement.deleteMany({
                where: {
                    glassId: parseInt(String(id)),
                },
            })

            return await tx.glass.delete({
                where: {
                    id: parseInt(String(id)),
                },
                include: {
                    GlassMovement: true,
                },
            })
        })

        return NextResponse.json(deletedGlass)
    } catch (error) {
        console.error('Error al eliminar el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prismaX.$disconnect()
    }
}
