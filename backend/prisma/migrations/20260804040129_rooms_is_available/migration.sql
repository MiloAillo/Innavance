/*
  Warnings:

  - You are about to drop the column `isOccupied` on the `rooms` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `rooms` DROP COLUMN `isOccupied`,
    ADD COLUMN `isAvailable` BOOLEAN NOT NULL DEFAULT true;
