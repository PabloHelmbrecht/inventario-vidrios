import { type NextRequest, NextResponse } from 'next/server'
/*import { authOptions } from "./auth";
import { getServerSession } from 'next-auth'*/

import { type Glass, type GlassMovement, type GlassStatus } from '@prisma/client'
import { PrismaClient } from '@prisma/client/edge'
export const config = {
    runtime: 'edge',
}



// GET /api/glass
export async function getGlass(req: NextRequest) {
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
    }
    //Si no obtengo vidrios devuelvo error
    catch (error) {
        console.error('Error al obtener los vidrios:', error)

        return NextResponse.json(null, { status: 500 })
    }

    //Por último termino la conexión con prisma
    finally {
        await prisma.$disconnect()
    }
}

// POST /api/glass
export async function createGlass(request: NextRequest) {

    const prisma = new PrismaClient()

    try {
        //Obtengo el vidrio a través de request
        const requestData = (await request.json()) as Glass

        //Formateo los valores como número
        if (requestData.width) requestData.width = Number(requestData.width)
        if (requestData.height) requestData.height = Number(requestData.height)
        if (requestData.quantity) requestData.quantity = Number(requestData.quantity)
        requestData.status = 'STORED'


        //Busco en la base de datos si existe un vidrio con las mismas características
        let createdGlass: Glass | null = await prisma.glass.findFirst({
            where: {
                typeId: requestData.typeId ?? undefined,
                locationId: requestData.locationId ?? undefined,
                vendorId: requestData.vendorId ?? undefined,
                height: requestData.height ?? undefined,
                width: requestData.width ?? undefined
            }
        })


        //Si existe entonces sumo las cantidades de vidrio y actualizo el vidrio ya existente
        if (createdGlass) {

            requestData.quantity = Number(requestData.quantity) + Number(createdGlass.quantity)
            if (requestData.quantity <= 0) requestData.status = 'CONSUMED'
            if (!requestData.locationId) requestData.status = 'TRANSIT'


            createdGlass = await prisma.glass.update({
                where: {
                    id: createdGlass.id,
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
                glassId: Number(createdGlass?.id),
                column,
                oldValue: null,
                newValue: String(newValue),
                userId: 'cli0a7a3v0000qk0ghwh6yxki',
            }
        })
        await prisma.glassMovement.createMany({
            data: glassMovements,
        })


        // Por último devuelvo el vidrio actualizado
        return NextResponse.json(createdGlass)
    }

    //En caso de errores devuelvo 500
    catch (error) {
        console.error('Error al crear el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    }

    //Termino la conexión con prisma
    finally {
        await prisma.$disconnect()
    }
}

// PATCH /api/glass/:id
export async function updateGlass(request: NextRequest) {
    const prisma = new PrismaClient()
    try {
        //Obtengo el vidrio de la petición y el id de los query params
        const requestData = (await request.json()) as Glass
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id'))

        //Transformo el ancho alto y la cantidad en números
        if (requestData.width) requestData.width = Number(requestData.width)
        if (requestData.height) requestData.height = Number(requestData.height)
        if (requestData.quantity) requestData.quantity = Number(requestData.quantity)

        //Defino el status del vidrio en base a si quedan vidrios o si está almacenado
        requestData.status = 'STORED'

        //Obtengo el vidrio 
        const toUpdateGlass: Glass | null = await prisma.glass.findUnique({
            where: {
                id,
            },
        })

        //Si no existe el vidrio a actualizar devuelvo un error 404
        if (!toUpdateGlass) {
            return NextResponse.json({ error: 'Vidrio no encontrado' }, { status: 404 })
        }

        //Verifico si existe un vidrio con las mismas características pero que no sea el que ya tengo
        let updatedGlass: Glass & { [key: string]: number | string | Date | null | GlassStatus } | null = await prisma.glass.findFirst({
            where: {
                id: {
                    not: toUpdateGlass.id
                },
                typeId: requestData.typeId ?? undefined,
                locationId: requestData.locationId ?? undefined,
                vendorId: requestData.vendorId ?? undefined,
                height: requestData.height ?? undefined,
                width: requestData.width ?? undefined
            }
        })


        //Si existe un vidrio similar entonces sumo las cantidades, calculo el nuevo estado y actualizo los datos de este y borro el vidrio anterior
        if(updatedGlass) {

            requestData.quantity = Number(requestData.quantity) + Number(updatedGlass.quantity)
            if (requestData.quantity <= 0) requestData.status = 'CONSUMED'
            if (!requestData.locationId) requestData.status = 'TRANSIT'


            updatedGlass = await prisma.glass.update({
                where: {
                    id: updatedGlass.id,
                },
                data: requestData,
            })


            await prisma.glass.delete({
                where: {
                    id
                }
            })

        }

        //Si no existe entonces actualizo el vidrio existente
        else {
            updatedGlass = await prisma.glass.update({
                where: {
                    id: id,
                },
                data: requestData,
            })

        }


        //Creo los movimientos de vidrio
        const glassMovements = Object.entries(requestData).reduce((movements: GlassMovement[], [column, newValue]) => {
            const oldValue = updatedGlass?updatedGlass[column] as string:null
            if (oldValue !== newValue) {
                movements.push({
                    glassId: updatedGlass?.id,
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

        //Devuelvo el vidrio actualizado
        return NextResponse.json(updatedGlass)
    }

    //Si obtengo un error devuelvo el estado 500
    catch (error) {
        console.error('Error al actualizar el vidrio:', error)

        return NextResponse.json(null, { status: 500 })
    }

    //por último cierro la conexión con prisma
    finally {
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
