/*
  Warnings:

  - You are about to alter the column `borrowMaximum` on the `addons` table. The data in that column could be lost. The data in that column will be cast from `VarChar(3)` to `Int`.

*/
-- AlterTable
ALTER TABLE `addons` MODIFY `borrowMaximum` INTEGER NOT NULL;
