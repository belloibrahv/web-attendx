import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { expireOverdueSessions } from "@/lib/session-status";

export async function GET(_req: Request, ctx: RouteContext<"/api/sessions/[id]/attendance">) {
  await expireOverdueSessions();
  const sessionUser = await getServerSession(authOptions);
  if (!sessionUser?.user?.id || sessionUser.user.role !== "LECTURER") {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const lecturer = await db.lecturer.findUnique({
    where: { userId: sessionUser.user.id },
    select: { id: true },
  });
  if (!lecturer) {
    return Response.json({ ok: false, message: "Lecturer profile not found." }, { status: 404 });
  }
  const found = await db.session.findUnique({
    where: { id },
    select: {
      id: true,
      lecturerId: true,
      courseId: true,
      sessionToken: true,
      status: true,
      startTime: true,
      expiryTime: true,
      venue: true,
      course: {
        select: {
          courseCode: true,
          courseTitle: true,
        },
      },
      attendance: {
        orderBy: { markedAt: "desc" },
        select: {
          id: true,
          markedAt: true,
          student: {
            select: { matricNumber: true, firstName: true, lastName: true },
          },
        },
      },
    },
  });
  if (!found || found.lecturerId !== lecturer.id) {
    return Response.json({ ok: false, message: "Session not found." }, { status: 404 });
  }
  
  // Generate encoded payload for QR code
  const { encodePayload, buildSessionPayload } = await import("@/lib/qr");
  const ttlMinutes = Math.max(1, Math.ceil((new Date(found.expiryTime).getTime() - Date.now()) / 60000));
  const { payload } = buildSessionPayload({
    sessionId: found.id,
    courseId: found.courseId,
    token: found.sessionToken,
    ttlMinutes,
  });
  const encodedPayload = encodePayload(payload);
  
  return Response.json({ 
    ok: true, 
    session: {
      ...found,
      encodedPayload,
    }
  });
}
