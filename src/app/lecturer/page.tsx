import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-auth";

function toPercentage(value: number, total: number) {
  if (!total) return "0%";
  return `${Math.round((value / total) * 100)}%`;
}

export default async function LecturerPage() {
  const session = await requireRole(["LECTURER"]);
  const lecturer = await db.lecturer.findUnique({
    where: { userId: session.user.id },
    select: { id: true },
  });

  const [activeSessions, totalSessions, totalAttendance, courses, courseSnapshots, recentSessions] = lecturer
    ? await Promise.all([
        db.session.count({
          where: {
            lecturerId: lecturer.id,
            status: "ACTIVE",
            expiryTime: { gt: new Date() },
          },
        }),
        db.session.count({
          where: { lecturerId: lecturer.id },
        }),
        db.attendanceRecord.count({
          where: { session: { lecturerId: lecturer.id } },
        }),
        db.course.count({
          where: { lecturerId: lecturer.id },
        }),
        db.course.findMany({
          where: { lecturerId: lecturer.id },
          select: {
            id: true,
            courseCode: true,
            courseTitle: true,
            _count: {
              select: {
                enrolments: true,
                sessions: true,
                attendance: true,
              },
            },
          },
          orderBy: { courseCode: "asc" },
        }),
        db.session.findMany({
          where: { lecturerId: lecturer.id },
          take: 5,
          orderBy: { startTime: "desc" },
          select: {
            id: true,
            status: true,
            startTime: true,
            expiryTime: true,
            venue: true,
            course: {
              select: {
                courseCode: true,
                courseTitle: true,
              },
            },
            _count: {
              select: {
                attendance: true,
              },
            },
          },
        }),
      ])
    : [0, 0, 0, 0, [], []];

  return (
    <DashboardShell role="lecturer" title="Lecturer Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Active sessions</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{activeSessions}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Total sessions</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{totalSessions}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Attendance records</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{totalAttendance}</p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <p className="text-xs text-muted-foreground">Assigned courses</p>
          <p className="mt-2 text-2xl font-semibold text-primary">{courses}</p>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Start Attendance Session</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Select course, venue, and TTL to generate a unique time-bound QR code.
          </p>
          <Link href="/lecturer/sessions" className="mt-3 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline">
            Open session manager
          </Link>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Reports & Exports</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Review course attendance trends and download CSV records.
          </p>
          <Link href="/lecturer/reports" className="mt-3 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline">
            Open lecturer reports
          </Link>
        </div>
      </div>

      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Course Performance Snapshot</h2>
          <div className="mt-3 space-y-3">
            {courseSnapshots.map((course) => {
              const possibleAttendance = course._count.enrolments * course._count.sessions;
              const rate = toPercentage(course._count.attendance, possibleAttendance);

              return (
                <div key={course.id} className="rounded-lg border p-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-medium">
                      {course.courseCode} - {course.courseTitle}
                    </p>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                      {rate}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    {course._count.enrolments} enrolled • {course._count.sessions} session(s) • {course._count.attendance} attendance record(s)
                  </p>
                </div>
              );
            })}
            {courseSnapshots.length === 0 ? (
              <p className="text-sm text-muted-foreground">No courses assigned yet.</p>
            ) : null}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Recent Sessions</h2>
          <div className="mt-3 space-y-3">
            {recentSessions.map((sessionItem) => (
              <div key={sessionItem.id} className="rounded-lg border p-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {sessionItem.course.courseCode} - {sessionItem.course.courseTitle}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    {sessionItem.status}
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {new Date(sessionItem.startTime).toLocaleString()} • Expires {new Date(sessionItem.expiryTime).toLocaleTimeString()}
                  {sessionItem.venue ? ` • ${sessionItem.venue}` : ""}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{sessionItem._count.attendance} attendance record(s)</p>
              </div>
            ))}
            {recentSessions.length === 0 ? <p className="text-sm text-muted-foreground">No sessions created yet.</p> : null}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
