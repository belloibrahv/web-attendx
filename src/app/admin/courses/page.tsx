"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";

type CourseRecord = {
  id: string;
  courseCode: string;
  courseTitle: string;
  creditUnits: number;
  department: string;
  semester: string;
  lecturer: { firstName: string; lastName: string };
};

type LecturerRecord = {
  id: string;
  firstName: string;
  lastName: string;
  staffId: string;
};

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<CourseRecord[]>([]);
  const [lecturers, setLecturers] = useState<LecturerRecord[]>([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    courseCode: "",
    courseTitle: "",
    creditUnits: 3,
    department: "",
    semester: "",
    lecturerId: "",
  });

  async function loadData() {
    const response = await fetch("/api/admin/courses");
    const data = await response.json();
    if (response.ok && data.ok) {
      setCourses(data.courses);
      setLecturers(data.lecturers);
      if (data.lecturers.length > 0 && !form.lecturerId) {
        setForm((v) => ({ ...v, lecturerId: data.lecturers[0].id }));
      }
    }
  }

  useEffect(() => {
    void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function createCourse() {
    setStatus("");
    const response = await fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, creditUnits: Number(form.creditUnits) }),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setStatus(`Error: ${data.message ?? "Failed to create course."}`);
      return;
    }
    setStatus("Course created successfully.");
    setForm((v) => ({ ...v, courseCode: "", courseTitle: "" }));
    await loadData();
  }

  return (
    <DashboardShell role="admin" title="Course Management">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Create Course</h2>
          {!lecturers.length ? (
            <p className="mt-2 text-sm text-muted-foreground">
              No lecturers available yet.{" "}
              <Link href="/admin/lecturers" className="text-primary underline-offset-2 hover:underline">
                Create lecturer profiles first
              </Link>
              .
            </p>
          ) : null}
          <div className="mt-3 grid gap-2">
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Course code" value={form.courseCode} onChange={(e) => setForm((v) => ({ ...v, courseCode: e.target.value }))} />
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Course title" value={form.courseTitle} onChange={(e) => setForm((v) => ({ ...v, courseTitle: e.target.value }))} />
            <div className="grid grid-cols-3 gap-2">
              <input className="rounded-md border bg-background px-3 py-2 text-sm" type="number" min={1} max={8} value={form.creditUnits} onChange={(e) => setForm((v) => ({ ...v, creditUnits: Number(e.target.value) }))} />
              <input className="rounded-md border bg-background px-3 py-2 text-sm col-span-2" placeholder="Department" value={form.department} onChange={(e) => setForm((v) => ({ ...v, department: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Semester" value={form.semester} onChange={(e) => setForm((v) => ({ ...v, semester: e.target.value }))} />
              <select className="rounded-md border bg-background px-3 py-2 text-sm" value={form.lecturerId} onChange={(e) => setForm((v) => ({ ...v, lecturerId: e.target.value }))}>
                {lecturers.map((lecturer) => (
                  <option key={lecturer.id} value={lecturer.id}>
                    {lecturer.staffId} - {lecturer.firstName} {lecturer.lastName}
                  </option>
                ))}
              </select>
            </div>
            <Button onClick={createCourse} disabled={!lecturers.length}>Create course</Button>
            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Course Directory ({courses.length})</h2>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
            {courses.map((course) => (
              <div key={course.id} className="rounded-md border p-2 text-sm">
                <p className="font-medium">
                  {course.courseCode} - {course.courseTitle}
                </p>
                <p className="text-xs text-muted-foreground">
                  {course.department} • {course.semester} • {course.creditUnits} units •{" "}
                  {course.lecturer.firstName} {course.lecturer.lastName}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
