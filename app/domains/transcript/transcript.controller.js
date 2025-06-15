const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const nodeLatex = require('node-latex');
const { encrypt, decrypt: rc4Decrypt } = require('../../utils/crypto/RC4');
const uploadPDF = require('../../configs/storage/cloudflare-r2/s3.client');
const { S3Client, GetObjectCommand } = require('@aws-sdk/client-s3');
const fs = require('fs');
const path = require('path');

const tempDir = path.join(__dirname, 'temp');

// Ensure temp directory exists
fs.mkdirSync(tempDir, { recursive: true });

// Initialize S3 client for R2
const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY,
        secretAccessKey: process.env.R2_SECRET_KEY,
    },
});

const generate = async (req, res) => {
    try {
        const { nim, latex, encrypted, password } = req.body;

        // Validate required fields
        if (!nim) {
            return res.status(400).json({
                status: "error",
                message: "NIM is required",
            });
        }

        if (!latex) {
            return res.status(400).json({
                status: "error",
                message: "LaTeX content is required",
            });
        }

        if (encrypted && !password) {
            return res.status(400).json({
                status: "error",
                message: "Password is required when encryption is enabled",
            });
        }

        // Prepare LaTeX content
        let latexContent = latex;
        if (encrypted) { 
            latexContent = encrypt(latex, password); 
        }

        // Write LaTeX to temp file
        const texFilePath = path.join(tempDir, `${nim}.tex`);
        const pdfFilePath = path.join(tempDir, `${nim}.pdf`);
        
        fs.writeFileSync(texFilePath, latexContent);

        // Generate PDF from LaTeX using stream approach
        // Note: TypeScript shows error but node-latex works correctly at runtime
        const input = fs.createReadStream(texFilePath);
        const output = fs.createWriteStream(pdfFilePath);
        const pdfStream = nodeLatex(input);

        await new Promise((resolve, reject) => {
            pdfStream.pipe(output);
            pdfStream.on('error', reject);
            pdfStream.on('finish', resolve);
        });

        // Upload to Cloudflare R2
        let pdfURL;
        if (encrypted) {
            pdfURL = await uploadPDF(pdfFilePath, `encrypted/${nim}.pdf`);
        } else {
            pdfURL = await uploadPDF(pdfFilePath, `transcript/${nim}.pdf`);
        }

        // Clean up temp files
        fs.unlinkSync(texFilePath);
        fs.unlinkSync(pdfFilePath);

        return res.status(200).json({
            status: "success",
            message: "PDF generated and uploaded successfully",
            data: {
                url: pdfURL,
                nim: nim,
                encrypted: encrypted
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            status: "error",
            message: process.env.DEBUG ? err.message : "Bad Request",
        });
    }
};

const decrypt = async (req, res) => {
    try {
        const { nim, password } = req.body;

        // Validate required fields
        if (!nim) {
            return res.status(400).json({
                status: "error",
                message: "NIM is required",
            });
        }

        if (!password) {
            return res.status(400).json({
                status: "error",
                message: "Password is required for decryption",
            });
        }

        // Download encrypted PDF from R2
        const encryptedFilePath = `encrypted/${nim}.pdf`;
        const encryptedPdfPath = path.join(tempDir, `${nim}_encrypted.pdf`);
        const decryptedPdfPath = path.join(tempDir, `${nim}_decrypted.pdf`);

        try {
            const getObjectCommand = new GetObjectCommand({
                Bucket: process.env.R2_BUCKET,
                Key: encryptedFilePath,
            });

            const response = await s3Client.send(getObjectCommand);
            
            // Convert stream to buffer
            const streamToBuffer = async (stream) => {
                const chunks = [];
                return new Promise((resolve, reject) => {
                    stream.on('data', chunk => chunks.push(chunk));
                    stream.on('error', reject);
                    stream.on('end', () => resolve(Buffer.concat(chunks)));
                });
            };
            
            const fileBuffer = await streamToBuffer(response.Body);
            fs.writeFileSync(encryptedPdfPath, fileBuffer);
        } catch (downloadError) {
            return res.status(404).json({
                status: "error",
                message: "Encrypted PDF not found for this NIM",
            });
        }

        // Read and decrypt the file
        const encryptedData = fs.readFileSync(encryptedPdfPath, 'utf8');
        const decryptedBase64 = rc4Decrypt(encryptedData, password);
        const decryptedBuffer = Buffer.from(decryptedBase64, 'base64');

        // Write decrypted PDF to temp file
        fs.writeFileSync(decryptedPdfPath, decryptedBuffer);

        // Upload decrypted PDF to transcript folder
        const pdfURL = await uploadPDF(decryptedPdfPath, `transcript/${nim}.pdf`);

        // Clean up temp files
        fs.unlinkSync(encryptedPdfPath);
        fs.unlinkSync(decryptedPdfPath);

        return res.status(200).json({
            status: "success",
            message: "PDF decrypted and uploaded successfully",
            data: {
                url: pdfURL,
                nim: nim
            }
        });

    } catch (err) {
        console.error(err);
        return res.status(400).json({
            status: "error",
            message: process.env.DEBUG ? err.message : "Decryption failed",
        });
    }
}

module.exports = {
    generate,
    decrypt,
};
