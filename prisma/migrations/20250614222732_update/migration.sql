/*
  Warnings:

  - You are about to drop the column `kode` on the `Share` table. All the data in the column will be lost.
  - You are about to drop the column `nim` on the `Share` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_nim_daftar_nilai_id_fkey";

-- DropIndex
DROP INDEX "DaftarNilai_nim_id_key";

-- DropIndex
DROP INDEX "Share_nim_daftar_nilai_id_key";

-- AlterTable
ALTER TABLE "Share" DROP COLUMN "kode",
DROP COLUMN "nim";

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_daftar_nilai_id_fkey" FOREIGN KEY ("daftar_nilai_id") REFERENCES "DaftarNilai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
