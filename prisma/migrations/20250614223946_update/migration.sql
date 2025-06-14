/*
  Warnings:

  - Added the required column `request_id` to the `Approval` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Approval" DROP CONSTRAINT "Approval_nim_requester_nip_fkey";

-- DropIndex
DROP INDEX "Approval_nim_requester_nip_key";

-- AlterTable
ALTER TABLE "Approval" ADD COLUMN     "request_id" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Approval" ADD CONSTRAINT "Approval_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "KeyRequest"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
