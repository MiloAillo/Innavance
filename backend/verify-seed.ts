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

async function verifyBookings() {
  try {
    const bookings = await prisma.bookings.findMany({
      select: {
        id: true,
        paymentMethod: true,
        bookingRoom: {
          select: { name: true, price: true }
        }
      },
      orderBy: { id: 'asc' }
    })

    console.log('📋 Payment Methods Verification:\n')
    const paymentCounts: Record<string, number> = {}
    
    bookings.forEach(b => {
      paymentCounts[b.paymentMethod] = (paymentCounts[b.paymentMethod] || 0) + 1
    })

    console.log('Payment Method Distribution:')
    Object.entries(paymentCounts).forEach(([method, count]) => {
      console.log(`  ${method}: ${count} bookings`)
    })

    console.log('\n💰 Room Prices:')
    const rooms = await prisma.rooms.findMany({ orderBy: { id: 'asc' } })
    rooms.forEach(r => {
      console.log(`  ${r.name}: Rp.${r.price.toLocaleString()}`)
    })

  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

verifyBookings()
