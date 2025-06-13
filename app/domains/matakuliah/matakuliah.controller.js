const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const add = async (req, res) => {
    try {
        const data = req.body;
        const inserted = await prisma.mataKuliah.createMany({
            data,
            skipDuplicates: true,
        });
        res.json({ status: "success", message: "Added matakuliah success" });
    } catch (err) {
        res.status(500).json({ status: "error", message: err.message });
    }
};

module.exports = {
    add,
};
