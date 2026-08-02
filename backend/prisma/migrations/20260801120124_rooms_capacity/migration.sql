/*
  Warnings:

  - Made the column `capacity` on table `rooms` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `rooms` MODIFY `capacity` INTEGER NOT NULL;
