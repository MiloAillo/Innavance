import { PrismaClient } from "../src/generated/prisma/client";
import { addons_data, admin_auto_approve_time, admin_is_auto_approve, admin_smart_door_default_pin, rooms_data } from "../src/var";
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

async function main() {
  console.log("Seeding database...");

  const saltRounds = 7;
  const ManagerHashedPassword = await bcrypt.hash(process.env.MANAGER_PASSWORD ?? "manager123", saltRounds);
  const staffHashedPassword = await bcrypt.hash("staff123", saltRounds);

  // create admin table
  await prisma.admin.upsert({
    where: { id: 1 },
    update: {
      isAutoApprove: admin_is_auto_approve,
      autoApproveTime: admin_auto_approve_time,
      smartDoorDefaultPin: admin_smart_door_default_pin
    },
    create: {
      isAutoApprove: admin_is_auto_approve,
      autoApproveTime: admin_auto_approve_time,
      smartDoorDefaultPin: admin_smart_door_default_pin
    }
  });

  // create manager account
  await prisma.adminUsers.upsert({
    where: { id: 1 },
    update: {
      name: process.env.MANAGER_NAME ?? "Manager",
      username: process.env.MANAGER_USERNAME ?? "Manager1",
      password: ManagerHashedPassword
    },
    create: {
      admin_id: 1,
      type: "manager",
      name: process.env.MANAGER_NAME ?? "Manager",
      username: process.env.MANAGER_USERNAME ?? "Manager1",
      password: ManagerHashedPassword
    }
  });

  // create two staff accounts
  for (let index = 1; index < 3; index++) {
    await prisma.adminUsers.upsert({
      where: { id: index },
      update: {},
      create: {
        admin_id: 1,
        type: "staff",
        name: "Staff " + index,
        username: "staff" + index,
        password: staffHashedPassword
      }
    });
  }

  // create welcome notification for admins
  await prisma.adminNotifications.upsert({
    where: { id: 1 },
    update: {},
    create: {
      admin_id: 1,
      type: "info",
      title: "Feels good...",
      description: "Welcome to the admin team for all the manager and staff."
    }
  });

  // create addons for rooms
  for (let index = 0; index < addons_data.length; index++) {
    const data = addons_data[index];
    const id = index + 1;

    await prisma.addons.upsert({
      where: { id: id },
      update: {
        addon: data.addon,
        price: data.price,
        borrowMaximum: data.borrowMaximum
      },
      create: {
        addon: data.addon,
        price: data.price,
        borrowMaximum: data.borrowMaximum
      }
    });
  }

  // create rooms, rooms features, and rooms addons
  for (let index = 0; index < rooms_data.length; index++) {
    const data = rooms_data[index];
    const roomId = index + 1;

    // create the room
    await prisma.rooms.upsert({
      where: { id: roomId },
      update: {
        name: data.name,
        price: data.price
      },
      create: {
        name: data.name,
        price: data.price,
        smartDoorIsLocked: true,
        smartDoorIsOpened: true,
        electricityOutput: 0,
        waterOutput: 0
      }
    });

    // create the room features
    if (data.features) {
      for (let fIndex = 0; fIndex < data.features.length; fIndex++) {
        const featureData = data.features[fIndex];
        const featureId = fIndex + 1;

        await prisma.roomsFeatures.upsert({
          where: { id: featureId },
          update: {
            room_id: roomId,
            feature: featureData
          },
          create: {
            room_id: roomId,
            feature: featureData
          }
        });
      }
    }

    // create the room addons
    if (data.addons) {
      for (const addonId of data.addons) {
        await prisma.roomsAddons.upsert({
          where: {
            room_id_addon_id: {
              room_id: roomId,
              addon_id: addonId
            }
          },
          update: {},
          create: {
            room_id: roomId,
            addon_id: addonId
          }
        });
      }
    }
  }

  console.log("Seeding completed successfully!");
}

main()
  .catch((err) => {
    console.error("Seeding failed...", err);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });