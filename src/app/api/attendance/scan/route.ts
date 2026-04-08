import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { db } from "@/lib/db";
import { authOptions } from "@/lib/auth";
import { constantTimeEquals, decodePayload } from "@/lib/qr";
import { expireOverdueSessions } from "@/lib/session-status";
import { scanAttendanceSchema } from "@/lib/validators";

export async function POST(req: NextRequest) {
  try {
    await expireOverdueSessions();
    const sessionUser = await getServerSession(authOptions);
    if (!sessionUser?.user?.id || sessionUser.user.role !== "STUDENT") {
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    const student = await db.student.findUnique({
      where: { userId: sessionUser.user.id },
      select: { id: true },
    });
    if (!student) {
      return Response.json({ ok: false, message: "Student profile not found." }, { status: 404 });
    }

    const body = await req.json();
    const input = scanAttendanceSchema.parse(body);
    
    // Try to decode the payload with better error handling
    let payload;
    try {
      payload = decodePayload(input.encodedPayload);
    } catch (decodeError) {
      console.error("QR decode error:", decodeError);
      return Response.json({ 
        ok: false, 
        message: "Invalid QR code format. Please scan a valid attendance QR code." 
      }, { status: 400 });
    }

    const session = await db.session.findUnique({
      where: { id: payload.sessionId },
      select: {
        id: true,
        courseId: true,
        sessionToken: true,
        expiryTime: true,
        status: true,
        course: {
          select: {
            courseCode: true,
            courseTitle: true,
          },
        },
      },
    });

    if (!session) {
      return Response.json({ ok: false, message: "Invalid session." }, { status: 404 });
    }
    if (session.status !== "ACTIVE") {
      return Response.json({ ok: false, message: "Session is not active." }, { status: 400 });
    }
    if (new Date(session.expiryTime).getTime() < Date.now()) {
      await db.session.update({
        where: { id: session.id },
        data: { status: "EXPIRED" },
      });
      return Response.json({ ok: false, message: "Session expired." }, { status: 400 });
    }
    if (session.courseId !== payload.courseId) {
      return Response.json({ ok: false, message: "Course mismatch." }, { status: 400 });
    }
    if (!constantTimeEquals(session.sessionToken, payload.token)) {
      return Response.json({ ok: false, message: "Token validation failed." }, { status: 400 });
    }

    const enrolment = await db.enrolment.findFirst({
      where: {
        studentId: student.id,
        courseId: session.courseId,
      },
      select: { id: true },
    });
    if (!enrolment) {
      return Response.json(
        { ok: false, message: "You are not enrolled in this course, so attendance cannot be recorded." },
        { status: 403 }
      );
    }

    const existing = await db.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
      select: { id: true },
    });
    if (existing) {
      return Response.json({ ok: false, message: "Attendance already recorded." }, { status: 409 });
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    const created = await db.attendanceRecord.create({
      data: {
        sessionId: session.id,
        studentId: student.id,
        courseId: session.courseId,
        deviceInfo: input.deviceInfo,
        ipAddress,
      },
    });

    return Response.json({
      ok: true,
      message: "Attendance recorded successfully.",
      attendance: {
        id: created.id,
        markedAt: created.markedAt.toISOString(),
        courseCode: session.course.courseCode,
        courseTitle: session.course.courseTitle,
      },
    });
  } catch (error) {
    console.error("Attendance scan error:", error);
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to scan attendance." },
      { status: 400 }
    );
  }
}
