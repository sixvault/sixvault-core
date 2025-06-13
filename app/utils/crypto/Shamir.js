const crypto = require("crypto");

class Shamir {
    PRIME = BigInt(
        "208351617316091241234326746312124448251235562226470491514186331217050270460481",
    );

    mod(a, p) {
        return ((a % p) + p) % p;
    }

    modInv(a, p) {
        let [t, newT] = [0n, 1n];
        let [r, newR] = [p, a];

        while (newR !== 0n) {
            const quotient = r / newR;
            [t, newT] = [newT, t - quotient * newT];
            [r, newR] = [newR, r - quotient * newR];
        }

        if (r > 1n) throw new Error("Not invertible");
        return this.mod(t, p);
    }

    generateShares(secret, n, k, p = this.PRIME) {
        const coeffs = [BigInt(secret)];
        for (let i = 1; i < k; i++) {
            coeffs.push(
                BigInt("0x" + crypto.randomBytes(16).toString("hex")) % p,
            );
        }

        const shares = [];
        for (let x = 1n; x <= BigInt(n); x++) {
            let y = 0n;
            for (let i = 0; i < k; i++) {
                y = this.mod(y + coeffs[i] * x ** BigInt(i), p);
            }
            shares.push([x, y]);
        }
        return shares;
    }

    reconstructSecret(shares, p = this.PRIME) {
        let secret = 0n;

        for (let i = 0; i < shares.length; i++) {
            const [xi, yi] = shares[i];
            let li = 1n;

            for (let j = 0; j < shares.length; j++) {
                if (i === j) continue;
                const [xj, _] = shares[j];
                const num = this.mod(-xj, p);
                const denom = this.mod(xi - xj, p);
                li = this.mod(li * num * this.modInv(denom, p), p);
            }

            secret = this.mod(secret + yi * li, p);
        }

        return secret;
    }

    bigIntToAesKey(bigintKey) {
        const hex = bigintKey.toString(16); // Convert to hex string
        const paddedHex = hex.padStart(64, "0"); // Pad to 32 bytes = 64 hex chars
        return Buffer.from(paddedHex, "hex");
    }
}

module.exports = Shamir;
