/*
  Warnings:

  - A unique constraint covering the columns `[refreshToken]` on the table `Admin_Users` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `Admin_Users_refreshToken_key` ON `Admin_Users`(`refreshToken`);
