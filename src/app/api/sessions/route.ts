import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { ZodError } from "zod";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { buildSessionPayload, encodePayload, generateSessionToken } from "@/lib/qr";
import { expireOverdueSessions } from "@/lib/session-status";
import { createSessionSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    await expireOverdueSessions();
    const session = await getServerSession(authOptions);
    
    console.log("[Session Create] Request from user:", session?.user?.email);
    
    if (!session?.user?.id || session.user.role !== "LECTURER") {
      console.log("[Session Create] Unauthorized: No session or not a lecturer");
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    
    const lecturer = await db.lecturer.findUnique({
      where: { userId: session.user.id },
      select: { id: true, firstName: true, lastName: true },
    });
    
    if (!lecturer) {
      console.log("[Session Create] Lecturer profile not found for user:", session.user.id);
      return Response.json({ ok: false, message: "Lecturer profile not found." }, { status: 404 });
    }
    
    console.log("[Session Create] Lecturer found:", lecturer.id);

    const body = await req.json();
    console.log("[Session Create] Request body:", body);
    
    const input = createSessionSchema.parse(body);
    
    const course = await db.course.findFirst({
      where: {
        id: input.courseId,
        lecturerId: lecturer.id,
      },
      select: {
        id: true,
        courseCode: true,
        courseTitle: true,
      },
    });
    
    if (!course) {
      console.log("[Session Create] Course not found or not assigned to lecturer:", input.courseId);
      return Response.json({ ok: false, message: "You can only open sessions for your assigned courses." }, { status: 403 });
    }
    
    console.log("[Session Create] Course found:", course.courseCode);

    const existingActiveSession = await db.session.findFirst({
      where: {
        courseId: input.courseId,
        lecturerId: lecturer.id,
        status: "ACTIVE",
        expiryTime: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        expiryTime: true,
      },
      orderBy: {
        startTime: "desc",
      },
    });
    
    if (existingActiveSession) {
      console.log("[Session Create] Active session already exists:", existingActiveSession.id);
      return Response.json(
        {
          ok: false,
          message: `An active session already exists for this course until ${existingActiveSession.expiryTime.toLocaleTimeString()}.`,
          existingSessionId: existingActiveSession.id,
        },
        { status: 409 }
      );
    }

    console.log("[Session Create] Generating session token...");
    const token = await generateSessionToken();
    console.log("[Session Create] Token generated, length:", token.length);
    
    const seedSession = await db.session.create({
      data: {
        courseId: input.courseId,
        lecturerId: lecturer.id,
        sessionToken: token,
        expiryTime: new Date(),
        venue: input.venue,
      },
      select: { id: true, courseId: true },
    });
    
    console.log("[Session Create] Session created in DB:", seedSession.id);

    const { payload, expiresAt } = buildSessionPayload({
      sessionId: seedSession.id,
      courseId: seedSession.courseId,
      token,
      ttlMinutes: input.ttlMinutes,
    });
    
    console.log("[Session Create] Payload built:", {
      sessionId: payload.sessionId,
      courseId: payload.courseId,
      expires: payload.expires,
      tokenLength: payload.token.length
    });
    
    const encodedPayload = encodePayload(payload);
    console.log("[Session Create] Payload encoded, length:", encodedPayload.length);

    await db.session.update({
      where: { id: seedSession.id },
      data: { expiryTime: expiresAt },
    });
    
    console.log("[Session Create] Session expiry time updated to:", expiresAt.toISOString());

    return Response.json({
      ok: true,
      sessionId: seedSession.id,
      expiresAt: expiresAt.toISOString(),
      encodedPayload,
      sessionToken: token,
      course,
    });
  } catch (error) {
    console.error("[Session Create] Error:", error);
    if (error instanceof ZodError) {
      return Response.json(
        {
          ok: false,
          message: error.issues[0]?.message ?? "Invalid attendance session details.",
        },
        { status: 400 }
      );
    }
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to create session." },
      { status: 400 }
    );
  }
}

export async function GET() {
  await expireOverdueSessions();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LECTURER") {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const lecturer = await db.lecturer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!lecturer) {
    return Response.json({ ok: false, message: "Lecturer profile not found." }, { status: 404 });
  }
  const sessions = await db.session.findMany({
    where: { lecturerId: lecturer.id },
    select: {
      id: true,
      status: true,
      startTime: true,
      expiryTime: true,
      venue: true,
      course: { select: { courseCode: true, courseTitle: true } },
      _count: { select: { attendance: true } },
    },
    orderBy: { startTime: "desc" },
    take: 10,
  });
  return Response.json({ ok: true, sessions });
}
