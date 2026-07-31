/*
  Warnings:

  - You are about to alter the column `price` on the `addons` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Int`.
  - You are about to alter the column `price` on the `bookings` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Int`.
  - You are about to alter the column `price` on the `rooms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Int`.
  - Added the required column `name` to the `Rooms` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `addons` MODIFY `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `bookings` MODIFY `price` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `rooms` ADD COLUMN `name` VARCHAR(225) NOT NULL,
    MODIFY `price` INTEGER NOT NULL;
