"use client";

import { useEffect, useState } from "react";
import { DashboardShell } from "@/components/layout/dashboard-shell";
import { Button } from "@/components/ui/button";

type LecturerRecord = {
  id: string;
  staffId: string;
  title: string;
  firstName: string;
  lastName: string;
  department: string;
  user: { email: string };
  _count: { courses: number; sessions: number };
};

export default function AdminLecturersPage() {
  const [lecturers, setLecturers] = useState<LecturerRecord[]>([]);
  const [status, setStatus] = useState("");
  const [form, setForm] = useState({
    email: "",
    password: "",
    staffId: "",
    title: "Dr.",
    firstName: "",
    lastName: "",
    department: "",
  });

  async function loadLecturers() {
    const response = await fetch("/api/admin/lecturers");
    const data = await response.json();
    if (response.ok && data.ok) {
      setLecturers(data.lecturers);
    }
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadLecturers();
  }, []);

  async function createLecturer() {
    setStatus("");
    const response = await fetch("/api/admin/lecturers", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    if (!response.ok || !data.ok) {
      setStatus(`Error: ${data.message ?? "Failed to create lecturer."}`);
      return;
    }

    setStatus("Lecturer created successfully.");
    setForm({
      email: "",
      password: "",
      staffId: "",
      title: "Dr.",
      firstName: "",
      lastName: "",
      department: "",
    });
    await loadLecturers();
  }

  return (
    <DashboardShell role="admin" title="Lecturer Management">
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Create Lecturer</h2>
          <div className="mt-3 grid gap-2">
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Institutional email" value={form.email} onChange={(e) => setForm((current) => ({ ...current, email: e.target.value }))} />
            <input className="rounded-md border bg-background px-3 py-2 text-sm" type="password" placeholder="Password" value={form.password} onChange={(e) => setForm((current) => ({ ...current, password: e.target.value }))} />
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Staff ID" value={form.staffId} onChange={(e) => setForm((current) => ({ ...current, staffId: e.target.value }))} />
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Title" value={form.title} onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="First name" value={form.firstName} onChange={(e) => setForm((current) => ({ ...current, firstName: e.target.value }))} />
              <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Last name" value={form.lastName} onChange={(e) => setForm((current) => ({ ...current, lastName: e.target.value }))} />
            </div>
            <input className="rounded-md border bg-background px-3 py-2 text-sm" placeholder="Department" value={form.department} onChange={(e) => setForm((current) => ({ ...current, department: e.target.value }))} />
            <Button onClick={createLecturer}>Create lecturer</Button>
            {status ? <p className="text-sm text-muted-foreground">{status}</p> : null}
          </div>
        </div>
        <div className="rounded-xl border bg-card p-4">
          <h2 className="font-heading text-lg">Lecturer Directory ({lecturers.length})</h2>
          <div className="mt-3 max-h-[420px] space-y-2 overflow-auto">
            {lecturers.map((lecturer) => (
              <div key={lecturer.id} className="rounded-md border p-3 text-sm">
                <p className="font-medium">
                  {lecturer.title} {lecturer.firstName} {lecturer.lastName}
                </p>
                <p className="text-xs text-muted-foreground">
                  {lecturer.staffId} • {lecturer.department} • {lecturer.user.email}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {lecturer._count.courses} course(s) assigned • {lecturer._count.sessions} session(s) created
                </p>
              </div>
            ))}
            {lecturers.length === 0 ? <p className="text-sm text-muted-foreground">No lecturers registered yet.</p> : null}
          </div>
        </div>
      </div>
    </DashboardShell>
  );
}
