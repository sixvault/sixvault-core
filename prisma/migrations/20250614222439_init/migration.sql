/*
  Warnings:

  - A unique constraint covering the columns `[nim,daftar_nilai_id]` on the table `Share` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `daftar_nilai_id` to the `Share` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_nim_id_fkey";

-- DropIndex
DROP INDEX "Share_nim_id_key";

-- AlterTable
ALTER TABLE "Share" ADD COLUMN     "daftar_nilai_id" INTEGER NOT NULL;

-- CreateIndex
CREATE UNIQUE INDEX "Share_nim_daftar_nilai_id_key" ON "Share"("nim", "daftar_nilai_id");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_nim_daftar_nilai_id_fkey" FOREIGN KEY ("nim", "daftar_nilai_id") REFERENCES "DaftarNilai"("nim", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
