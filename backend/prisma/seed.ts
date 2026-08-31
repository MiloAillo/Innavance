import 'dotenv/config';
import { PrismaClient } from "../src/generated/prisma/client";
import { 
  addons_data, 
  admin_auto_approve_time, 
  admin_is_auto_approve, 
  admin_smart_door_default_pin,
  admin_checkout_grace_period,
  admin_staff_allowed_to_approve,
  admin_staff_allowed_to_force_checkout,
  admin_staff_allowed_to_dismiss_call,
  admin_qr_instructions,
  rooms_data 
} from "../src/var";
import * as bcrypt from "bcrypt";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";

const adapter = new PrismaMariaDb({
  host: process.env.DATABASE_HOST,
  port: parseInt(process.env.DATABASE_PORT ?? "3306"),
  user: process.env.DATABASE_USER,
  password: process.env.DATABASE_PASSWORD,
  database: process.env.DATABASE_NAME
});

const prisma = new PrismaClient({
  adapter: adapter
});

// Helper to generate random date between two dates
function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Helper to generate random phone number
function randomPhone(): string {
  const prefixes = ['0856', '0812', '0813', '0821', '0822'];
  const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
  const numbers = Math.floor(10000000 + Math.random() * 90000000);
  return prefix + numbers;
}

async function main() {
  console.log("Starting database seed...");

  const saltRounds = 7;
  const ManagerHashedPassword = await bcrypt.hash(process.env.MANAGER_PASSWORD ?? "manager123", saltRounds);
  const staffHashedPassword = await bcrypt.hash("staff123", saltRounds);

  // Clean up existing data (in reverse dependency order)
  console.log("Cleaning up existing data...");
  await prisma.bookingsAddons.deleteMany({});
  await prisma.bookingsNotifications.deleteMany({});
  await prisma.bookings.deleteMany({});
  await prisma.roomsAddons.deleteMany({});
  await prisma.roomsFeatures.deleteMany({});
  await prisma.rooms.deleteMany({});
  await prisma.addons.deleteMany({});
  await prisma.adminNotifications.deleteMany({});
  await prisma.adminUsers.deleteMany({});
  await prisma.admin.deleteMany({});

  // Reset auto-increment for admin table to ensure id starts at 1
  await prisma.$executeRawUnsafe('ALTER TABLE admin AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE addons AUTO_INCREMENT = 1');
  await prisma.$executeRawUnsafe('ALTER TABLE rooms AUTO_INCREMENT = 1');

  console.log("Seeding admin configuration...");
  // Create admin table with all settings
  const admin = await prisma.admin.create({
    data: {
      isAutoApprove: admin_is_auto_approve,
      autoApproveTime: admin_auto_approve_time,
      smartDoorDefaultPin: admin_smart_door_default_pin,
      checkOutGracePeriod: admin_checkout_grace_period,
      isStaffAllowedToApprove: admin_staff_allowed_to_approve,
      isStaffAllowedToForceCheckout: admin_staff_allowed_to_force_checkout,
      isStaffAllowedToDismissCall: admin_staff_allowed_to_dismiss_call,
      qrInstructions: admin_qr_instructions,
    }
  });
  console.log(`Created admin with ID: ${admin.id}`);

  console.log("Seeding admin users...");
  // Create manager account
  await prisma.adminUsers.create({
    data: {
      admin_id: admin.id,
      type: "manager",
      name: process.env.MANAGER_NAME ?? "Manager",
      username: process.env.MANAGER_USERNAME ?? "Manager1",
      password: ManagerHashedPassword
    }
  });

  // Create two staff accounts
  await prisma.adminUsers.create({
    data: {
      admin_id: admin.id,
      type: "staff",
      name: "Staff 1",
      username: "staff1",
      password: staffHashedPassword
    }
  });

  await prisma.adminUsers.create({
    data: {
      admin_id: admin.id,
      type: "staff",
      name: "Staff 2",
      username: "staff2",
      password: staffHashedPassword
    }
  });

  // Create welcome notification for admins
  await prisma.adminNotifications.create({
    data: {
      admin_id: admin.id,
      type: "info",
      title: "Feels good...",
      description: "Welcome to the admin team for all the manager and staff."
    }
  });

  console.log("Seeding addons...");
  // Create addons for rooms
  const createdAddons = [];
  for (const data of addons_data) {
    const addon = await prisma.addons.create({
      data: {
        addon: data.addon,
        price: data.price,
        borrowMaximum: data.borrowMaximum
      }
    });
    createdAddons.push(addon);
    console.log(`Created addon: ${addon.addon} (ID: ${addon.id})`);
  }

  console.log("Seeding rooms with features and addons...");
  // Create rooms, rooms features, and rooms addons
  const createdRooms = [];
  for (let roomIndex = 0; roomIndex < rooms_data.length; roomIndex++) {
    const data = rooms_data[roomIndex];
    const room = await prisma.rooms.create({
      data: {
        name: data.name,
        price: data.price,
        capacity: data.capacity,
        description: data.description,
        smartDoorPin: admin_smart_door_default_pin,
        smartDoorIsLocked: true,
        smartDoorIsOpened: false,
        electricityOutput: 0,
        waterOutput: 0
      }
    });
    createdRooms.push(room);

    // Create room features (don't hardcode IDs, let DB auto-increment)
    if (data.features) {
      for (const featureText of data.features) {
        await prisma.roomsFeatures.create({
          data: {
            room_id: room.id,
            feature: featureText
          }
        });
      }
    }

    // Create room addons using the actual created addon IDs
    if (data.addons) {
      for (const addonIndex of data.addons) {
        // addonIndex is 1-based from var.ts (1,2,3,4), convert to 0-based array index
        const addon = createdAddons[addonIndex - 1];
        if (addon) {
          await prisma.roomsAddons.create({
            data: {
              room_id: room.id,
              addon_id: addon.id
            }
          });
        }
      }
    }
  }

  console.log("Generating 20 historical bookings...");
  // Generate 20 checked-out bookings spread over May-August 2026
  const customerNames = [
    "Budi Santoso",
    "Siti Nurhaliza", 
    "Ahmad Rizki",
    "Dewi Lestari",
    "Faris Kahlil Haidar",
    "Rina Wijaya"
  ];

  const paymentMethod = "Cash"; // All bookings use Cash payment

  // Distribution: VIP (5), Golden (5), Basic (6), Student (4)
  // Use indices to reference createdRooms array [0=VIP, 1=Golden, 2=Basic, 3=Student]
  const roomDistribution = [
    0, 0, 0, 0, 0,  // VIP (5)
    1, 1, 1, 1, 1,  // Golden (5)
    2, 2, 2, 2, 2, 2,  // Basic (6)
    3, 3, 3, 3  // Student (4)
  ];

  // Spread dates from May 1 to August 30, 2026
  const startDate = new Date('2026-05-01T08:00:00Z');
  const endDate = new Date('2026-08-30T20:00:00Z');

  for (let i = 0; i < 20; i++) {
    const roomIndex = roomDistribution[i];
    const room = createdRooms[roomIndex];
    
    if (!room) continue;

    const customerName = customerNames[Math.floor(Math.random() * customerNames.length)];
    const phoneNumber = randomPhone();
    const duration = Math.floor(Math.random() * 3) + 1; // 1-3 hours

    // Random check-in time between May and August
    const checkedInAt = randomDate(startDate, endDate);
    // Check-out is duration hours after check-in
    const checkedOutAt = new Date(checkedInAt.getTime() + duration * 60 * 60 * 1000);
    // Created slightly before check-in (5-30 minutes)
    const createdAt = new Date(checkedInAt.getTime() - (Math.floor(Math.random() * 25) + 5) * 60 * 1000);

    let totalPrice = room.price * duration;
    const hasAddons = Math.random() < 0.3; // 30% chance of addons

    const booking = await prisma.bookings.create({
      data: {
        room_id: room.id,
        status: "checked_out",
        name: customerName,
        phoneNumber: phoneNumber,
        duration: duration,
        price: totalPrice,
        paymentMethod: paymentMethod,
        isAddonServed: hasAddons,
        isInnkeeperCalled: false,
        isAutoApprove: false,
        createdAt: createdAt,
        checkedInAt: checkedInAt,
        checkedOutAt: checkedOutAt
      }
    });

    // Add random addons if applicable
    if (hasAddons) {
      const roomAddons = await prisma.roomsAddons.findMany({
        where: { room_id: room.id },
        select: { addon_id: true }
      });

      if (roomAddons.length > 0) {
        // Pick 1-2 random addons
        const numAddons = Math.min(Math.floor(Math.random() * 2) + 1, roomAddons.length);
        const shuffled = roomAddons.sort(() => 0.5 - Math.random());
        const selectedAddons = shuffled.slice(0, numAddons);

        for (const { addon_id } of selectedAddons) {
          const addon = await prisma.addons.findUnique({ where: { id: addon_id } });
          if (addon) {
            const count = Math.floor(Math.random() * Math.min(3, addon.borrowMaximum)) + 1;
            await prisma.bookingsAddons.create({
              data: {
                booking_id: booking.id,
                addon_id: addon_id,
                count: count
              }
            });
            
            // Update total price
            totalPrice += addon.price * count;
          }
        }

        // Update booking price with addons
        await prisma.bookings.update({
          where: { id: booking.id },
          data: { price: totalPrice }
        });
      }
    }
  }

  console.log("✅ Seeding completed successfully!");
  console.log(`   - 1 Admin configuration`);
  console.log(`   - 3 Admin users (1 manager, 2 staff)`);
  console.log(`   - ${addons_data.length} Addons`);
  console.log(`   - ${rooms_data.length} Rooms with features and addons`);
  console.log(`   - 20 Historical bookings (May-August 2026)`);
}

main()
  .catch((err) => {
    console.error("❌ Seeding failed:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
