-- CreateTable
CREATE TABLE `Admin` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `isAutoApprove` BOOLEAN NOT NULL,
    `autoApproveTime` VARCHAR(6) NOT NULL,
    `smartDoorDefaultPin` VARCHAR(6) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin_Users` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `type` ENUM('manager', 'staff') NOT NULL DEFAULT 'staff',
    `name` VARCHAR(255) NOT NULL,
    `username` VARCHAR(50) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `refreshToken` VARCHAR(255) NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    UNIQUE INDEX `Admin_Users_username_key`(`username`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Admin_Notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `admin_id` INTEGER NOT NULL,
    `type` ENUM('info', 'warning', 'important') NOT NULL DEFAULT 'info',
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rooms` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `accountId` VARCHAR(12) NOT NULL,
    `price` VARCHAR(10) NOT NULL,
    `smartDoorIsLocked` BOOLEAN NOT NULL,
    `smartDoorIsOpened` BOOLEAN NOT NULL,
    `electricityOutput` VARCHAR(10) NOT NULL,
    `waterOutput` VARCHAR(10) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Addons` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `addon` VARCHAR(50) NOT NULL,
    `price` VARCHAR(10) NOT NULL,
    `borrowMaximum` VARCHAR(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rooms_Addons` (
    `room_id` INTEGER NOT NULL,
    `addon_id` INTEGER NOT NULL,

    PRIMARY KEY (`room_id`, `addon_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Rooms_Features` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `feature` VARCHAR(200) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookings` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `room_id` INTEGER NOT NULL,
    `status` ENUM('on_hold', 'rejected', 'checking_in', 'checking_out', 'checked_out') NOT NULL,
    `name` VARCHAR(255) NOT NULL,
    `phoneNumber` VARCHAR(25) NOT NULL,
    `duration` VARCHAR(4) NOT NULL,
    `price` VARCHAR(10) NOT NULL,
    `paymentMethod` VARCHAR(100) NOT NULL,
    `isAddonServed` BOOLEAN NOT NULL,
    `isInnkeeperCalled` BOOLEAN NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookings_Addons` (
    `booking_id` INTEGER NOT NULL,
    `addon_id` INTEGER NOT NULL,
    `count` VARCHAR(4) NOT NULL,

    PRIMARY KEY (`booking_id`, `addon_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Bookings_Notifications` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `booking_id` INTEGER NOT NULL,
    `type` ENUM('info', 'warning', 'important') NOT NULL DEFAULT 'info',
    `title` VARCHAR(255) NOT NULL,
    `description` VARCHAR(500) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Admin_Users` ADD CONSTRAINT `Admin_Users_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Admin_Notifications` ADD CONSTRAINT `Admin_Notifications_admin_id_fkey` FOREIGN KEY (`admin_id`) REFERENCES `Admin`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rooms_Addons` ADD CONSTRAINT `Rooms_Addons_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rooms_Addons` ADD CONSTRAINT `Rooms_Addons_addon_id_fkey` FOREIGN KEY (`addon_id`) REFERENCES `Addons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Rooms_Features` ADD CONSTRAINT `Rooms_Features_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookings` ADD CONSTRAINT `Bookings_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Rooms`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookings_Addons` ADD CONSTRAINT `Bookings_Addons_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookings_Addons` ADD CONSTRAINT `Bookings_Addons_addon_id_fkey` FOREIGN KEY (`addon_id`) REFERENCES `Addons`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookings_Notifications` ADD CONSTRAINT `Bookings_Notifications_booking_id_fkey` FOREIGN KEY (`booking_id`) REFERENCES `Bookings`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
