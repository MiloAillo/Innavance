-- AlterTable
ALTER TABLE `admin` ADD COLUMN `isStaffAllowedToApprove` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isStaffAllowedToDismissCall` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `isStaffAllowedToForceCheckout` BOOLEAN NOT NULL DEFAULT false;
