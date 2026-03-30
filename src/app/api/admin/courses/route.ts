import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createCourseSchema = z.object({
  courseCode: z.string().min(3),
  courseTitle: z.string().min(3),
  creditUnits: z.number().int().min(1).max(8),
  department: z.string().min(1),
  semester: z.string().min(1),
  lecturerId: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  const [courses, lecturers] = await Promise.all([
    db.course.findMany({
      select: {
        id: true,
        courseCode: true,
        courseTitle: true,
        creditUnits: true,
        department: true,
        semester: true,
        lecturer: { select: { firstName: true, lastName: true } },
      },
      orderBy: { courseCode: "asc" },
    }),
    db.lecturer.findMany({
      select: { id: true, firstName: true, lastName: true, staffId: true },
      orderBy: { staffId: "asc" },
    }),
  ]);

  return Response.json({ ok: true, courses, lecturers });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  try {
    const input = createCourseSchema.parse(await req.json());
    const created = await db.course.create({
      data: input,
      select: { id: true },
    });
    return Response.json({ ok: true, courseId: created.id });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to create course." },
      { status: 400 }
    );
  }
}

