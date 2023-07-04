import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from './db'

import { type GlassLocation } from '@prisma/client/edge'

//Env variables
import { env } from '~/env.mjs'

export const config = {
    runtime: 'edge',
}

// GET /api/locations
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))
        if (id) {
            const response = await prisma.$queryRaw`SELECT gl.*, 
            CASE 
                WHEN gl.maxCapacityJumbo IS NULL OR gl.maxCapacityJumbo = 0 OR gl.maxCapacitySmall IS NULL OR gl.maxCapacitySmall = 0 
                THEN NULL 
                ELSE (IFNULL(counts.jumboGlassCount, 0) / gl.maxCapacityJumbo + IFNULL(counts.smallGlassCount, 0) / gl.maxCapacitySmall) 
            END AS usedCapacity
        FROM GlassLocation gl
        LEFT JOIN (
            SELECT locationId, 
                SUM(CASE WHEN ((g.width / 1000) * (g.height / 1000)) > ${env.SQUARED_METERS_LIMIT} THEN g.quantity END) AS jumboGlassCount,
                SUM(CASE WHEN ((g.width / 1000) * (g.height / 1000)) <= ${env.SQUARED_METERS_LIMIT} THEN g.quantity END) AS smallGlassCount
            FROM Glass g
            GROUP BY locationId
        ) AS counts ON gl.id = counts.locationId
            WHERE gl.id = ${id};`

            return NextResponse.json(response)
        } else {
            const response = await prisma.$queryRaw`SELECT gl.*, 
            CASE 
                WHEN gl.maxCapacityJumbo IS NULL OR gl.maxCapacityJumbo = 0 OR gl.maxCapacitySmall IS NULL OR gl.maxCapacitySmall = 0 
                THEN NULL 
                ELSE (IFNULL(counts.jumboGlassCount, 0) / gl.maxCapacityJumbo + IFNULL(counts.smallGlassCount, 0) / gl.maxCapacitySmall) 
            END AS usedCapacity
        FROM GlassLocation gl
        LEFT JOIN (
            SELECT locationId, 
                SUM(CASE WHEN ((g.width / 1000) * (g.height / 1000)) > ${env.SQUARED_METERS_LIMIT} THEN g.quantity END) AS jumboGlassCount,
                SUM(CASE WHEN ((g.width / 1000) * (g.height / 1000)) <= ${env.SQUARED_METERS_LIMIT} THEN g.quantity END) AS smallGlassCount
            FROM Glass g
            GROUP BY locationId
        ) AS counts ON gl.id = counts.locationId`

            return NextResponse.json(response)
        }
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// POST /api/locations
export async function POST(request: NextRequest) {
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

// PATCH /api/locations/:id
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))
        const locationData = (await request.json()) as GlassLocation
        const updatedLocation = await prisma.glassLocation.update({
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

// DELETE /api/locations/:id
export async function DELETE(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = Number(searchParams.get('id') ?? searchParams.get('nextParamid'))

        const deletedLocation = await prisma.glassLocation.delete({ where: { id } })

        return NextResponse.json(deletedLocation)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
