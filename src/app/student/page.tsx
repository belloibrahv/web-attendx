import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-auth";

export default async function StudentPage() {
  const session = await requireRole(["STUDENT"]);
  const student = await db.student.findUnique({
    where: { userId: session.user.id },
    select: { id: true, firstName: true, lastName: true, matricNumber: true },
  });

  const [totalRecords, enrolments, activeSessions] = student
    ? await Promise.all([
        db.attendanceRecord.count({ where: { studentId: student.id } }),
        db.enrolment.findMany({
          where: { studentId: student.id },
          select: {
            academicYear: true,
            semester: true,
            course: {
              select: {
                id: true,
                courseCode: true,
                courseTitle: true,
                sessions: {
                  select: {
                    id: true,
                    status: true,
                    expiryTime: true,
                  },
                },
                _count: {
                  select: {
                    attendance: {
                      where: {
                        studentId: student.id,
                      },
                    },
                  },
                },
              },
            },
          },
        }),
        db.session.findMany({
          where: {
            status: "ACTIVE",
            expiryTime: {
              gt: new Date(),
            },
            course: {
              enrolments: {
                some: {
                  studentId: student.id,
                },
              },
            },
          },
          take: 5,
          orderBy: { startTime: "desc" },
          select: {
            id: true,
            expiryTime: true,
            course: {
              select: {
                courseCode: true,
                courseTitle: true,
              },
            },
          },
        }),
      ])
    : [0, [], []];

  return (
    <DashboardShell role="student" title="Student Dashboard">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Attendance Summary</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Welcome {student?.firstName} {student?.lastName}. You have {totalRecords} attendance record(s) across your enrolled courses.
          </p>
          <p className="mt-2 text-xs text-muted-foreground">
            Matric number: {student?.matricNumber ?? "Not available"}
          </p>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Quick Action</h2>
          <p className="mt-2 text-sm text-muted-foreground">Use Scan QR to mark attendance in active sessions.</p>
          <Link href="/student/scan" className="mt-3 inline-block text-sm font-medium text-primary underline-offset-2 hover:underline">
            Open scanner
          </Link>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Available Live Sessions</h2>
          <div className="mt-2 space-y-2">
            {activeSessions.map((sessionItem) => (
              <p key={sessionItem.id} className="text-sm text-muted-foreground">
                {sessionItem.course.courseCode} • expires {new Date(sessionItem.expiryTime).toLocaleTimeString()}
              </p>
            ))}
            {activeSessions.length === 0 ? <p className="text-sm text-muted-foreground">No active sessions at the moment.</p> : null}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border bg-card p-4">
        <h2 className="font-heading text-lg">Course Attendance Progress</h2>
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {enrolments.map((row) => {
            const totalSessions = row.course.sessions.length;
            const attended = row.course._count.attendance;
            const rate = totalSessions ? Math.round((attended / totalSessions) * 100) : 0;

            return (
              <div key={`${row.course.id}-${row.academicYear}-${row.semester}`} className="rounded-lg border p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium">
                    {row.course.courseCode} - {row.course.courseTitle}
                  </p>
                  <span className="rounded-full bg-primary/10 px-2 py-1 text-[11px] font-semibold text-primary">
                    {rate}%
                  </span>
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  {attended} attendance mark(s) from {totalSessions} total session(s)
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {row.academicYear} • {row.semester}
                </p>
              </div>
            );
          })}
          {enrolments.length === 0 ? <p className="text-sm text-muted-foreground">No enrolments found.</p> : null}
        </div>
      </div>
    </DashboardShell>
  );
}
