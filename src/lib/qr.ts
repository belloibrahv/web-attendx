import { addMinutes } from "date-fns";

export type SessionPayload = {
  sessionId: string;
  courseId: string;
  token: string;
  expires: string;
};

// Server-side only functions
let cryptoModule: typeof import("crypto") | null = null;

async function getCrypto() {
  if (typeof window === "undefined" && !cryptoModule) {
    cryptoModule = await import("crypto");
  }
  return cryptoModule;
}

export async function generateSessionToken() {
  const crypto = await getCrypto();
  if (!crypto) {
    throw new Error("Cannot generate token on client side");
  }
  return crypto.randomBytes(32).toString("hex");
}

export async function constantTimeEquals(a: string, b: string) {
  const crypto = await getCrypto();
  if (!crypto) {
    throw new Error("Cannot compare tokens on client side");
  }
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
}

// Shared functions (work on both client and server)
export function buildSessionPayload(input: {
  sessionId: string;
  courseId: string;
  token: string;
  ttlMinutes: number;
}) {
  const expiresAt = addMinutes(new Date(), input.ttlMinutes);
  const payload: SessionPayload = {
    sessionId: input.sessionId,
    courseId: input.courseId,
    token: input.token,
    expires: expiresAt.toISOString(),
  };
  return { payload, expiresAt };
}

export function encodePayload(payload: SessionPayload): string {
  const jsonString = JSON.stringify(payload);
  
  // Use browser-compatible base64url encoding
  if (typeof window !== "undefined") {
    // Client-side: use btoa
    const base64 = btoa(jsonString);
    // Convert to base64url format
    return base64.replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
  } else {
    // Server-side: use Buffer
    return Buffer.from(jsonString, "utf-8").toString("base64url");
  }
}

export function decodePayload(encoded: string): SessionPayload {
  try {
    let jsonString: string;
    
    if (typeof window !== "undefined") {
      // Client-side: use atob
      // Convert base64url to base64
      let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
      // Add padding if needed
      while (base64.length % 4) {
        base64 += "=";
      }
      jsonString = atob(base64);
    } else {
      // Server-side: use Buffer
      jsonString = Buffer.from(encoded, "base64url").toString("utf-8");
    }
    
    const payload = JSON.parse(jsonString);
    
    // Validate payload structure
    if (!payload.sessionId || !payload.courseId || !payload.token || !payload.expires) {
      throw new Error("Invalid payload structure");
    }
    
    return payload as SessionPayload;
  } catch (error) {
    console.error("Failed to decode payload:", error);
    throw new Error("Invalid QR code format");
  }
}

