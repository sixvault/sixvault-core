const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const list = async (req, res) => {
    try {
        const kaprodi = await prisma.user.findMany({
            where: {
                type: "kaprodi",
            },
        });

        return res.status(200).json({
            status: "success",
            message: "List kaprodi fetched successfully",
            data: kaprodi
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
    list,
};
