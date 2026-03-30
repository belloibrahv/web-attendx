import { getServerSession } from "next-auth";
import { hash } from "bcryptjs";
import { z } from "zod";
import { authOptions } from "@/lib/auth";
import { parseCsv } from "@/lib/csv";
import { db } from "@/lib/db";

const importSchema = z.object({
  csv: z.string().min(10),
  defaultPassword: z.string().min(8).max(64),
});

const requiredHeaders = [
  "email",
  "matricNumber",
  "firstName",
  "lastName",
  "department",
  "level",
  "courseCode",
  "academicYear",
  "semester",
];

async function requireAdmin() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || session.user.role !== "ADMIN") return null;
  return session;
}

export async function POST(req: Request) {
  const session = await requireAdmin();
  if (!session) return Response.json({ ok: false, message: "Unauthorized" }, { status: 401 });

  try {
    const input = importSchema.parse(await req.json());
    const { headers, records } = parseCsv(input.csv);
    const missingHeaders = requiredHeaders.filter((header) => !headers.includes(header));

    if (missingHeaders.length > 0) {
      return Response.json(
        {
          ok: false,
          message: `CSV is missing required headers: ${missingHeaders.join(", ")}.`,
        },
        { status: 400 }
      );
    }

    const passwordHash = await hash(input.defaultPassword, 12);
    let createdStudents = 0;
    let createdEnrolments = 0;
    const errors: string[] = [];

    for (const [index, row] of records.entries()) {
      const rowNumber = index + 2;
      const email = row.email.trim().toLowerCase();
      const courseCode = row.courseCode.trim().toUpperCase();
      const matricNumber = row.matricNumber.trim();
      const academicYear = row.academicYear.trim();
      const semester = row.semester.trim();

      if (
        !email ||
        !matricNumber ||
        !row.firstName ||
        !row.lastName ||
        !row.department ||
        !row.level ||
        !courseCode ||
        !academicYear ||
        !semester
      ) {
        errors.push(`Row ${rowNumber}: one or more required values are empty.`);
        continue;
      }

      const course = await db.course.findUnique({
        where: { courseCode },
        select: { id: true, courseCode: true },
      });

      if (!course) {
        errors.push(`Row ${rowNumber}: course ${courseCode} does not exist.`);
        continue;
      }

      const existingUser = await db.user.findUnique({
        where: { email },
        include: { student: true },
      });

      if (existingUser && existingUser.role !== "STUDENT") {
        errors.push(`Row ${rowNumber}: ${email} already belongs to a non-student account.`);
        continue;
      }

      let studentId = existingUser?.student?.id;

      if (!existingUser) {
        const createdUser = await db.user.create({
          data: {
            email,
            passwordHash,
            role: "STUDENT",
            student: {
              create: {
                matricNumber,
                firstName: row.firstName.trim(),
                lastName: row.lastName.trim(),
                department: row.department.trim(),
                level: row.level.trim(),
              },
            },
          },
          include: { student: true },
        });
        studentId = createdUser.student?.id;
        createdStudents += 1;
      } else if (!studentId) {
        const createdStudent = await db.student.create({
          data: {
            userId: existingUser.id,
            matricNumber,
            firstName: row.firstName.trim(),
            lastName: row.lastName.trim(),
            department: row.department.trim(),
            level: row.level.trim(),
          },
        });
        studentId = createdStudent.id;
        createdStudents += 1;
      }

      if (!studentId) {
        errors.push(`Row ${rowNumber}: failed to create or locate a student profile.`);
        continue;
      }

      await db.enrolment.upsert({
        where: {
          studentId_courseId_academicYear_semester: {
            studentId,
            courseId: course.id,
            academicYear,
            semester,
          },
        },
        update: {},
        create: {
          studentId,
          courseId: course.id,
          academicYear,
          semester,
        },
      });

      createdEnrolments += 1;
    }

    return Response.json({
      ok: true,
      createdStudents,
      createdEnrolments,
      processedRows: records.length,
      errors,
    });
  } catch (error) {
    return Response.json(
      { ok: false, message: error instanceof Error ? error.message : "Failed to import enrolments." },
      { status: 400 }
    );
  }
}
