-- DropForeignKey
ALTER TABLE `Auth` DROP FOREIGN KEY `AuthToDosenWali_fkey`;

-- DropForeignKey
ALTER TABLE `Auth` DROP FOREIGN KEY `AuthToKaprodi_fkey`;

-- DropForeignKey
ALTER TABLE `Auth` DROP FOREIGN KEY `AuthToMahasiswa_fkey`;

-- AlterTable
ALTER TABLE `Auth` MODIFY `rsaPublicKey` TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE `Mahasiswa` ADD CONSTRAINT `Mahasiswa_nim_nip_fkey` FOREIGN KEY (`nim_nip`) REFERENCES `Auth`(`nim_nip`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DosenWali` ADD CONSTRAINT `DosenWali_nim_nip_fkey` FOREIGN KEY (`nim_nip`) REFERENCES `Auth`(`nim_nip`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kaprodi` ADD CONSTRAINT `Kaprodi_nim_nip_fkey` FOREIGN KEY (`nim_nip`) REFERENCES `Auth`(`nim_nip`) ON DELETE RESTRICT ON UPDATE CASCADE;
