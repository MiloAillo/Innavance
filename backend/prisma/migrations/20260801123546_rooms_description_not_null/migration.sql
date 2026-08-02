/*
  Warnings:

  - Made the column `description` on table `rooms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `rooms` MODIFY `description` VARCHAR(191) NOT NULL;
