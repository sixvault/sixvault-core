/*
  Warnings:

  - You are about to drop the column `nama` on the `MataKuliah` table. All the data in the column will be lost.
  - You are about to drop the column `nilai` on the `MataKuliah` table. All the data in the column will be lost.
  - You are about to drop the column `nim` on the `MataKuliah` table. All the data in the column will be lost.
  - You are about to drop the column `sks` on the `MataKuliah` table. All the data in the column will be lost.
  - Added the required column `matakuliah` to the `MataKuliah` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "MataKuliah" DROP COLUMN "nama",
DROP COLUMN "nilai",
DROP COLUMN "nim",
DROP COLUMN "sks",
ADD COLUMN     "matakuliah" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "DaftarNilai" (
    "id" SERIAL NOT NULL,
    "nim" TEXT NOT NULL,
    "kode" TEXT NOT NULL,
    "nama" TEXT NOT NULL,
    "nilai" "NilaiType" NOT NULL,

    CONSTRAINT "DaftarNilai_pkey" PRIMARY KEY ("id")
);
