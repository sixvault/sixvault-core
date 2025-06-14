/*
  Warnings:

  - You are about to drop the column `key_request_id` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `teacher_nip` on the `Approval` table. All the data in the column will be lost.
  - You are about to drop the column `daftar_nilai_id` on the `KeyRequest` table. All the data in the column will be lost.
  - You are about to drop the column `daftar_nilai_id` on the `Share` table. All the data in the column will be lost.
  - You are about to drop the column `is_accepted` on the `Share` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[nim,requester_nip]` on the table `Approval` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nim,kode]` on the table `DaftarNilai` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nim,requester_nip]` on the table `KeyRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nim,kode,nip]` on the table `Share` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `nim` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nip` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `requester_nip` to the `Approval` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nim` to the `KeyRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kode` to the `Share` table without a default value. This is not possible if the table is not empty.
  - Added the required column `nim` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_key_request_id_fkey";

-- DropForeignKey
ALTER TABLE "KeyRequest" DROP CONSTRAINT "KeyRequest_daftar_nilai_id_fkey";

-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_daftar_nilai_id_fkey";

-- DropIndex
DROP INDEX "Approval_key_request_id_teacher_nip_key";

-- DropIndex
DROP INDEX "Share_daftar_nilai_id_nip_key";

-- AlterTable
ALTER TABLE "Approval" DROP COLUMN "key_request_id",
DROP COLUMN "teacher_nip",
ADD COLUMN     "nim" TEXT NOT NULL,
ADD COLUMN     "nip" TEXT NOT NULL,
ADD COLUMN     "requester_nip" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "KeyRequest" DROP COLUMN "daftar_nilai_id",
ADD COLUMN     "nim" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "Share" DROP COLUMN "daftar_nilai_id",
DROP COLUMN "is_accepted",
ADD COLUMN     "kode" TEXT NOT NULL,
ADD COLUMN     "nim" TEXT NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Approval_nim_requester_nip_key" ON "Approval"("nim", "requester_nip");

-- CreateIndex
CREATE UNIQUE INDEX "DaftarNilai_nim_kode_key" ON "DaftarNilai"("nim", "kode");

-- CreateIndex
CREATE UNIQUE INDEX "KeyRequest_nim_requester_nip_key" ON "KeyRequest"("nim", "requester_nip");

-- CreateIndex
CREATE UNIQUE INDEX "Share_nim_kode_nip_key" ON "Share"("nim", "kode", "nip");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_nim_kode_fkey" FOREIGN KEY ("nim", "kode") REFERENCES "DaftarNilai"("nim", "kode") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_nim_requester_nip_fkey" FOREIGN KEY ("nim", "requester_nip") REFERENCES "KeyRequest"("nim", "requester_nip") ON DELETE RESTRICT ON UPDATE CASCADE;
