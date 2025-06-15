function rc4(key, text) {
    const s = [];
    let j = 0;
    let x;
    const res = [];
  
    // KSA - Key Scheduling Algorithm
    for (let i = 0; i < 256; i++) {
      s[i] = i;
    }
  
    for (let i = 0; i < 256; i++) {
      j = (j + s[i] + key.charCodeAt(i % key.length)) % 256;
      [s[i], s[j]] = [s[j], s[i]];
    }
  
    // PRGA - Pseudo-Random Generation Algorithm
    let i = 0;
    j = 0;
    for (let y = 0; y < text.length; y++) {
      i = (i + 1) % 256;
      j = (j + s[i]) % 256;
      [s[i], s[j]] = [s[j], s[i]];
      const k = s[(s[i] + s[j]) % 256];
      res.push(String.fromCharCode(text.charCodeAt(y) ^ k));
    }
  
    return res.join('');
}
  
function encrypt(plainText, key) {
    const encrypted = rc4(key, plainText);
    return Buffer.from(encrypted, 'binary').toString('base64');
}

function decrypt(cipherTextBase64, key) {
    const encrypted = Buffer.from(cipherTextBase64, 'base64').toString('binary');
    return rc4(key, encrypted);
}
  
module.exports = {
    encrypt,
    decrypt,
};