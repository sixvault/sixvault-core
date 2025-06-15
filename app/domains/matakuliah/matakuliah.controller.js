const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const add = async (req, res) => {
    try {
        // Check if user is kaprodi
        if (req.user.type !== "kaprodi") {
            return res.status(403).json({
                status: "error",
                message: "Access denied. Only kaprodi can add matakuliah",
            });
        }

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
                item.sks === null ||
                !item.prodi
            ) {
                console.log(item);
                return res.status(400).json({
                    status: "error",
                    message:
                        "Each matakuliah must have 'kode', 'matakuliah', 'sks', and 'prodi'",
                });
            }

            // Check if matakuliah prodi matches user's prodi
            if (item.prodi !== req.user.prodi) {
                return res.status(403).json({
                    status: "error",
                    message:
                        "You can only add matakuliah for your own program study",
                });
            }
        }

        const inserted = await prisma.mataKuliah.createMany({
            data,
            skipDuplicates: true,
        });

        res.status(200).json({
            status: "success",
            message: "Added matakuliah success",
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

const list = async (req, res) => {
    try {
        // Only get matakuliah for user's prodi
        const matakuliah = await prisma.mataKuliah.findMany({
            where: {
                prodi: req.user.prodi,
            },
        });

        res.status(200).json({
            status: "success",
            message: "List matakuliah success",
            data: matakuliah,
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({
            status: "error",
            message: err.message,
        });
    }
};

const remove = async (req, res) => {
    try {
        // Check if user is kaprodi
        if (req.user.type !== "kaprodi") {
            return res.status(403).json({
                status: "error",
                message: "Access denied. Only kaprodi can remove matakuliah",
            });
        }

        const { kodeList } = req.body;

        if (!Array.isArray(kodeList) || kodeList.length === 0) {
            return res.status(400).json({
                status: "error",
                message: "kodeList must be a non-empty array",
            });
        }

        // Only delete matakuliah for user's prodi
        const deleted = await prisma.mataKuliah.deleteMany({
            where: {
                kode: {
                    in: kodeList,
                },
                prodi: req.user.prodi,
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
