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
    "nim_nip_dosen_wali" TEXT NOT NULL,
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
    "kode" TEXT NOT NULL,
    "matakuliah" TEXT NOT NULL,
    "sks" INTEGER NOT NULL,

    CONSTRAINT "MataKuliah_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DaftarNilai" (
    "id" SERIAL NOT NULL,
    "nim" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nip_dosen" TEXT NOT NULL,
    "nilai" TEXT NOT NULL,

    CONSTRAINT "DaftarNilai_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Share" (
    "id" SERIAL NOT NULL,
    "daftar_nilai_id" INTEGER NOT NULL,
    "nip" TEXT NOT NULL,
    "share_index" INTEGER NOT NULL,
    "share_value" TEXT NOT NULL,
    "is_advisor" BOOLEAN NOT NULL,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyRequest" (
    "id" SERIAL NOT NULL,
    "nim" TEXT NOT NULL,
    "requester_nip" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "daftarNilaiId" INTEGER,

    CONSTRAINT "KeyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" SERIAL NOT NULL,
    "request_id" INTEGER NOT NULL,
    "nim" TEXT NOT NULL,
    "nip" TEXT NOT NULL,
    "requester_nip" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SelfKey" (
    "id" SERIAL NOT NULL,
    "daftar_nilai_id" INTEGER NOT NULL,
    "user_nim_nip" TEXT NOT NULL,
    "rsa_encrypted_aes_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelfKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_nim_nip_key" ON "User"("nim_nip");

-- CreateIndex
CREATE UNIQUE INDEX "Mahasiswa_nim_nip_key" ON "Mahasiswa"("nim_nip");

-- CreateIndex
CREATE UNIQUE INDEX "DosenWali_nim_nip_key" ON "DosenWali"("nim_nip");

-- CreateIndex
CREATE UNIQUE INDEX "Kaprodi_nim_nip_key" ON "Kaprodi"("nim_nip");

-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_kode_key" ON "MataKuliah"("kode");

-- CreateIndex
CREATE UNIQUE INDEX "KeyRequest_nim_requester_nip_key" ON "KeyRequest"("nim", "requester_nip");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_nim_requester_nip_nip_key" ON "Approval"("nim", "requester_nip", "nip");

-- CreateIndex
CREATE UNIQUE INDEX "SelfKey_daftar_nilai_id_user_nim_nip_key" ON "SelfKey"("daftar_nilai_id", "user_nim_nip");

-- AddForeignKey
ALTER TABLE "Mahasiswa" ADD CONSTRAINT "Mahasiswa_nim_nip_fkey" FOREIGN KEY ("nim_nip") REFERENCES "User"("nim_nip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Mahasiswa" ADD CONSTRAINT "Mahasiswa_nim_nip_dosen_wali_fkey" FOREIGN KEY ("nim_nip_dosen_wali") REFERENCES "DosenWali"("nim_nip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DosenWali" ADD CONSTRAINT "DosenWali_nim_nip_fkey" FOREIGN KEY ("nim_nip") REFERENCES "User"("nim_nip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Kaprodi" ADD CONSTRAINT "Kaprodi_nim_nip_fkey" FOREIGN KEY ("nim_nip") REFERENCES "User"("nim_nip") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_daftar_nilai_id_fkey" FOREIGN KEY ("daftar_nilai_id") REFERENCES "DaftarNilai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyRequest" ADD CONSTRAINT "KeyRequest_daftarNilaiId_fkey" FOREIGN KEY ("daftarNilaiId") REFERENCES "DaftarNilai"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "KeyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SelfKey" ADD CONSTRAINT "SelfKey_daftar_nilai_id_fkey" FOREIGN KEY ("daftar_nilai_id") REFERENCES "DaftarNilai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
