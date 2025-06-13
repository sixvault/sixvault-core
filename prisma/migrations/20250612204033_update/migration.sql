/*
  Warnings:

  - A unique constraint covering the columns `[kode]` on the table `MataKuliah` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "MataKuliah_kode_key" ON "MataKuliah"("kode");
