/*
  Warnings:

  - You are about to alter the column `electricityOutput` on the `rooms` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.
  - You are about to alter the column `waterOutput` on the `rooms` table. The data in that column could be lost. The data in that column will be cast from `Int` to `Double`.

*/
-- AlterTable
ALTER TABLE `rooms` MODIFY `electricityOutput` DOUBLE NOT NULL,
    MODIFY `waterOutput` DOUBLE NOT NULL;
