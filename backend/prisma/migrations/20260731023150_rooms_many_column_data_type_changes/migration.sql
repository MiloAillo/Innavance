/*
  Warnings:

  - You are about to alter the column `electricityOutput` on the `rooms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Int`.
  - You are about to alter the column `waterOutput` on the `rooms` table. The data in that column could be lost. The data in that column will be cast from `VarChar(10)` to `Int`.

*/
-- AlterTable
ALTER TABLE `rooms` MODIFY `electricityOutput` INTEGER NOT NULL,
    MODIFY `waterOutput` INTEGER NOT NULL;
