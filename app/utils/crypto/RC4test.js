const { encrypt, decrypt } = require("./RC4");

function testRC4(message, key) {
  console.log("========================================");
  console.log(`🔑 Key:        "${key}"`);
  console.log(`📨 Plaintext:  "${message}"`);

  const encrypted = encrypt(message, key);
  console.log(`🔒 Encrypted:  "${encrypted}"`);

  const decrypted = decrypt(encrypted, key);
  console.log(`🔓 Decrypted:  "${decrypted}"`);

  if (decrypted === message) {
    console.log("✅ Test Passed: Decrypted matches original\n");
  } else {
    console.error("❌ Test Failed: Decrypted does NOT match original\n");
  }
}

// Run a suite of tests
function runTests() {
  console.log("======== RC4 ENCRYPTION/DECRYPTION TESTS ========\n");

  // Normal ASCII
  testRC4("Hello, World!", "secretkey");

  // Short key
  testRC4("This is a test message.", "k");

  // Long key
  testRC4("Testing with a much longer encryption key than usual.", "averyveryverylongkeythatexceeds256");

  // Unicode characters
  testRC4("😃🔥🎉 中文测试 النص العربي", "🔑🔥key");

  // Empty string
  testRC4("", "somekey");

  // Empty key
  try {
    testRC4("This should fail with empty key", "");
  } catch (err) {
    console.error("❗ Caught expected error with empty key:", err.message, "\n");
  }

  // Repeated encryption results
  const msg = "Repeat check";
  const key = "repeatkey";
  const enc1 = encrypt(msg, key);
  const enc2 = encrypt(msg, key);
  console.log("🔁 Repeat encryption consistent:", enc1 === enc2 ? "✅" : "❌");
}

runTests();