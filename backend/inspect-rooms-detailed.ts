import 'dotenv/config'
import { PrismaClient } from './src/generated/prisma/client'
import { PrismaMariaDb } from '@prisma/adapter-mariadb'

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? '3306'),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME,
})
const prisma = new PrismaClient({ adapter })

async function inspectRoomsDetailed() {
  try {
    const rooms = await prisma.rooms.findMany({
      include: {
        features: {
          orderBy: { id: 'asc' }
        },
        roomsAddons: {
          include: {
            addon: true
          },
          orderBy: { addon_id: 'asc' }
        }
      },
      orderBy: { id: 'asc' }
    })

    for (const room of rooms) {
      console.log(`\n=== ${room.name} (ID: ${room.id}) ===`)
      console.log(`Price: ${room.price}`)
      console.log(`Capacity: ${room.capacity}`)
      console.log(`Description: ${room.description}`)
      console.log(`\nFeatures (${room.features.length}):`)
      room.features.forEach((f, idx) => {
        console.log(`  ${idx + 1}. ${f.feature}`)
      })
      console.log(`\nAddons (${room.roomsAddons.length}):`)
      room.roomsAddons.forEach(ra => {
        console.log(`  - ${ra.addon.addon} (ID: ${ra.addon_id})`)
      })
    }

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

inspectRoomsDetailed()
