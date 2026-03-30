import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(_req: Request, ctx: RouteContext<"/api/sessions/[id]/close">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "LECTURER") {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const { id } = await ctx.params;
  const lecturer = await db.lecturer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  if (!lecturer) {
    return Response.json({ ok: false, message: "Lecturer profile not found." }, { status: 404 });
  }
  const found = await db.session.findUnique({ where: { id }, select: { lecturerId: true } });
  if (!found || found.lecturerId !== lecturer.id) {
    return Response.json({ ok: false, message: "Session not found." }, { status: 404 });
  }
  await db.session.update({
    where: { id },
    data: { status: "CLOSED" },
  });
  return Response.json({ ok: true });
}

