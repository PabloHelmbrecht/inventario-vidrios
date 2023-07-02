import { type NextRequest, NextResponse } from 'next/server'
import { prisma } from './db'
import { type User } from '@prisma/client/edge'
export const config = {
    runtime: 'edge',
}

// GET /api/users
export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id') ?? searchParams.get('nextParamid')
        if (id) {
            const response = await prisma.user.findUnique({ where: { id } })

            return NextResponse.json(response)
        } else {
            const response = await prisma.user.findMany({})

            return NextResponse.json(response)
        }
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}

// PATCH /api/users/:id
export async function PATCH(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id') ?? searchParams.get('nextParamid')
        const userData = (await request.json()) as User
        const updatedUser = await prisma.user.update({
            where: {
                id: String(id),
            },
            data: { role: userData.role },
        })

        return NextResponse.json(updatedUser)
    } catch (error) {
        console.error(error)

        return NextResponse.json(null, { status: 500 })
    } finally {
        await prisma.$disconnect()
    }
}
