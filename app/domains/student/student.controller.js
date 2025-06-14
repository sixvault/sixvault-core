const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const search = async (req, res) => {
    try {
        const { nim_nip } = req.body;

        if (!nim_nip) {
            return res.status(400).json({
                status: "error",
                message: 'Parameter "nim" required!',
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
            });
        }

        if (existingUser.type != "mahasiswa") {
            return res.status(400).json({
                status: "error",
                message: process.env.DEBUG
                    ? "User Error"
                    : "Invalid Type of User",
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
        });
    }
};

module.exports = {
    search,
};
