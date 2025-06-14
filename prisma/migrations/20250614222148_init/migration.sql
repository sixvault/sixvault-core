/*
  Warnings:

  - A unique constraint covering the columns `[nim,id]` on the table `DaftarNilai` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[nim,id]` on the table `Share` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "Share" DROP CONSTRAINT "Share_nim_kode_fkey";

-- DropIndex
DROP INDEX "DaftarNilai_nim_kode_key";

-- DropIndex
DROP INDEX "Share_nim_kode_nip_key";

-- CreateIndex
CREATE UNIQUE INDEX "DaftarNilai_nim_id_key" ON "DaftarNilai"("nim", "id");

-- CreateIndex
CREATE UNIQUE INDEX "Share_nim_id_key" ON "Share"("nim", "id");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_nim_id_fkey" FOREIGN KEY ("nim", "id") REFERENCES "DaftarNilai"("nim", "id") ON DELETE RESTRICT ON UPDATE CASCADE;
