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
    
    console.log("[Scan] Request received from user:", sessionUser?.user?.email);
    
    if (!sessionUser?.user?.id || sessionUser.user.role !== "STUDENT") {
      console.log("[Scan] Unauthorized: No session or not a student");
      return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
    }
    
    const student = await db.student.findUnique({
      where: { userId: sessionUser.user.id },
      select: { id: true, matricNumber: true, firstName: true, lastName: true },
    });
    
    if (!student) {
      console.log("[Scan] Student profile not found for user:", sessionUser.user.id);
      return Response.json({ ok: false, message: "Student profile not found." }, { status: 404 });
    }
    
    console.log("[Scan] Student found:", student.matricNumber);

    const body = await req.json();
    console.log("[Scan] Request body received, encodedPayload length:", body.encodedPayload?.length);
    
    const input = scanAttendanceSchema.parse(body);
    
    // Try to decode the payload with better error handling
    let payload;
    try {
      console.log("[Scan] Attempting to decode payload...");
      payload = decodePayload(input.encodedPayload);
      console.log("[Scan] Payload decoded successfully:", {
        sessionId: payload.sessionId,
        courseId: payload.courseId,
        expires: payload.expires,
        tokenLength: payload.token?.length
      });
    } catch (decodeError) {
      console.error("[Scan] QR decode error:", decodeError);
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
        venue: true,
        course: {
          select: {
            courseCode: true,
            courseTitle: true,
          },
        },
        lecturer: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!session) {
      console.log("[Scan] Session not found:", payload.sessionId);
      return Response.json({ ok: false, message: "Invalid session." }, { status: 404 });
    }
    
    console.log("[Scan] Session found:", {
      id: session.id,
      status: session.status,
      expiryTime: session.expiryTime,
      courseCode: session.course.courseCode
    });
    
    if (session.status !== "ACTIVE") {
      console.log("[Scan] Session not active:", session.status);
      return Response.json({ ok: false, message: "Session is not active." }, { status: 400 });
    }
    
    const now = Date.now();
    const expiryTime = new Date(session.expiryTime).getTime();
    
    if (expiryTime < now) {
      console.log("[Scan] Session expired:", {
        expiryTime: session.expiryTime,
        now: new Date(now).toISOString()
      });
      await db.session.update({
        where: { id: session.id },
        data: { status: "EXPIRED" },
      });
      return Response.json({ ok: false, message: "Session expired." }, { status: 400 });
    }
    
    if (session.courseId !== payload.courseId) {
      console.log("[Scan] Course mismatch:", {
        sessionCourse: session.courseId,
        payloadCourse: payload.courseId
      });
      return Response.json({ ok: false, message: "Course mismatch." }, { status: 400 });
    }
    
    console.log("[Scan] Validating token...");
    const tokensMatch = await constantTimeEquals(session.sessionToken, payload.token);
    if (!tokensMatch) {
      console.log("[Scan] Token validation failed");
      return Response.json({ ok: false, message: "Token validation failed." }, { status: 400 });
    }
    
    console.log("[Scan] Token validated successfully");

    const enrolment = await db.enrolment.findFirst({
      where: {
        studentId: student.id,
        courseId: session.courseId,
      },
      select: { id: true },
    });
    
    if (!enrolment) {
      console.log("[Scan] Student not enrolled in course:", {
        studentId: student.id,
        courseId: session.courseId
      });
      return Response.json(
        { ok: false, message: "You are not enrolled in this course, so attendance cannot be recorded." },
        { status: 403 }
      );
    }
    
    console.log("[Scan] Enrolment verified");

    const existing = await db.attendanceRecord.findUnique({
      where: {
        sessionId_studentId: {
          sessionId: session.id,
          studentId: student.id,
        },
      },
      select: { id: true, markedAt: true },
    });
    
    if (existing) {
      console.log("[Scan] Attendance already recorded:", existing.markedAt);
      return Response.json({ 
        ok: false, 
        message: "Attendance already recorded for this session." 
      }, { status: 409 });
    }

    const ipAddress = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? 
                     req.headers.get("x-real-ip") ?? 
                     "unknown";
    
    console.log("[Scan] Creating attendance record...");
    const created = await db.attendanceRecord.create({
      data: {
        sessionId: session.id,
        studentId: student.id,
        courseId: session.courseId,
        deviceInfo: input.deviceInfo,
        ipAddress,
      },
    });
    
    console.log("[Scan] Attendance recorded successfully:", {
      recordId: created.id,
      student: student.matricNumber,
      course: session.course.courseCode,
      markedAt: created.markedAt
    });

    return Response.json({
      ok: true,
      message: "Attendance recorded successfully.",
      attendance: {
        id: created.id,
        markedAt: created.markedAt.toISOString(),
        courseCode: session.course.courseCode,
        courseTitle: session.course.courseTitle,
        venue: session.venue,
        lecturerName: `${session.lecturer.firstName} ${session.lecturer.lastName}`,
      },
    });
  } catch (error) {
    console.error("[Scan] Attendance scan error:", error);
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to scan attendance." },
      { status: 400 }
    );
  }
}
