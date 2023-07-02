import { type NextRequest, NextResponse } from 'next/server'

import { GET, POST, PATCH, DELETE } from '../../../server/movement'

export const config = {
    runtime: 'edge',
}

// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export default async function handler(request: NextRequest, response: NextResponse) {
    try {
        if (request.method === 'GET') {
            return GET(request)
        } else if (request.method === 'POST') {
            return POST(request)
        } else if (request.method === 'PATCH') {
            return PATCH(request)
        } else if (request.method === 'DELETE') {
            return DELETE(request)
        } else {
            return NextResponse.json({ error: 'Petición no procesada' }, { status: 405 })
        }
    } catch (error) {
        console.error('Error: ', error)

        return NextResponse.json({ error }, { status: 500 })
    }
}
