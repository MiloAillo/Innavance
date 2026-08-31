-- AlterTable
ALTER TABLE `admin` MODIFY `smartDoorDefaultPin` VARCHAR(6) NOT NULL;
UPDATE `admin` SET `smartDoorDefaultPin` = LPAD(`smartDoorDefaultPin`, 6, '0');

-- AlterTable
ALTER TABLE `rooms` MODIFY `smartDoorPin` VARCHAR(6) NOT NULL DEFAULT '157359';
UPDATE `rooms` SET `smartDoorPin` = LPAD(`smartDoorPin`, 6, '0');
