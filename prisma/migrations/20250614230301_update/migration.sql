/*
  Warnings:

  - A unique constraint covering the columns `[nim,requester_nip,nip]` on the table `Approval` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Approval_nim_requester_nip_nip_key" ON "Approval"("nim", "requester_nip", "nip");
