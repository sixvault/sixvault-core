const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const {
    signAccessToken,
    signRefreshToken,
} = require("../../../utils/auth/jwt/sign");
const rsa = require("../../../utils/crypto/RSA");
const AES = require("../../../utils/crypto/AES");
const crypto = require("crypto");

const register = async (req, res) => {
    try {
        const { nim_nip, type, prodi, rsaPublicKey, nama } = req.body;

        if (!nim_nip || !type || !prodi || !rsaPublicKey || !nama) {
            return res.status(400).json({
                status: "error",
                message:
                    'Parameter "nim_nip", "type", "prodi", "rsaPublicKey", and "nama" required',
                data: {},
            });
        }

        if (!["mahasiswa", "dosen_wali", "kaprodi"].includes(type)) {
            return res.status(400).json({
                status: "error",
                message:
                    'Parameter "type" must be "mahasiswa", "dosen_wali", or "kaprodi"',
                data: {},
            });
        }

        if (
            !["teknik_informatika", "sistem_dan_teknologi_informasi"].includes(
                prodi,
            )
        ) {
            return res.status(400).json({
                status: "error",
                message:
                    'Parameter "prodi" must be "teknik_informatika" or "sistem_dan_teknologi_informasi"',
                data: {},
            });
        }

        const existingUser = await prisma.user.findUnique({
            where: { nim_nip },
        });

        if (existingUser) {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? "User already registered"
                    : "Bad Request",
                data: {},
            });
        }

        await prisma.user.create({
            data: {
                nim_nip,
                rsaPublicKey,
                nama,
                type,
                prodi,
            },
        });

        let newUser;
        // 2. Create user type record referencing nim_nip
        switch (type) {
            case "mahasiswa":
                newUser = await prisma.mahasiswa.create({
                    data: {
                        nim_nip,
                    },
                    include: {
                        user: true,
                    },
                });
                break;
            case "dosen_wali":
                newUser = await prisma.dosenWali.create({
                    data: {
                        nim_nip,
                    },
                    include: {
                        user: true,
                    },
                });
                break;
            case "kaprodi":
                newUser = await prisma.kaprodi.create({
                    data: {
                        nim_nip,
                    },
                    include: {
                        user: true,
                    },
                });
                break;
        }

        const userTokenSign = {
            nim_nip: nim_nip,
            type: type,
            prodi: prodi,
        };

        const tokenKey = crypto.randomUUID();

        const aes = new AES();
        const encryptedAccessToken = aes.encrypt(
            signAccessToken(userTokenSign),
            tokenKey,
        );
        const encryptedRefreshToken = aes.encrypt(
            signRefreshToken(userTokenSign),
            tokenKey,
        );

        return res.status(200).json({
            status: "success",
            message: "Registration successful",
            data: {
                nim_nip: nim_nip,
                access_token: encryptedAccessToken,
                refresh_token: encryptedRefreshToken,
                encrypted_token_key: rsa.encrypt(tokenKey, rsaPublicKey),
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

const login = async (req, res) => {
    try {
        const { nim_nip, rsaPublicKey } = req.body;

        if (!nim_nip || !rsaPublicKey) {
            return res.status(400).json({
                status: "error",
                message: 'Parameter "nim_nip" and "rsaPublicKey" required',
                data: {},
            });
        }

        const user = await prisma.user.findUnique({
            where: { nim_nip },
        });

        if (!user) {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? "User not Found"
                    : "Invalid Credentials",
                data: {},
            });
        }

        if (rsaPublicKey != user.rsaPublicKey) {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? "NIM/NIP and rsaPublicKey doesn't match"
                    : "Invalid Credentials",
                data: {},
            });
        }

        const userTokenSign = {
            nim_nip: nim_nip,
            type: user.type,
            prodi: user.prodi,
        };

        const tokenKey = crypto.randomUUID();

        const aes = new AES();
        const encryptedAccessToken = aes.encrypt(
            signAccessToken(userTokenSign),
            tokenKey,
        );
        const encryptedRefreshToken = aes.encrypt(
            signRefreshToken(userTokenSign),
            tokenKey,
        );

        return res.status(200).json({
            status: "success",
            message: "Login successful",
            data: {
                nim_nip: nim_nip,
                type: user.type,
                prodi: user.prodi,
                access_token: encryptedAccessToken,
                refresh_token: encryptedRefreshToken,
                encrypted_token_key: rsa.encrypt(tokenKey, rsaPublicKey),
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

const refresh = async (req, res) => {
    const userTokenSign = {
        nim_nip: req.user.nim_nip,
        type: req.user.type,
        prodi: req.user.prodi,
    };

    return res.status(200).json({
        status: "success",
        message: "Token Refresh Success",
        data: {
            nim_nip: req.user.nim_nip,
            type: req.user.type,
            prodi: req.user.prodi,
            access_token: signAccessToken(userTokenSign),
            // refresh_token: signRefreshToken(userTokenSign)
        },
    });
};

const verify = async (req, res) => {
    const userTokenSign = {
        nim_nip: req.user.nim_nip,
        type: req.user.type,
        prodi: req.user.prodi,
    };

    return res.status(200).json({
        status: "success",
        message: "Verify auth Success",
        data: {
            nim_nip: req.user.nim_nip,
            type: req.user.type,
            prodi: req.user.prodi,
            access_token: signAccessToken(userTokenSign),
            // refresh_token: signRefreshToken(userTokenSign)
        },
    });
};

module.exports = {
    register,
    login,
    refresh,
    verify
};
