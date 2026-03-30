import { addMinutes } from "date-fns";
import { randomBytes, timingSafeEqual } from "crypto";

export type SessionPayload = {
  sessionId: string;
  courseId: string;
  token: string;
  expires: string;
};

export function generateSessionToken() {
  return randomBytes(32).toString("hex");
}

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

export function encodePayload(payload: SessionPayload) {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

export function decodePayload(encoded: string): SessionPayload {
  const decoded = Buffer.from(encoded, "base64url").toString("utf-8");
  return JSON.parse(decoded) as SessionPayload;
}

export function constantTimeEquals(a: string, b: string) {
  const aBuf = Buffer.from(a);
  const bBuf = Buffer.from(b);
  if (aBuf.length !== bBuf.length) return false;
  return timingSafeEqual(aBuf, bBuf);
}

