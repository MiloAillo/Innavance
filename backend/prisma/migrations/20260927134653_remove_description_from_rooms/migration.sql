/*
  Warnings:

  - You are about to drop the column `description` on the `rooms` table. All the data in the column will be lost.
  - Made the column `phoneNumber` on table `bookings` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `bookings` MODIFY `phoneNumber` VARCHAR(25) NOT NULL;

-- AlterTable
ALTER TABLE `bookings_addons` ALTER COLUMN `priceAtBooking` DROP DEFAULT;

-- AlterTable
ALTER TABLE `rooms` DROP COLUMN `description`;
