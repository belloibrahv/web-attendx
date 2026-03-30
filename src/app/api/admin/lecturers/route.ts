import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";

const createLecturerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  staffId: z.string().min(3),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  department: z.string().min(1),
  title: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  const lecturers = await db.lecturer.findMany({
    select: {
      id: true,
      staffId: true,
      title: true,
      firstName: true,
      lastName: true,
      department: true,
      user: {
        select: {
          email: true,
        },
      },
      _count: {
        select: {
          courses: true,
          sessions: true,
        },
      },
    },
    orderBy: { staffId: "asc" },
  });

  return Response.json({ ok: true, lecturers });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  try {
    const input = createLecturerSchema.parse(await req.json());
    const passwordHash = await hash(input.password, 12);

    const created = await db.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        role: "LECTURER",
        lecturer: {
          create: {
            staffId: input.staffId.toUpperCase(),
            firstName: input.firstName,
            lastName: input.lastName,
            department: input.department,
            title: input.title,
          },
        },
      },
      select: { id: true },
    });

    return Response.json({ ok: true, userId: created.id });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to create lecturer." },
      { status: 400 }
    );
  }
}
