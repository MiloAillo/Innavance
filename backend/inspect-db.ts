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

async function inspectDatabase() {
  try {
    console.log('🔍 Inspecting database...\n')

    // Admin data
    const adminCount = await prisma.admin.count()
    const admins = await prisma.admin.findMany({
      include: {
        users: true,
        notifications: true,
      },
    })
    console.log(`📊 Admins: ${adminCount}`)
    if (adminCount > 0) {
      console.log('   Details:', JSON.stringify(admins, null, 2))
    }
    console.log()

    // Rooms data
    const roomsCount = await prisma.rooms.count()
    const rooms = await prisma.rooms.findMany({
      include: {
        features: true,
        roomsAddons: {
          include: {
            addon: true,
          },
        },
        bookings: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
      },
    })
    console.log(`🏠 Rooms: ${roomsCount}`)
    if (roomsCount > 0) {
      rooms.forEach((room) => {
        console.log(`   - ${room.name} (ID: ${room.id})`)
        console.log(`     Price: ${room.price}, Capacity: ${room.capacity}`)
        console.log(`     Available: ${room.isAvailable}`)
        console.log(`     Smart Door: Pin ${room.smartDoorPin}, Locked: ${room.smartDoorIsLocked}`)
        console.log(`     Features: ${room.features.length}`)
        console.log(`     Addons: ${room.roomsAddons.length}`)
        console.log(`     Recent Bookings: ${room.bookings.length}`)
      })
    }
    console.log()

    // Addons data
    const addonsCount = await prisma.addons.count()
    const addons = await prisma.addons.findMany()
    console.log(`🎁 Addons: ${addonsCount}`)
    if (addonsCount > 0) {
      addons.forEach((addon) => {
        console.log(`   - ${addon.addon} (ID: ${addon.id}): $${addon.price}, Max: ${addon.borrowMaximum}`)
      })
    }
    console.log()

    // Bookings data
    const bookingsCount = await prisma.bookings.count()
    const bookingsByStatus = await prisma.bookings.groupBy({
      by: ['status'],
      _count: true,
    })
    const recentBookings = await prisma.bookings.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        bookingRoom: true,
        bookingsAddons: {
          include: {
            addonAddon: true,
          },
        },
      },
    })

    console.log(`📅 Bookings: ${bookingsCount}`)
    console.log('   By Status:')
    bookingsByStatus.forEach((group) => {
      console.log(`     - ${group.status}: ${group._count}`)
    })
    
    if (recentBookings.length > 0) {
      console.log('\n   Recent Bookings:')
      recentBookings.forEach((booking) => {
        console.log(`     - ID ${booking.id}: ${booking.name} (${booking.phoneNumber})`)
        console.log(`       Room: ${booking.bookingRoom.name}`)
        console.log(`       Status: ${booking.status}`)
        console.log(`       Duration: ${booking.duration}h, Price: $${booking.price}`)
        console.log(`       Created: ${booking.createdAt}`)
        if (booking.checkedInAt) console.log(`       Checked In: ${booking.checkedInAt}`)
        if (booking.checkedOutAt) console.log(`       Checked Out: ${booking.checkedOutAt}`)
        console.log(`       Addons: ${booking.bookingsAddons.length}`)
      })
    }
    console.log()

    // Admin Users
    const adminUsersCount = await prisma.adminUsers.count()
    const adminUsers = await prisma.adminUsers.findMany({
      select: {
        id: true,
        name: true,
        username: true,
        type: true,
        createdAt: true,
      },
    })
    console.log(`👥 Admin Users: ${adminUsersCount}`)
    if (adminUsersCount > 0) {
      adminUsers.forEach((user) => {
        console.log(`   - ${user.name} (@${user.username}) - ${user.type}`)
      })
    }
    console.log()

    console.log('✅ Database inspection complete!')
  } catch (error) {
    console.error('❌ Error inspecting database:', error)
  } finally {
    await prisma.$disconnect()
  }
}

inspectDatabase()
