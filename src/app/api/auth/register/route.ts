import { hash } from "bcryptjs";
import { db } from "@/lib/db";
import { registerUserSchema } from "@/lib/validators";

export async function POST(req: Request) {
  try {
    const input = registerUserSchema.parse(await req.json());
    const email = input.email.toLowerCase();

    const existingUser = await db.user.findUnique({
      where: { email },
      select: { id: true },
    });

    if (existingUser) {
      return Response.json(
        { ok: false, message: "An account with this email already exists." },
        { status: 409 }
      );
    }

    if (input.role === "STUDENT") {
      const existingStudent = await db.student.findUnique({
        where: { matricNumber: input.matricNumber },
        select: { id: true },
      });

      if (existingStudent) {
        return Response.json(
          { ok: false, message: "This matric number is already registered." },
          { status: 409 }
        );
      }
    }

    if (input.role === "LECTURER") {
      const existingLecturer = await db.lecturer.findUnique({
        where: { staffId: input.staffId },
        select: { id: true },
      });

      if (existingLecturer) {
        return Response.json(
          { ok: false, message: "This staff ID is already registered." },
          { status: 409 }
        );
      }
    }

    const passwordHash = await hash(input.password, 12);

    const createdUser = await db.user.create({
      data: {
        email,
        passwordHash,
        role: input.role,
        student:
          input.role === "STUDENT"
            ? {
                create: {
                  matricNumber: input.matricNumber,
                  firstName: input.firstName,
                  lastName: input.lastName,
                  department: input.department,
                  level: input.level,
                },
              }
            : undefined,
        lecturer:
          input.role === "LECTURER"
            ? {
                create: {
                  staffId: input.staffId,
                  firstName: input.firstName,
                  lastName: input.lastName,
                  department: input.department,
                  title: input.title,
                },
              }
            : undefined,
      },
      select: {
        id: true,
        role: true,
        email: true,
      },
    });

    return Response.json(
      {
        ok: true,
        user: createdUser,
        message: "Registration completed successfully.",
      },
      { status: 201 }
    );
  } catch (error) {
    return Response.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Registration failed.",
      },
      { status: 400 }
    );
  }
}
