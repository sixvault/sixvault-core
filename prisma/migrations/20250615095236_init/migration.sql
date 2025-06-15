/*
  Warnings:

  - You are about to drop the column `daftarNilaiId` on the `KeyRequest` table. All the data in the column will be lost.
  - Added the required column `prodi` to the `MataKuliah` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "KeyRequest" DROP CONSTRAINT "KeyRequest_daftarNilaiId_fkey";

-- AlterTable
ALTER TABLE "KeyRequest" DROP COLUMN "daftarNilaiId";

-- AlterTable
ALTER TABLE "MataKuliah" ADD COLUMN     "prodi" "ProdiType" NOT NULL;
