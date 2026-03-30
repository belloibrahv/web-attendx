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
      status: true,
      startTime: true,
      expiryTime: true,
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
  return Response.json({ ok: true, session: found });
}
