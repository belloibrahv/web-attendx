import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

const createStudentSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  matricNumber: z.string().min(3),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  department: z.string().min(1),
  level: z.string().min(1),
});

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function GET() {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  const students = await db.student.findMany({
    select: {
      id: true,
      matricNumber: true,
      firstName: true,
      lastName: true,
      department: true,
      level: true,
      user: { select: { email: true } },
    },
    orderBy: { matricNumber: "asc" },
  });
  return Response.json({ ok: true, students });
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });
  try {
    const input = createStudentSchema.parse(await req.json());
    const passwordHash = await hash(input.password, 12);

    const created = await db.user.create({
      data: {
        email: input.email.toLowerCase(),
        passwordHash,
        role: "STUDENT",
        student: {
          create: {
            matricNumber: input.matricNumber,
            firstName: input.firstName,
            lastName: input.lastName,
            department: input.department,
            level: input.level,
          },
        },
      },
      select: { id: true },
    });

    return Response.json({ ok: true, userId: created.id });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to create student." },
      { status: 400 }
    );
  }
}
