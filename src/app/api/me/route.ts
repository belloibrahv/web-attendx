import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }

  const [student, lecturer] = await Promise.all([
    db.student.findUnique({
      where: { userId: session.user.id },
      select: { id: true, matricNumber: true, firstName: true, lastName: true },
    }),
    db.lecturer.findUnique({
      where: { userId: session.user.id },
      select: { id: true, staffId: true, firstName: true, lastName: true },
    }),
  ]);

  return Response.json({
    ok: true,
    user: session.user,
    student,
    lecturer,
  });
}

