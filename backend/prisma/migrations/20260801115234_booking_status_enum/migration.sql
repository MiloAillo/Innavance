/*
  Warnings:

  - The values [checking_in] on the enum `Bookings_status` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterTable
ALTER TABLE `bookings` MODIFY `status` ENUM('on_hold', 'rejected', 'checked_in', 'checking_out', 'checked_out') NOT NULL;
