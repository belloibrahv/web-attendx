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

    const body = await req.json();
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
      return Response.json({ ok: false, message: "You can only open sessions for your assigned courses." }, { status: 403 });
    }

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
      return Response.json(
        {
          ok: false,
          message: `An active session already exists for this course until ${existingActiveSession.expiryTime.toLocaleTimeString()}.`,
          existingSessionId: existingActiveSession.id,
        },
        { status: 409 }
      );
    }

    const token = generateSessionToken();
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

    const { payload, expiresAt } = buildSessionPayload({
      sessionId: seedSession.id,
      courseId: seedSession.courseId,
      token,
      ttlMinutes: input.ttlMinutes,
    });
    const encodedPayload = encodePayload(payload);

    await db.session.update({
      where: { id: seedSession.id },
      data: { expiryTime: expiresAt },
    });

    return Response.json({
      ok: true,
      sessionId: seedSession.id,
      expiresAt: expiresAt.toISOString(),
      encodedPayload,
      sessionToken: token,
      course,
    });
  } catch (error) {
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
