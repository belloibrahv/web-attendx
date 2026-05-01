/**
 * Test script to verify QR code encoding/decoding
 * Run with: node test-qr-encoding.js
 */

// Server-side encoding (Node.js Buffer)
function encodePayloadServer(payload) {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

// Server-side decoding (Node.js Buffer)
function decodePayloadServer(encoded) {
  const decoded = Buffer.from(encoded, "base64url").toString("utf-8");
  return JSON.parse(decoded);
}

// Client-side encoding (browser-compatible)
function encodePayloadClient(payload) {
  const jsonString = JSON.stringify(payload);
  const base64 = Buffer.from(jsonString, "utf-8").toString("base64");
  // Convert to base64url format
  return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

// Client-side decoding (browser-compatible)
function decodePayloadClient(encoded) {
  // Convert base64url to base64
  let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
  // Add padding if needed
  while (base64.length % 4) {
    base64 += "=";
  }
  const jsonString = Buffer.from(base64, "base64").toString("utf-8");
  return JSON.parse(jsonString);
}

// Test payload
const testPayload = {
  sessionId: "cm9abc123def456",
  courseId: "cm8xyz789ghi012",
  token: "a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6a7b8c9d0e1f2",
  expires: new Date().toISOString(),
};

console.log("=== QR Code Encoding/Decoding Test ===\n");
console.log("Original Payload:");
console.log(JSON.stringify(testPayload, null, 2));
console.log("\n");

// Test server-side encoding
console.log("--- Server-Side Encoding ---");
const serverEncoded = encodePayloadServer(testPayload);
console.log("Encoded (length):", serverEncoded.length);
console.log("Encoded (first 50 chars):", serverEncoded.substring(0, 50));
console.log("Encoded (full):", serverEncoded);
console.log("\n");

// Test server-side decoding
console.log("--- Server-Side Decoding ---");
const serverDecoded = decodePayloadServer(serverEncoded);
console.log("Decoded:", JSON.stringify(serverDecoded, null, 2));
console.log("Match:", JSON.stringify(testPayload) === JSON.stringify(serverDecoded) ? "✓" : "✗");
console.log("\n");

// Test client-side encoding
console.log("--- Client-Side Encoding ---");
const clientEncoded = encodePayloadClient(testPayload);
console.log("Encoded (length):", clientEncoded.length);
console.log("Encoded (first 50 chars):", clientEncoded.substring(0, 50));
console.log("Encoded (full):", clientEncoded);
console.log("\n");

// Test client-side decoding
console.log("--- Client-Side Decoding ---");
const clientDecoded = decodePayloadClient(clientEncoded);
console.log("Decoded:", JSON.stringify(clientDecoded, null, 2));
console.log("Match:", JSON.stringify(testPayload) === JSON.stringify(clientDecoded) ? "✓" : "✗");
console.log("\n");

// Test cross-compatibility
console.log("--- Cross-Compatibility Test ---");
console.log("Server encode -> Client decode:");
try {
  const crossDecoded1 = decodePayloadClient(serverEncoded);
  console.log("  Result:", JSON.stringify(crossDecoded1, null, 2));
  console.log("  Match:", JSON.stringify(testPayload) === JSON.stringify(crossDecoded1) ? "✓" : "✗");
} catch (error) {
  console.log("  Error:", error.message);
}

console.log("\nClient encode -> Server decode:");
try {
  const crossDecoded2 = decodePayloadServer(clientEncoded);
  console.log("  Result:", JSON.stringify(crossDecoded2, null, 2));
  console.log("  Match:", JSON.stringify(testPayload) === JSON.stringify(crossDecoded2) ? "✓" : "✗");
} catch (error) {
  console.log("  Error:", error.message);
}

console.log("\n=== Test Complete ===");

// Verify both encodings are identical
if (serverEncoded === clientEncoded) {
  console.log("\n✓ SUCCESS: Server and client encodings are identical!");
} else {
  console.log("\n✗ WARNING: Server and client encodings differ!");
  console.log("Server:", serverEncoded);
  console.log("Client:", clientEncoded);
}
