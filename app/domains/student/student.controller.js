const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const search = async (req, res) => {
    try {
        const { nim_nip } = req.body;

        if (!nim_nip) {
            return res.status(400).json({
                status: "error",
                message: 'Parameter "nim" required!',
                data: {},
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { nim_nip },
        });

        if (!existingUser) {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? "User not Found"
                    : "Invalid Credentials",
                data: {},
            });
        }

        if (existingUser.type != "mahasiswa") {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? "User Error"
                    : "Invalid Type of User",
                data: {},
            });
        }

        return res.status(200).json({
            status: "success",
            message: "Student Found!",
            data: {
                nama: existingUser.nama,
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

const add_data = async (req, res) => {
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

        const validData = [];

        for (const item of dataArray) {
            const { nim, kode, nama, nilai } = item;

            if (!nim || !kode || !nama || !nilai) {
                return res.status(400).json({
                    status: "error",
                    message:
                        'Each entry must include "nim", "kode", "nama", and "nilai"',
                    data: {},
                });
            }

            const user = await prisma.user.findUnique({
                where: { nim_nip: nim },
            });

            if (!user) {
                return res.status(400).json({
                    status: "error",
                    message: process.env.DEBUG
                        ? `User with NIM ${nim} not found`
                        : "Invalid User",
                    data: {},
                });
            }

            if (user.type !== "mahasiswa") {
                return res.status(400).json({
                    status: "error",
                    message: process.env.DEBUG
                        ? `User ${nim} is not mahasiswa`
                        : "Unauthorized User",
                    data: {},
                });
            }

            // Validate mata kuliah
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

            validData.push({ nim, kode, nama, nilai });
        }

        await prisma.daftarNilai.createMany({
            data: validData,
            skipDuplicates: true,
        });

        return res.status(200).json({
            status: "success",
            message: "All valid nilai entries inserted",
            data: {
                count: validData.length,
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

module.exports = {
    search,
    add_data,
};
