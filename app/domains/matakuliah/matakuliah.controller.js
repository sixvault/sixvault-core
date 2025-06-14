const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const add = async (req, res) => {
    try {
        const data = req.body;

        // Check that data is an array
        if (!Array.isArray(data)) {
            return res.status(400).json({
                status: "error",
                message: "Input must be an array of matakuliah objects",
            });
        }

        // Validate each object
        for (const item of data) {
            if (
                !item.kode ||
                !item.matakuliah ||
                item.sks === undefined ||
                item.sks === null
            ) {
                console.log(item);
                return res.status(400).json({
                    status: "error",
                    message:
                        "Each matakuliah must have 'kode', 'matakuliah', and 'sks'",
                });
            }
        }

        const inserted = await prisma.mataKuliah.createMany({
            data,
            skipDuplicates: true,
        });

        res.status(200).json({ 
            status: "success", 
            message: "Added matakuliah success" 
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            status: "error", 
            message: err.message 
        });
    }
};

const list = async (req, res) => {
    try {
        const matakuliah = await prisma.mataKuliah.findMany();

        res.status(200).json({ 
            status: "success", 
            message: "List matakuliah success",
            data: matakuliah
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ 
            status: "error", 
            message: err.message 
        });
    }
};

const remove = async (req, res) => {
    try {
        const { kodeList } = req.body;

        if (!Array.isArray(kodeList) || kodeList.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "kodeList must be a non-empty array",
            });
        }

        const deleted = await prisma.mataKuliah.deleteMany({
            where: {
                kode: {
                    in: kodeList,
                },
            },
        });

        res.json({
            status: "success",
            message: `${deleted.count} matakuliah deleted`,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};



module.exports = {
    add,
    list,
    remove,
};
