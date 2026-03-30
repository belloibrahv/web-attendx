import { getServerSession } from "next-auth";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { authOptions } from "@/lib/auth";
import { db } from "@/lib/db";
import { requireRole } from "@/lib/require-auth";

export default async function StudentHistoryPage() {
  await requireRole(["STUDENT"]);
  const session = await getServerSession(authOptions);
  const student = await db.student.findUnique({
    where: { userId: session!.user.id },
    select: { id: true },
  });
  const history = student
    ? await db.attendanceRecord.findMany({
        where: { studentId: student.id },
        select: {
          id: true,
          markedAt: true,
          session: {
            select: {
              startTime: true,
              course: { select: { courseCode: true, courseTitle: true } },
            },
          },
        },
        orderBy: { markedAt: "desc" },
        take: 30,
      })
    : [];

  return (
    <DashboardShell role="student" title="Attendance History">
      <div className="rounded-xl border bg-card p-4">
        <h2 className="font-heading text-lg">Recent Attendance Records</h2>
        <p className="mt-2 text-sm text-muted-foreground">Latest records from your enrolled sessions.</p>
        <div className="mt-4 space-y-2">
          {history.map((record) => (
            <div key={record.id} className="rounded-md border p-3">
              <p className="text-sm font-medium">
                {record.session.course.courseCode} - {record.session.course.courseTitle}
              </p>
              <p className="text-xs text-muted-foreground">
                Marked: {new Date(record.markedAt).toLocaleString()} | Session start:{" "}
                {new Date(record.session.startTime).toLocaleString()}
              </p>
            </div>
          ))}
          {history.length === 0 ? (
            <p className="text-sm text-muted-foreground">No attendance records yet.</p>
          ) : null}
        </div>
      </div>
    </DashboardShell>
  );
}

