const crypto = require("crypto");
const AES = require("./AES"); // Replace with your AES module
const Shamir = require("./Shamir");
const aes = new AES(); // if AES includes Shamir methods
const shamir = new Shamir();

function testAESAndShamir() {
    // === 1. Generate AES key (16 bytes) ===
    const aesKey = crypto.randomBytes(32); // 128-bit key
    const aesKeyHex = aesKey.toString("hex"); // hex string for AES
    const aesKeyBigInt = BigInt("0x" + aesKeyHex); // BigInt for Shamir

    console.log("Original AES key (hex):", aesKeyHex);

    // === 2. Encrypt some data using AES ===
    const plaintext = "Hello, World!";
    const encrypted = aes.encrypt(plaintext, aesKeyHex);
    console.log("Encrypted:", encrypted);

    // === 3. Generate shares ===
    const shares = shamir.generateShares(aesKeyBigInt, 5, 3); // n = 5, k = 3
    console.log(
        "Shares:",
        shares.map(([x, y]) => `(${x.toString()}, ${y.toString()})`),
    );

    // === 4. Simulate retrieving any 3 shares ===
    const selectedShares = shares.slice(0, 3); // pick first 3 shares
    const reconstructedBigInt = shamir.reconstructSecret(selectedShares);

    // === 5. Convert back to key ===
    const reconstructedHex = reconstructedBigInt.toString(16).padStart(32, "0");
    console.log("Reconstructed key (hex):", reconstructedHex);

    // === 6. Decrypt the ciphertext ===
    const decrypted = aes.decrypt(encrypted, reconstructedHex);
    console.log("Decrypted:", decrypted);

    // === 7. Check match ===
    if (decrypted === plaintext) {
        console.log("✅ Success: Decryption matches original");
    } else {
        console.error("❌ Failed: Decrypted text does not match");
    }
}

testAESAndShamir();
