import { getServerSession } from "next-auth";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createEnrolmentSchema = z.object({
  studentId: z.string().min(1),
  courseId: z.string().min(1),
  academicYear: z.string().min(4),
  semester: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  const enrolments = await db.enrolment.findMany({
    select: {
      id: true,
      academicYear: true,
      semester: true,
      enrolledAt: true,
      student: {
        select: {
          matricNumber: true,
          firstName: true,
          lastName: true,
        },
      },
      course: {
        select: {
          courseCode: true,
          courseTitle: true,
        },
      },
    },
    orderBy: { enrolledAt: "desc" },
    take: 50,
  });

  return Response.json({ ok: true, enrolments });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  try {
    const input = createEnrolmentSchema.parse(await req.json());
    const created = await db.enrolment.create({
      data: {
        studentId: input.studentId,
        courseId: input.courseId,
        academicYear: input.academicYear,
        semester: input.semester,
      },
      select: { id: true },
    });

    return Response.json({ ok: true, enrolmentId: created.id });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to create enrolment." },
      { status: 400 }
    );
  }
}
