import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

function escapeCsv(value: string) {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export async function GET(_req: Request, ctx: RouteContext<"/api/reports/course/[courseId]/csv">) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || (session.user.role !== "ADMIN" && session.user.role !== "LECTURER")) {
    return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  }
  const { courseId } = await ctx.params;

  if (session.user.role === "LECTURER") {
    const lecturer = await db.lecturer.findUnique({
      where: { userId: session.user.id },
      select: { id: true },
    });
    if (!lecturer) {
      return Response.json({ ok: false, message: "Lecturer profile not found." }, { status: 404 });
    }
    const allowed = await db.course.findFirst({
      where: { id: courseId, lecturerId: lecturer.id },
      select: { id: true },
    });
    if (!allowed) {
      return Response.json({ ok: false, message: "Forbidden for this course." }, { status: 403 });
    }
  }

  const rows = await db.attendanceRecord.findMany({
    where: { courseId },
    select: {
      markedAt: true,
      session: { select: { id: true, startTime: true } },
      student: { select: { matricNumber: true, firstName: true, lastName: true } },
      course: { select: { courseCode: true, courseTitle: true } },
    },
    orderBy: { markedAt: "desc" },
  });

  const header = [
    "courseCode",
    "courseTitle",
    "sessionId",
    "sessionStart",
    "matricNumber",
    "studentName",
    "markedAt",
  ];
  const body = rows.map((row) =>
    [
      row.course.courseCode,
      row.course.courseTitle,
      row.session.id,
      row.session.startTime.toISOString(),
      row.student.matricNumber,
      `${row.student.firstName} ${row.student.lastName}`,
      row.markedAt.toISOString(),
    ]
      .map((value) => escapeCsv(String(value)))
      .join(",")
  );
  const csv = [header.join(","), ...body].join("\n");

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="attendance-${courseId}.csv"`,
    },
  });
}

