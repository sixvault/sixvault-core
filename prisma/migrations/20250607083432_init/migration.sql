-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `nim_nip` VARCHAR(191) NOT NULL,
    `publicKey` VARCHAR(191) NOT NULL,
    `type` ENUM('mahasiswa', 'dosen_wali', 'kaprodi', 'admin') NOT NULL,
    `prodi` ENUM('teknik_informatika', 'sistem_dan_teknologi_informasi') NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updatedAt` DATETIME(3) NOT NULL,

    UNIQUE INDEX `User_nim_nip_key`(`nim_nip`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
