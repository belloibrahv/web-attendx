import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET() {
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
  const courses = await db.course.findMany({
    where: { lecturerId: lecturer.id },
    select: { id: true, courseCode: true, courseTitle: true, semester: true },
    orderBy: { courseCode: "asc" },
  });
  return Response.json({ ok: true, courses });
}

