/*
  Warnings:

  - You are about to alter the column `duration` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(4)` to `Int`.

*/
-- AlterTable
ALTER TABLE `bookings` MODIFY `duration` INTEGER NOT NULL;
