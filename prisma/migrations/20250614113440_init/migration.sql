-- CreateTable
CREATE TABLE "SelfKey" (
    "id" SERIAL NOT NULL,
    "daftar_nilai_id" INTEGER NOT NULL,
    "rsa_encrypted_aes_key" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SelfKey_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SelfKey_daftar_nilai_id_key" ON "SelfKey"("daftar_nilai_id");

-- AddForeignKey
ALTER TABLE "SelfKey" ADD CONSTRAINT "SelfKey_daftar_nilai_id_fkey" FOREIGN KEY ("daftar_nilai_id") REFERENCES "DaftarNilai"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
