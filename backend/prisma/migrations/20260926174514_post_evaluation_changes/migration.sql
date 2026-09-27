/*
  Warnings:

  - You are about to drop the column `name` on the `bookings` table. All the data in the column will be lost.
  - You are about to alter the column `phoneNumber` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(25)` to `VarChar(20)`.

*/
-- DropForeignKey
ALTER TABLE `bookings` DROP FOREIGN KEY `Bookings_room_id_fkey`;

-- DropForeignKey
ALTER TABLE `bookings_addons` DROP FOREIGN KEY `Bookings_Addons_addon_id_fkey`;

-- AlterTable
ALTER TABLE `addons` ADD COLUMN `currentlyBorrowed` INTEGER NOT NULL DEFAULT 0,
    ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `totalStock` INTEGER NOT NULL DEFAULT 10;

-- AlterTable
ALTER TABLE `bookings` DROP COLUMN `name`,
    ADD COLUMN `birthDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `emergencyContactName` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `emergencyContactNumber` VARCHAR(20) NOT NULL DEFAULT '',
    ADD COLUMN `emergencyContactRelation` VARCHAR(50) NOT NULL DEFAULT '',
    ADD COLUMN `fullName` VARCHAR(100) NOT NULL DEFAULT '',
    ADD COLUMN `homeAddress` VARCHAR(500) NOT NULL DEFAULT '',
    ADD COLUMN `idCardPhotoPath` VARCHAR(500) NOT NULL DEFAULT '',
    ADD COLUMN `nik` VARCHAR(255) NOT NULL DEFAULT '',
    ADD COLUMN `profession` VARCHAR(100) NULL,
    ADD COLUMN `sex` ENUM('MALE', 'FEMALE') NOT NULL DEFAULT 'MALE',
    ADD COLUMN `workplaceSchool` VARCHAR(200) NULL,
    MODIFY `phoneNumber` VARCHAR(25);

-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `deletedAt` DATETIME(3) NULL;

-- CreateIndex
CREATE INDEX `Bookings_nik_idx` ON `Bookings`(`nik`);

-- CreateIndex
CREATE INDEX `Bookings_phoneNumber_idx` ON `Bookings`(`phoneNumber`);

-- AddForeignKey
ALTER TABLE `Bookings` ADD CONSTRAINT `Bookings_room_id_fkey` FOREIGN KEY (`room_id`) REFERENCES `Rooms`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Bookings_Addons` ADD CONSTRAINT `Bookings_Addons_addon_id_fkey` FOREIGN KEY (`addon_id`) REFERENCES `Addons`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
