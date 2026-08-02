/*
  Warnings:

  - A unique constraint covering the columns `[accountId]` on the table `Rooms` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Rooms_accountId_key` ON `Rooms`(`accountId`);
