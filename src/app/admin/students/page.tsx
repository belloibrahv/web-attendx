"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";

type StudentRecord = {
  id: string;
  matricNumber: string;
  firstName: string;
  lastName: string;
  department: string;
  level: string;
  user: { email: string };
};

type CourseOption = {
  id: string;
  courseCode: string;
  courseTitle: string;
};

type EnrolmentRecord = {
  id: string;
  academicYear: string;
  semester: string;
  enrolledAt: string;
  student: { matricNumber: string; firstName: string; lastName: string };
  course: { courseCode: string; courseTitle: string };
};

type ImportResult = {
  ok: boolean;
  createdStudents?: number;
  createdEnrolments?: number;
  processedRows?: number;
  errors?: string[];
  message?: string;
};

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<StudentRecord[]>([]);
  const [courses, setCourses] = useState<CourseOption[]>([]);
  const [enrolments, setEnrolments] = useState<EnrolmentRecord[]>([]);
  const [form, setForm] = useState({
    email: "",
    password: "",
    matricNumber: "",
    firstName: "",
    lastName: "",
    department: "",
    level: "",
  });
  const [studentStatus, setStudentStatus] = useState("");
  const [enrolmentStatus, setEnrolmentStatus] = useState("");
  const [importStatus, setImportStatus] = useState("");
  const [importResult, setImportResult] = useState<ImportResult | null>(null);
  const [importCsv, setImportCsv] = useState(
    "email,matricNumber,firstName,lastName,department,level,courseCode,academicYear,semester\nstudent.new@tasued.edu.ng,TAS/26/001,New,Student,Computer and Information Science,400,CSC401,2025/2026,Second"
  );
  const [defaultPassword, setDefaultPassword] = useState("StudentPass123!");
  const [enrolmentForm, setEnrolmentForm] = useState({
    studentId: "",
    courseId: "",
    academicYear: "2025/2026",
    semester: "Second",
  });

  async function loadStudents() {
    const [studentResponse, courseResponse, enrolmentResponse] = await Promise.all([
      fetch("/api/admin/students"),
      fetch("/api/admin/courses"),
      fetch("/api/admin/enrolments"),
    ]);
    const studentData = await studentResponse.json();
    const courseData = await courseResponse.json();
    const enrolmentData = await enrolmentResponse.json();

    if (studentResponse.ok && studentData.ok) {
      setStudents(studentData.students);
      setEnrolmentForm((current) => ({
        ...current,
        studentId: current.studentId || studentData.students[0]?.id || "",
      }));
    }
    if (courseResponse.ok && courseData.ok) {
      setCourses(courseData.courses);
      setEnrolmentForm((current) => ({
        ...current,
        courseId: current.courseId || courseData.courses[0]?.id || "",
      }));
    }
    if (enrolmentResponse.ok && enrolmentData.ok) {
      setEnrolments(enrolmentData.enrolments);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadStudents();
  }, []);

  async function createStudent() {
    setStudentStatus("");
    const response = await fetch("/api/admin/students", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setStudentStatus(`Error: ${data.message ?? "Failed to create student."}`);
      return;
    }
    setStudentStatus("Student created successfully.");
    setForm({
      email: "",
      password: "",
      matricNumber: "",
      firstName: "",
      lastName: "",
      department: "",
      level: "",
    });
    await loadStudents();
  }

  async function createEnrolment() {
    setEnrolmentStatus("");
    const response = await fetch("/api/admin/enrolments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(enrolmentForm),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setEnrolmentStatus(`Error: ${data.message ?? "Failed to create enrolment."}`);
      return;
    }
    setEnrolmentStatus("Student enrolled successfully.");
    await loadStudents();
  }

  async function importEnrolments() {
    setImportStatus("");
    setImportResult(null);
    const response = await fetch("/api/admin/enrolments/import", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        csv: importCsv,
        defaultPassword,
      }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setImportStatus(`Error: ${data.message ?? "Failed to import CSV."}`);
      setImportResult(data);
      return;
    }
    setImportStatus("CSV import completed.");
    setImportResult(data);
    await loadStudents();
  }

  return (
    <DashboardShell role="admin" title="Student Management">
      <div className="grid gap-4 xl:grid-cols-3">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Create Student</h2>
          <div className="mt-3 grid gap-2">
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Email" value={form.email} onChange={(e) => setForm((v) => ({ ...v, email: e.target.value }))} />
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Password" type="password" value={form.password} onChange={(e) => setForm((v) => ({ ...v, password: e.target.value }))} />
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Matric number" value={form.matricNumber} onChange={(e) => setForm((v) => ({ ...v, matricNumber: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="First name" value={form.firstName} onChange={(e) => setForm((v) => ({ ...v, firstName: e.target.value }))} />
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Last name" value={form.lastName} onChange={(e) => setForm((v) => ({ ...v, lastName: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Department" value={form.department} onChange={(e) => setForm((v) => ({ ...v, department: e.target.value }))} />
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Level" value={form.level} onChange={(e) => setForm((v) => ({ ...v, level: e.target.value }))} />
            </div>
            <Button onClick={createStudent}>Create student</Button>
            {studentStatus ? <p className="text-sm text-muted-foreground">{studentStatus}</p> : null}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Manual Course Enrolment</h2>
          <div className="mt-3 grid gap-2">
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={enrolmentForm.studentId}
              onChange={(e) => setEnrolmentForm((current) => ({ ...current, studentId: e.target.value }))}
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {student.matricNumber} - {student.firstName} {student.lastName}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border bg-background px-3 py-2 text-sm"
              value={enrolmentForm.courseId}
              onChange={(e) => setEnrolmentForm((current) => ({ ...current, courseId: e.target.value }))}
            >
              {courses.map((course) => (
                <option key={course.id} value={course.id}>
                  {course.courseCode} - {course.courseTitle}
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-2">
              <input
                className="rounded-md border bg-background px-3 py-2 text-sm"
                placeholder="Academic year"
                value={enrolmentForm.academicYear}
                onChange={(e) => setEnrolmentForm((current) => ({ ...current, academicYear: e.target.value }))}
              />
              <select
                className="rounded-md border bg-background px-3 py-2 text-sm"
                value={enrolmentForm.semester}
                onChange={(e) => setEnrolmentForm((current) => ({ ...current, semester: e.target.value }))}
              >
                <option value="First">First</option>
                <option value="Second">Second</option>
              </select>
            </div>
            <Button onClick={createEnrolment} disabled={!students.length || !courses.length}>
              Enrol student
            </Button>
            {!courses.length ? (
              <p className="text-sm text-muted-foreground">
                No courses available yet.{" "}
                <Link href="/admin/courses" className="text-primary underline-offset-2 hover:underline">
                  Create a course
                </Link>
                .
              </p>
            ) : null}
            {enrolmentStatus ? <p className="text-sm text-muted-foreground">{enrolmentStatus}</p> : null}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Bulk CSV Import</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            Required headers: email, matricNumber, firstName, lastName, department, level, courseCode, academicYear, semester.
          </p>
          <div className="mt-3 grid gap-2">
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              type="password"
              placeholder="Default password for new students"
              value={defaultPassword}
              onChange={(e) => setDefaultPassword(e.target.value)}
            />
            <input
              className="rounded-md border bg-background px-3 py-2 text-sm"
              type="file"
              accept=".csv,text/csv"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setImportCsv(await file.text());
              }}
            />
            <textarea
              className="min-h-48 rounded-md border bg-background px-3 py-2 text-sm"
              value={importCsv}
              onChange={(e) => setImportCsv(e.target.value)}
            />
            <Button onClick={importEnrolments}>Import CSV</Button>
            {importStatus ? <p className="text-sm text-muted-foreground">{importStatus}</p> : null}
            {importResult ? (
              <div className="rounded-md border bg-muted/40 p-3 text-xs text-muted-foreground">
                <p>Students created: {importResult.createdStudents ?? 0}</p>
                <p>Enrolments created: {importResult.createdEnrolments ?? 0}</p>
                <p>Rows processed: {importResult.processedRows ?? 0}</p>
                {importResult.errors?.length ? (
                  <div className="mt-2 space-y-1">
                    {importResult.errors.map((item) => (
                      <p key={item}>{item}</p>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Student Directory ({students.length})</h2>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
            {students.map((student) => (
              <div key={student.id} className="rounded-md border p-2 text-sm">
                <p className="font-medium">
                  {student.firstName} {student.lastName} ({student.matricNumber})
                </p>
                <p className="text-xs text-muted-foreground">
                  {student.user.email} • {student.department} • Level {student.level}
                </p>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Recent Enrolments ({enrolments.length})</h2>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
            {enrolments.map((enrolment) => (
              <div key={enrolment.id} className="rounded-md border p-2 text-sm">
                <p className="font-medium">
                  {enrolment.student.firstName} {enrolment.student.lastName} ({enrolment.student.matricNumber})
                </p>
                <p className="text-xs text-muted-foreground">
                  {enrolment.course.courseCode} - {enrolment.course.courseTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {enrolment.academicYear} • {enrolment.semester} • {new Date(enrolment.enrolledAt).toLocaleString()}
                </p>
              </div>
            ))}
            {enrolments.length === 0 ? (
              <p className="text-sm text-muted-foreground">No enrolments created yet.</p>
            ) : null}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
