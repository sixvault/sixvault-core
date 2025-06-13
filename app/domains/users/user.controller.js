const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const remove = async (req, res) => {
    try {
        const { nim_nip } = req.body;

        if (!Array.isArray(nim_nip) || nim_nip.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "nim_nip must be a non-empty array",
            });
        }

        const deleted = await prisma.mahasiswa.deleteMany({
            where: {
                nim_nip: {
                    in: nim_nip,
                },
            },
        });

        res.json({
            status: "success",
            message: `${deleted.count} mahasiswa deleted`,
        });
    } catch (err) {
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

module.exports = {
    remove,
};
