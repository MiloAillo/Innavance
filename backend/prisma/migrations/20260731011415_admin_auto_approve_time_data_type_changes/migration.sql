/*
  Warnings:

  - You are about to alter the column `autoApproveTime` on the `admin` table. The data in that column could be lost. The data in that column will be cast from `VarChar(6)` to `Int`.

*/
-- AlterTable
ALTER TABLE `admin` MODIFY `autoApproveTime` INTEGER NOT NULL;
