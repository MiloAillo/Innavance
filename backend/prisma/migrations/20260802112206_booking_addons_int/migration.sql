/*
  Warnings:

  - You are about to alter the column `count` on the `bookings_addons` table. The data in that column could be lost. The data in that column will be cast from `VarChar(4)` to `Int`.

*/
-- AlterTable
ALTER TABLE `bookings_addons` MODIFY `count` INTEGER NOT NULL;
