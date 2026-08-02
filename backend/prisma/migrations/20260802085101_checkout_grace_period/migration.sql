-- AlterTable
ALTER TABLE `admin` ADD COLUMN `checkOutGracePeriod` INTEGER NOT NULL DEFAULT 60;

-- AlterTable
ALTER TABLE `bookings` ADD COLUMN `checkoutGraceTime` INTEGER NULL;
