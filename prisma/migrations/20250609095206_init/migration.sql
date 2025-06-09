-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('mahasiswa', 'dosen_wali', 'kaprodi', 'admin');

-- CreateEnum
CREATE TYPE "ProdiType" AS ENUM ('teknik_informatika', 'sistem_dan_teknologi_informasi');

-- CreateEnum
CREATE TYPE "NilaiType" AS ENUM ('A', 'AB', 'B', 'BC', 'C', 'D');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "nim_nip" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "rsaPublicKey" TEXT NOT NULL,
    "type" "UserType" NOT NULL,
    "prodi" "ProdiType" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Mahasiswa" (
    "id" SERIAL NOT NULL,
    "nim_nip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Mahasiswa_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DosenWali" (
    "id" SERIAL NOT NULL,
    "nim_nip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DosenWali_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Kaprodi" (
    "id" SERIAL NOT NULL,
    "nim_nip" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Kaprodi_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MataKuliah" (
    "id" SERIAL NOT NULL,
    "nim" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,
    "nilai" "NilaiType" NOT NULL,

    CONSTRAINT "MataKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nim_nip_key" ON "User"("nim_nip");

-- CreateIndex
CREATE UNIQUE INDEX "Mahasiswa_nim_nip_key" ON "Mahasiswa"("nim_nip");

-- CreateIndex
CREATE UNIQUE INDEX "DosenWali_nim_nip_key" ON "DosenWali"("nim_nip");

-- CreateIndex
CREATE UNIQUE INDEX "Kaprodi_nim_nip_key" ON "Kaprodi"("nim_nip");

-- AddForeignKey
ALTER TABLE "Mahasiswa" ADD CONSTRAINT "Mahasiswa_nim_nip_fkey" FOREIGN KEY ("nim_nip") REFERENCES "User"("nim_nip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DosenWali" ADD CONSTRAINT "DosenWali_nim_nip_fkey" FOREIGN KEY ("nim_nip") REFERENCES "User"("nim_nip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kaprodi" ADD CONSTRAINT "Kaprodi_nim_nip_fkey" FOREIGN KEY ("nim_nip") REFERENCES "User"("nim_nip") ON DELETE RESTRICT ON UPDATE CASCADE;
