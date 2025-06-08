/*
  Warnings:

  - You are about to drop the column `nama` on the `DosenWali` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `Kaprodi` table. All the data in the column will be lost.
  - You are about to drop the column `prodi` on the `Kaprodi` table. All the data in the column will be lost.
  - You are about to drop the column `nama` on the `Mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the column `prodi` on the `Mahasiswa` table. All the data in the column will be lost.
  - You are about to drop the `Auth` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE `DosenWali` DROP FOREIGN KEY `DosenWali_nim_nip_fkey`;

-- DropForeignKey
ALTER TABLE `Kaprodi` DROP FOREIGN KEY `Kaprodi_nim_nip_fkey`;

-- DropForeignKey
ALTER TABLE `Mahasiswa` DROP FOREIGN KEY `Mahasiswa_nim_nip_fkey`;

-- AlterTable
ALTER TABLE `DosenWali` DROP COLUMN `nama`;

-- AlterTable
ALTER TABLE `Kaprodi` DROP COLUMN `nama`,
    DROP COLUMN `prodi`;

-- AlterTable
ALTER TABLE `Mahasiswa` DROP COLUMN `nama`,
    DROP COLUMN `prodi`;

-- DropTable
DROP TABLE `Auth`;

-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nim_nip` VARCHAR(191) NOT NULL,
    `rsaPublicKey` TEXT NOT NULL,
    `isVerified` BOOLEAN NOT NULL,
    `type` ENUM('mahasiswa', 'dosen_wali', 'kaprodi', 'admin') NOT NULL,
    `prodi` ENUM('teknik_informatika', 'sistem_dan_teknologi_informasi') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_nim_nip_key`(`nim_nip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Mahasiswa` ADD CONSTRAINT `Mahasiswa_nim_nip_fkey` FOREIGN KEY (`nim_nip`) REFERENCES `User`(`nim_nip`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DosenWali` ADD CONSTRAINT `DosenWali_nim_nip_fkey` FOREIGN KEY (`nim_nip`) REFERENCES `User`(`nim_nip`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Kaprodi` ADD CONSTRAINT `Kaprodi_nim_nip_fkey` FOREIGN KEY (`nim_nip`) REFERENCES `User`(`nim_nip`) ON DELETE RESTRICT ON UPDATE CASCADE;
