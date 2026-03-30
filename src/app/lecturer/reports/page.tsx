import Link from "next/link";
import { AttendanceOverview } from "@/components/charts/attendance-overview";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-auth";

export default async function LecturerReportsPage({
  searchParams,
}: {
  searchParams?: Promise<{ courseId?: string }>;
}) {
  const session = await requireRole(["LECTURER"]);
  const lecturer = await db.lecturer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });
  const selectedCourseId = (await searchParams)?.courseId;
  const courses = lecturer
    ? await db.course.findMany({
        where: { lecturerId: lecturer.id },
        select: { id: true, courseCode: true, courseTitle: true, _count: { select: { attendance: true } } },
        orderBy: { courseCode: "asc" },
      })
    : [];
  const effectiveCourseId = selectedCourseId ?? courses[0]?.id;
  const records = effectiveCourseId
    ? await db.attendanceRecord.findMany({
        where: { courseId: effectiveCourseId },
        select: {
          id: true,
          markedAt: true,
          student: { select: { matricNumber: true, firstName: true, lastName: true } },
        },
        orderBy: { markedAt: "desc" },
        take: 50,
      })
    : [];

  return (
    <DashboardShell role="lecturer" title="Lecturer Reports">
      <div className="rounded-xl border bg-card p-4">
        <h2 className="font-heading text-lg">Attendance by Course</h2>
        <div className="mt-3 flex flex-wrap gap-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/lecturer/reports?courseId=${course.id}`}
              className={`rounded-md border px-3 py-1.5 text-sm ${
                course.id === effectiveCourseId ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              }`}
            >
              {course.courseCode}
            </Link>
          ))}
        </div>
        <div className="mt-4">
          <AttendanceOverview
            data={courses.map((course) => ({
              courseCode: course.courseCode,
              count: course._count.attendance,
            }))}
          />
        </div>
        {effectiveCourseId ? (
          <div className="mt-3">
            <Link
              href={`/api/reports/course/${effectiveCourseId}/csv`}
              className="text-sm font-medium text-primary underline-offset-2 hover:underline"
            >
              Export selected course CSV
            </Link>
          </div>
        ) : null}
      </div>

      <div className="mt-4 rounded-xl border bg-card p-4">
        <h3 className="font-heading text-lg">Latest Attendance Records</h3>
        <div className="mt-3 space-y-2">
          {records.map((record) => (
            <div key={record.id} className="rounded-md border p-2 text-sm">
              <p className="font-medium">
                {record.student.firstName} {record.student.lastName}
              </p>
              <p className="text-xs text-muted-foreground">
                {record.student.matricNumber} • {new Date(record.markedAt).toLocaleString()}
              </p>
            </div>
          ))}
          {records.length === 0 ? <p className="text-sm text-muted-foreground">No records for this course yet.</p> : null}
        </div>
      </div>
    </DashboardShell>
  );
}

