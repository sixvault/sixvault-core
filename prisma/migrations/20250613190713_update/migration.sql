/*
  Warnings:

  - Added the required column `nip_dosen` to the `DaftarNilai` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `nilai` on the `DaftarNilai` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "DaftarNilai" ADD COLUMN     "nip_dosen" TEXT NOT NULL,
DROP COLUMN "nilai",
ADD COLUMN     "nilai" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Share" (
    "id" SERIAL NOT NULL,
    "daftar_nilai_id" INTEGER NOT NULL,
    "nip" TEXT NOT NULL,
    "share_index" INTEGER NOT NULL,
    "share_value" TEXT NOT NULL,
    "is_advisor" BOOLEAN NOT NULL,
    "is_accepted" BOOLEAN NOT NULL,

    CONSTRAINT "Share_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "KeyRequest" (
    "id" SERIAL NOT NULL,
    "daftar_nilai_id" INTEGER NOT NULL,
    "requester_nip" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "KeyRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Approval" (
    "id" SERIAL NOT NULL,
    "key_request_id" INTEGER NOT NULL,
    "teacher_nip" TEXT NOT NULL,
    "approved" BOOLEAN NOT NULL,
    "approved_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Approval_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Share_daftar_nilai_id_nip_key" ON "Share"("daftar_nilai_id", "nip");

-- CreateIndex
CREATE UNIQUE INDEX "Approval_key_request_id_teacher_nip_key" ON "Approval"("key_request_id", "teacher_nip");

-- AddForeignKey
ALTER TABLE "Share" ADD CONSTRAINT "Share_daftar_nilai_id_fkey" FOREIGN KEY ("daftar_nilai_id") REFERENCES "DaftarNilai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "KeyRequest" ADD CONSTRAINT "KeyRequest_daftar_nilai_id_fkey" FOREIGN KEY ("daftar_nilai_id") REFERENCES "DaftarNilai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_key_request_id_fkey" FOREIGN KEY ("key_request_id") REFERENCES "KeyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
