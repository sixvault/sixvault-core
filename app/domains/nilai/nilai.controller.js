const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const AES = require("../../utils/crypto/AES");
const Shamir = require("../../utils/crypto/Shamir");
const crypto = require("crypto");

const aes = new AES();
const shamir = new Shamir();

const add_nilai = async (req, res) => {
    try {
        const dataArray = req.body;

        if (!Array.isArray(dataArray) || dataArray.length === 0) {
            return res.status(400).json({
                status: "error",
                message:
                    "Request body must be a non-empty array of nilai entries",
                data: {},
            });
        }

        const dosenList = await prisma.dosenWali.findMany();
        const totalDosen = dosenList.length;

        if (totalDosen < 3) {
            return res.status(400).json({
                status: "error",
                message: "At least 3 dosen are required to distribute shares",
                data: {},
            });
        }

        const insertedDaftarNilai = [];

        for (const item of dataArray) {
            const { nim, kode, nama, nilai, nip } = item;

            if (!nim || !kode || !nama || !nilai || !nip) {
                return res.status(400).json({
                    status: "error",
                    message:
                        'Each entry must include "nim", "kode", "nama", "nip" and "nilai"',
                    data: {},
                });
            }

            const user = await prisma.user.findUnique({
                where: { nim_nip: nim },
            });

            if (!user || user.type !== "mahasiswa") {
                return res.status(400).json({
                    status: "error",
                    message: process.env.DEBUG
                        ? `Invalid or non-mahasiswa user: ${nim}`
                        : "Unauthorized User",
                    data: {},
                });
            }

            const matkul = await prisma.mataKuliah.findUnique({
                where: { kode },
            });

            if (!matkul) {
                return res.status(400).json({
                    status: "error",
                    message: process.env.DEBUG
                        ? `Mata kuliah with kode ${kode} not found`
                        : "Invalid Mata Kuliah",
                    data: {},
                });
            }

            const dosenWali = await prisma.dosenWali.findFirst({
                where: { nim_nip: nip },
            });

            if (!dosenWali) {
                return res.status(400).json({
                    status: "error",
                    message: `Dosen wali not found for mahasiswa ${nim}`,
                    data: {},
                });
            }

            // Encrypt name with AES
            const keyBytes = crypto.randomBytes(32); // 256 bits = 32 bytes

            const keyHex = keyBytes.toString("hex"); // for printing/storing
            const keyBigInt = BigInt("0x" + keyHex); // for Shamir

            // Save to DaftarNilai
            const daftarNilai = await prisma.daftarNilai.create({
                data: {
                    nim,
                    kode: aes.encrypt(kode, keyHex),
                    nama: aes.encrypt(nama, keyHex),
                    nilai: aes.encrypt(nilai, keyHex),
                    nip_dosen: nip,
                },
            });

            const shares = shamir.generateShares(keyBigInt, totalDosen, 3);

            const shareRecords = dosenList.map((dosen, idx) =>
                prisma.share.create({
                    data: {
                        daftar_nilai_id: daftarNilai.id,
                        nip: dosen.nim_nip,
                        share_index: Number(shares[idx][0]),
                        share_value: shares[idx][1].toString(),
                        is_advisor: dosen.nim_nip === dosenWali.nim_nip,
                        is_accepted: false,
                    },
                }),
            );

            await Promise.all(shareRecords);
            insertedDaftarNilai.push(daftarNilai.id);
        }

        return res.status(200).json({
            status: "success",
            message: "All valid nilai entries inserted and encrypted",
            data: {
                count: insertedDaftarNilai.length,
            },
        });
    } catch (err) {
        console.error(err);
        return res.status(400).json({
            status: "error",
            message: process.env.DEBUG ? err.message : "Bad Request",
            data: {},
        });
    }
};

const decrypt_nilai = async (req, res) => {
    try {
        const { daftarNilaiId } = req.body;

        if (!daftarNilaiId) {
            return res.status(400).json({
                status: "error",
                message: "Missing daftarNilaiId in request body",
                data: {},
            });
        }

        const daftarNilai = await prisma.daftarNilai.findUnique({
            where: { id: daftarNilaiId },
        });

        if (!daftarNilai) {
            return res.status(404).json({
                status: "error",
                message: "Daftar nilai not found",
                data: {},
            });
        }

        const shares = await prisma.share.findMany({
            where: { daftar_nilai_id: daftarNilaiId },
            take: 3,
        });

        if (shares.length < 3) {
            return res.status(400).json({
                status: "error",
                message: "Not enough shares to reconstruct AES key",
                data: {},
            });
        }

        const formattedShares = shares.map((s) => [
            BigInt(s.share_index),
            BigInt(s.share_value),
        ]);

        const aesKey = shamir.reconstructSecret(formattedShares);
        const aesKeyHex = aesKey.toString(16).padStart(32, "0");

        console.log("Reconstructed key :", aesKey);

        console.log("Reconstructed key (hex):", aesKeyHex);

        const decrypted = {
            nim: daftarNilai.nim,
            kode: aes.decrypt(daftarNilai.kode, aesKeyHex),
            nama: aes.decrypt(daftarNilai.nama, aesKeyHex),
            nilai: aes.decrypt(daftarNilai.nilai, aesKeyHex),
        };

        return res.status(200).json({
            status: "success",
            message: "Data decrypted successfully",
            data: decrypted,
        });
    } catch (err) {
        console.error(err);
        return res.status(500).json({
            status: "error",
            message: process.env.DEBUG ? err.message : "Internal server error",
            data: {},
        });
    }
};

module.exports = {
    add_nilai,
    decrypt_nilai,
};
