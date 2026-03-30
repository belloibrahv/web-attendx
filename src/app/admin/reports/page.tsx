import Link from "next/link";
import { db } from "@/lib/db";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { AttendanceOverview } from "@/components/charts/attendance-overview";

export default async function AdminReportsPage() {
  const [courses, totals] = await Promise.all([
    db.course.findMany({
      select: {
        id: true,
        courseCode: true,
        _count: { select: { attendance: true } },
      },
      orderBy: { courseCode: "asc" },
    }),
    db.attendanceRecord.count(),
  ]);
  const chartData = courses.map((course) => ({
    courseCode: course.courseCode,
    count: course._count.attendance,
  }));

  return (
    <DashboardShell role="admin" title="System Reports">
      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total attendance records</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{totals}</p>
        </div>
        <div className="rounded-xl border bg-card p-4 md:col-span-2">
          <h2 className="font-heading text-lg">Attendance by Course</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Real-time summary from Neon-backed attendance records.
          </p>
          <div className="mt-4">
            <AttendanceOverview data={chartData} />
          </div>
        </div>
      </div>
      <div className="mt-4 rounded-xl border bg-card p-4">
        <h3 className="font-heading text-lg">CSV Exports</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Download course-level attendance records for departmental reporting.
        </p>
        <div className="mt-3 grid gap-2">
          {courses.map((course) => (
            <Link
              key={course.id}
              href={`/api/reports/course/${course.id}/csv`}
              className="rounded-md border px-3 py-2 text-sm hover:bg-muted"
            >
              Export {course.courseCode} ({course._count.attendance} records)
            </Link>
          ))}
        </div>
      </div>
    </DashboardShell>
  );
}

