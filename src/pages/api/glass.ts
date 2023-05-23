

import { type NextRequest, NextResponse } from 'next/server'

import { getGlass, createGlass,updateGlass, deleteGlass } from '../../server/glass';

export const config = {
    runtime: 'edge',
}


// eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
export default async function handler(request: NextRequest, response: NextResponse) {
    try {

        if (request.method === 'GET') {
            return getGlass(request)
        } else if (request.method === 'POST') {
            return createGlass(request)
        } else if (request.method === 'PATCH') {
            return updateGlass(request)
        } else if (request.method === 'DELETE') {
            return deleteGlass(request)
        } else {
            return NextResponse.json({ error: 'Petición no procesada' }, { status: 405 })
        }

    } catch (error) {
        console.error('Error: ', error)

        return NextResponse.json({error}, { status: 500 })
    }
}


