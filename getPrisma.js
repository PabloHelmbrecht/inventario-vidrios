const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function obtenerTodosLosVidrios() {
    try {
        const vidrios = await prisma.glass.findMany()

        console.log('Lista de vidrios:')
        console.log(vidrios)
    } catch (error) {
        console.error('Error al obtener los vidrios:', error)
    } finally {
        await prisma.$disconnect()
    }
}

obtenerTodosLosVidrios()
