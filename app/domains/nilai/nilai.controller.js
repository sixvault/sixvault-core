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

        // Check if authenticated user is a dosen_wali
        if (req.user.type !== "dosen_wali") {
            return res.status(403).json({
                status: "error",
                message: process.env.DEBUG
                    ? "Only dosen_wali can add nilai"
                    : "Unauthorized",
                data: {},
            });
        }

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
            const { nim, kode, nama, nilai } = item;
            const nip = req.user.nim_nip; // Use authenticated user's NIP

            if (!nim || !kode || !nama || !nilai) {
                return res.status(400).json({
                    status: "error",
                    message:
                        'Each entry must include "nim", "kode", "nama", and "nilai"',
                    data: {},
                });
            }

            // Check if mahasiswa exists and if the authenticated dosen_wali is their advisor
            const mahasiswa = await prisma.mahasiswa.findFirst({
                where: {
                    nim_nip: nim,
                    nim_nip_dosen_wali: req.user.nim_nip,
                },
                include: {
                    user: true,
                    dosenWali: {
                        include: {
                            user: true,
                        },
                    },
                },
            });

            if (!mahasiswa) {
                return res.status(403).json({
                    status: "error",
                    message: process.env.DEBUG
                        ? `You are not the dosen wali for mahasiswa ${nim} or mahasiswa not found`
                        : "Unauthorized",
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

            // Encrypt data with AES
            const keyBytes = crypto.randomBytes(16); // 128 bits = 16 bytes
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

            // Create SelfKey for mahasiswa, dosen_wali, and kaprodi
            const usersToCreateSelfKey = [
                {
                    nim_nip: mahasiswa.user.nim_nip,
                    rsaPublicKey: mahasiswa.user.rsaPublicKey,
                }, // mahasiswa
                {
                    nim_nip: mahasiswa.dosenWali.user.nim_nip,
                    rsaPublicKey: mahasiswa.dosenWali.user.rsaPublicKey,
                }, // dosen_wali
            ];

            // Find kaprodi of the same prodi
            const kaprodi = await prisma.kaprodi.findFirst({
                include: {
                    user: true,
                },
                where: {
                    user: {
                        prodi: mahasiswa.user.prodi,
                    },
                },
            });

            if (kaprodi) {
                usersToCreateSelfKey.push({
                    nim_nip: kaprodi.user.nim_nip,
                    rsaPublicKey: kaprodi.user.rsaPublicKey,
                }); // kaprodi
            }

            // Create SelfKey for each user
            for (const userInfo of usersToCreateSelfKey) {
                if (userInfo.rsaPublicKey) {
                    const rsaEncryptedAesKey = RSA.encrypt(
                        keyHex,
                        userInfo.rsaPublicKey,
                    );

                    await prisma.selfKey.create({
                        data: {
                            daftar_nilai_id: daftarNilai.id,
                            user_nim_nip: userInfo.nim_nip,
                            rsa_encrypted_aes_key: rsaEncryptedAesKey,
                        },
                    });
                }
            }

            const shares = shamir.generateShares(keyBigInt, totalDosen, 3);

            const shareRecords = dosenList.map((dosen, idx) =>
                prisma.share.create({
                    data: {
                        daftar_nilai_id: daftarNilai.id,
                        nip: dosen.nim_nip,
                        share_index: Number(shares[idx][0]),
                        share_value: shares[idx][1].toString(),
                        is_advisor:
                            dosen.nim_nip === mahasiswa.nim_nip_dosen_wali,
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
        const { nim_nip } = req.params;
        const authenticatedUser = req.user;

        // Check if the authenticated user has permission to view this mahasiswa's nilai
        let hasPermission = false;
        let errorMessage = "Unauthorized to view this data";

        // Case 1: If authenticated user is the mahasiswa themselves
        if (
            authenticatedUser.nim_nip === nim_nip &&
            authenticatedUser.type === "mahasiswa"
        ) {
            hasPermission = true;
        }
        // Case 2: If authenticated user is dosen_wali of the mahasiswa
        else if (authenticatedUser.type === "dosen_wali") {
            const mahasiswa = await prisma.mahasiswa.findFirst({
                where: {
                    nim_nip: nim_nip,
                    nim_nip_dosen_wali: authenticatedUser.nim_nip,
                },
            });
            if (mahasiswa) {
                hasPermission = true;
            }
        }
        // Case 3: If authenticated user is kaprodi of the same prodi as the mahasiswa
        else if (authenticatedUser.type === "kaprodi") {
            const mahasiswa = await prisma.mahasiswa.findFirst({
                where: { nim_nip: nim_nip },
                include: {
                    user: true,
                },
            });
            if (mahasiswa && mahasiswa.user.prodi === authenticatedUser.prodi) {
                hasPermission = true;
            }
        }

        if (!hasPermission) {
            return res.status(403).json({
                status: "error",
                message: process.env.DEBUG ? errorMessage : "Unauthorized",
                data: {},
            });
        }

        // Verify the target mahasiswa exists
        const mahasiswaUser = await prisma.user.findUnique({
            where: { nim_nip: nim_nip },
        });

        if (!mahasiswaUser || mahasiswaUser.type !== "mahasiswa") {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? `Invalid or non-mahasiswa user: ${nim_nip}`
                    : "Invalid User",
                data: {},
            });
        }

        // Get all DaftarNilai records for this mahasiswa with their encrypted AES keys
        // The self_keys are filtered to only include keys encrypted with the authenticated user's public key
        const nilaiRecords = await prisma.daftarNilai.findMany({
            where: { nim: nim_nip },
            include: {
                self_keys: {
                    where: {
                        user_nim_nip: authenticatedUser.nim_nip,
                    },
                },
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
        const formattedRecords = nilaiRecords.map((record) => {
            // Get the RSA encrypted AES key that was encrypted with the authenticated user's public key
            // This ensures:
            // - If viewer is mahasiswa: returns key encrypted with mahasiswa's public key
            // - If viewer is dosen_wali: returns key encrypted with dosen_wali's public key
            // - If viewer is kaprodi: returns key encrypted with kaprodi's public key
            const userSpecificSelfKey = record.self_keys.find(
                (key) => key.user_nim_nip === authenticatedUser.nim_nip,
            );

            return {
                id: record.id,
                nim: record.nim,
                nip_dosen: record.nip_dosen,
                encrypted_data: {
                    kode: record.kode,
                    nama: record.nama,
                    nilai: record.nilai,
                },
                rsa_encrypted_aes_key: userSpecificSelfKey
                    ? userSpecificSelfKey.rsa_encrypted_aes_key
                    : null,
            };
        });

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
                    nim,
                    requester_nip,
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
    const { requester_nip } = req.query;

    const existingReq = await prisma.keyRequest.findMany({
        where: {
            requester_nip,
        },
    });

    if (!existingReq || existingReq.length === 0) {
        return res.status(400).json({
            status: "error",
            message: process.env.DEBUG
                ? "Teacher hasn't made any request"
                : "Invalid Request",
        });
    }

    try {
        const requests = await prisma.keyRequest.findMany({
            where: {
                requester_nip,
            },
            include: {
                approvals: true,
            },
            orderBy: {
                created_at: "desc",
            },
        });

        const result = [];

        for (const request of requests) {
            const { status, approvals, nim } = request;

            let includeNilai = false;
            let decryptedData = null;
            let daftarNilaiEntry = null;

            const mahasiswa = await prisma.mahasiswa.findFirst({
                where: { nim_nip: nim },
            });

            console.log("Entry: ", request);

            if (status !== "approved") {
                return res.status(403).json({
                    status: "error",
                    message:
                        "Access denied. Request not approved by other teachers",
                });
            }

            if (status === "approved") {
                const waliApproved = approvals.some(
                    (a) =>
                        a.nip === mahasiswa?.nim_nip_dosen_wali &&
                        a.approved === true,
                );

                console.log(waliApproved);
                console.log(mahasiswa.nim_nip_dosen_wali);
                if (!waliApproved) {
                    return res.status(403).json({
                        status: "error",
                        message:
                            "Access denied. Request not approved by dosen wali",
                    });
                }

                const approvedTeacherNips = approvals
                    .filter((a) => a.approved)
                    .map((a) => a.nip);

                const allNilai = await prisma.daftarNilai.findMany({
                    where: {
                        nim: nim,
                        nip_dosen: mahasiswa.nim_nip_dosen_wali,
                    },
                    include: {
                        shares: {
                            where: {
                                nip: { in: approvedTeacherNips },
                            },
                        },
                    },
                });

                for (const n of allNilai) {
                    if (waliApproved && n.shares.length >= 3) {
                        try {
                            const formattedShares = n.shares.map((s) => [
                                BigInt(s.share_index),
                                BigInt(s.share_value),
                            ]);

                            console.log("Shares: ", n.shares);

                            const aesKey =
                                shamir.reconstructSecret(formattedShares);
                            const aesKeyHex = aesKey
                                .toString(16)
                                .padStart(32, "0");

                            console.log("Key: ", aesKey);
                            console.log("Key(hex): ", aesKeyHex);

                            decryptedData = {
                                nim: n.nim,
                                kode: aes.decrypt(n.kode, aesKeyHex),
                                nama: aes.decrypt(n.nama, aesKeyHex),
                                nilai: aes.decrypt(n.nilai, aesKeyHex),
                            };

                            console.log("Decrypted: ", decryptedData);

                            includeNilai = true;
                            daftarNilaiEntry = n;
                            break; // exit after first valid decryption
                        } catch (decryptionError) {
                            console.warn(
                                "Failed to decrypt for request ID",
                                request.id,
                            );
                        }
                    }
                }
            }

            result.push({
                key_request_id: request.id,
                daftar_nilai_id: daftarNilaiEntry?.id || null,
                status: request.status,
                created_at: request.created_at,
                approvals_count: approvals.filter((a) => a.approved).length,
                shares: approvals.map((a) => ({
                    teacher_nip: a.nip,
                    approved: a.approved,
                    approved_at: a.approved_at,
                })),
                daftar_nilai: daftarNilaiEntry
                    ? {
                          ...daftarNilaiEntry,
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
