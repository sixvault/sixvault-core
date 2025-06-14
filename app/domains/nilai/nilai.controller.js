const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const AES = require("../../utils/crypto/AES");
const Shamir = require("../../utils/crypto/Shamir");
const RSA = require("../../utils/crypto/RSA");
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

            // Encrypt AES key with mahasiswa's RSA public key for self-decryption
            const mahasiswaUser = await prisma.user.findUnique({
                where: { nim_nip: nim },
                select: { rsaPublicKey: true },
            });

            if (mahasiswaUser && mahasiswaUser.rsaPublicKey) {
                const rsaEncryptedAesKey = RSA.encrypt(
                    keyHex,
                    mahasiswaUser.rsaPublicKey,
                );

                await prisma.selfKey.create({
                    data: {
                        daftar_nilai_id: daftarNilai.id,
                        rsa_encrypted_aes_key: rsaEncryptedAesKey,
                    },
                });
            }

            const shares = shamir.generateShares(keyBigInt, totalDosen, 3);

            const shareRecords = dosenList.map((dosen, idx) =>
                prisma.share.create({
                    data: {
                        daftar_nilai_id: daftarNilai.id,
                        nip: dosen.nim_nip,
                        share_index: Number(shares[idx][0]),
                        share_value: shares[idx][1].toString(),
                        is_advisor: dosen.nim_nip === dosenWali.nim_nip,
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

const view_nilai = async (req, res) => {
    try {
        // Verify the user exists and is a mahasiswa
        const user = await prisma.user.findUnique({
            where: { nim_nip: req.user.nim_nip },
        });

        if (!user || user.type !== "mahasiswa") {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? `Invalid or non-mahasiswa user: ${req.user.nim_nip}`
                    : "Unauthorized User",
                data: {},
            });
        }

        // Get all DaftarNilai records for this mahasiswa with their encrypted AES keys
        const nilaiRecords = await prisma.daftarNilai.findMany({
            where: { nim: req.user.nim_nip },
            include: {
                self_key: true,
            },
        });

        if (nilaiRecords.length === 0) {
            return res.status(404).json({
                status: "error",
                message: "No nilai records found for this mahasiswa",
                data: {},
            });
        }

        // Format the response to include encrypted data and encrypted AES keys
        const formattedRecords = nilaiRecords.map((record) => ({
            id: record.id,
            nim: record.nim,
            nip_dosen: record.nip_dosen,
            encrypted_data: {
                kode: record.kode,
                nama: record.nama,
                nilai: record.nilai,
            },
            rsa_encrypted_aes_key:
                record.self_key?.rsa_encrypted_aes_key || null,
        }));

        return res.status(200).json({
            status: "success",
            message: "Nilai records retrieved successfully",
            data: {
                count: formattedRecords.length,
                records: formattedRecords,
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

const request_list = async (req, res) => {
    const requests = await prisma.keyRequest.findMany({
        where: { status: "pending" },
        include: {
            approvals: true,
            daftar_nilai: true,
        },
    });

    res.json(requests);
};

const request_approve = async (req, res) => {
    const { nim, requester_nip, nip } = req.body;

    const existingUser = await prisma.user.findUnique({
        where: { nim_nip: nip },
    });

    if (!existingUser) {
        return res.status(400).json({
            status: "error",
            message: process.env.DEBUG
                ? "User not Found"
                : "Invalid Credentials",
        });
    }

    try {
        // Search for spesific request

        const request_key = await prisma.keyRequest.findUnique({
            where: {
                nim_requester_nip: {
                    nim: nim,
                    requester_nip: requester_nip,
                },
            },
        });

        if (!request_key) {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? "Request Not Found"
                    : "Invalid Request",
            });
        }

        const approval = await prisma.approval.create({
            data: {
                request_id: request_key.id,
                nim,
                nip,
                requester_nip,
                approved: true,
            },
        });

        // Count how many teachers approved this request
        const approvalCount = await prisma.approval.count({
            where: {
                request_id: request_key.id,
                approved: true,
            },
        });

        const threshold = 3; // example threshold

        // If enough approvals collected, update KeyRequest status
        if (approvalCount >= threshold) {
            await prisma.keyRequest.update({
                where: { id: request_key.id },
                data: {
                    status: "approved",
                },
            });
        }

        return res.json({
            message: "Approval recorded",
            approval,
        });
    } catch (error) {
        if (error.code === "P2002") {
            return res
                .status(400)
                .json({ error: "Already approved by this teacher" });
        }

        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

const request_show = async (req, res) => {
    const { teacher_nip } = req.query;

    if (!teacher_nip) {
        return res.status(400).json({ error: "Missing teacher_nip in query" });
    }

    try {
        const requests = await prisma.keyRequest.findMany({
            where: {
                requester_nip: teacher_nip,
            },
            include: {
                daftar_nilai: true,
                approvals: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });

        const result = [];

        for (const req of requests) {
            const { status, approvals, daftar_nilai } = req;

            let includeNilai = false;
            let decryptedData = null;

            if (status === "approved" && daftar_nilai) {
                const dosenWaliNip = daftar_nilai.nip_dosen;

                // ✅ Check if dosen wali has approved
                const waliApproved = approvals.some(
                    (a) =>
                        a.teacher_nip === dosenWaliNip && a.approved === true,
                );

                // ✅ Get all NIPs of teachers who approved
                const approvedTeacherNips = approvals
                    .filter((a) => a.approved)
                    .map((a) => a.teacher_nip);

                // ✅ Fetch shares for only those teachers
                const shares = await prisma.share.findMany({
                    where: {
                        nip: { in: approvedTeacherNips },
                        daftar_nilai_id: daftar_nilai.id,
                    },
                });

                console.log("Shares: ", shares);

                console.log(approvedTeacherNips);

                if (waliApproved && shares.length >= 3) {
                    try {
                        const formattedShares = shares.map((s) => [
                            BigInt(s.share_index),
                            BigInt(s.share_value),
                        ]);

                        const aesKey =
                            shamir.reconstructSecret(formattedShares);
                        const aesKeyHex = aesKey.toString(16).padStart(32, "0");

                        decryptedData = aes.decrypt(
                            daftar_nilai.encrypted_data,
                            aesKeyHex,
                        );

                        console.log("Formatted shares:", formattedShares);
                        console.log("Reconstructed AES key:", aesKeyHex);
                        console.log("Data:", decryptedData);

                        includeNilai = true;
                    } catch (decryptionError) {
                        console.warn(
                            "Failed to decrypt for request ID",
                            req.id,
                        );
                    }
                }
            }

            result.push({
                key_request_id: req.id,
                daftar_nilai_id: req.daftar_nilai_id,
                status: req.status,
                created_at: req.created_at,
                approvals_count: approvals.filter((a) => a.approved).length,
                shares: approvals.map((a) => ({
                    teacher_nip: a.teacher_nip,
                    approved: a.approved,
                    approved_at: a.approved_at,
                })),
                daftar_nilai: daftar_nilai
                    ? {
                          ...daftar_nilai,
                          decrypted_data: includeNilai ? decryptedData : null,
                      }
                    : null,
            });
        }

        res.json(result);
    } catch (error) {
        console.error("Error in request_show:", error);
        res.status(500).json({ error: "Internal server error" });
    }
};

const request_nilai = async (req, res) => {
    const { nim, requester_nip } = req.body;

    if (!nim || !requester_nip) {
        return res.status(400).json({
            status: "error",
            message: 'Each entry must include "nim" and "requester_nip"',
            data: {},
        });
    }

    const existing = await prisma.keyRequest.findFirst({
        where: {
            nim,
            requester_nip,
            status: "pending",
        },
    });

    if (existing) {
        return res.status(400).json({ error: "Request already exists" });
    }

    const request = await prisma.keyRequest.create({
        data: {
            nim,
            requester_nip,
            status: "pending",
        },
    });

    res.json(request);
};

module.exports = {
    add_nilai,
    decrypt_nilai,
    view_nilai,
    request_nilai,
    request_list,
    request_approve,
    request_show,
};
