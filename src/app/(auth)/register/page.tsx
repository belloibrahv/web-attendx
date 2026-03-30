"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import { AlertCircle, CheckCircle2 } from "lucide-react";
import { AuthShell } from "@/components/auth/auth-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LoadingSpinner } from "@/components/ui/loading";

type RegisterRole = "STUDENT" | "LECTURER";

type RegisterForm = {
  role: RegisterRole;
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  matricNumber: string;
  level: string;
  staffId: string;
  title: string;
  password: string;
  confirmPassword: string;
};

const defaultForm: RegisterForm = {
  role: "STUDENT",
  firstName: "",
  lastName: "",
  email: "",
  department: "Computer and Information Science",
  matricNumber: "",
  level: "400",
  staffId: "",
  title: "Dr.",
  password: "",
  confirmPassword: "",
};

export default function RegisterPage() {
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(defaultForm);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const roleSummary = useMemo(() => {
    if (form.role === "LECTURER") {
      return "Create a lecturer account for session generation, live attendance supervision, and reporting.";
    }
    return "Create a student account for QR scanning, attendance history, and course-level participation tracking.";
  }, [form.role]);

  function updateField<K extends keyof RegisterForm>(field: K, value: RegisterForm[K]) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleRegister(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (form.password !== form.confirmPassword) {
      setError("Password confirmation does not match.");
      return;
    }

    setIsLoading(true);

    try {
      const payload =
        form.role === "STUDENT"
          ? {
              role: form.role,
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              department: form.department,
              matricNumber: form.matricNumber,
              level: form.level,
              password: form.password,
            }
          : {
              role: form.role,
              firstName: form.firstName,
              lastName: form.lastName,
              email: form.email,
              department: form.department,
              staffId: form.staffId,
              title: form.title,
              password: form.password,
            };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result?.ok) {
        setError(result?.message ?? "Registration failed. Please review the form and try again.");
        return;
      }

      setSuccess("Account created successfully. Redirecting you to your dashboard...");

      const signInResult = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });

      if (signInResult?.error) {
        router.replace("/login");
        return;
      }

      router.replace(form.role === "LECTURER" ? "/lecturer" : "/student");
    } catch {
      setError("Registration could not be completed right now. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <AuthShell
      eyebrow="Create Account"
      title="Register a new platform user"
      description="Open a TASUED attendance account as a student or lecturer. Administrator accounts are reserved for controlled institutional provisioning."
      footer={
        <div className="space-y-3 text-sm text-slate-600">
          <p>
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-primary hover:text-accent">
              Sign in here
            </Link>
            .
          </p>
          <p>Student and lecturer registrations are enabled here; admin accounts remain restricted.</p>
        </div>
      }
    >
      <form onSubmit={handleRegister} className="space-y-6">
        <div className="space-y-3">
          <Label className="font-medium text-slate-700">Account Type</Label>
          <div className="grid grid-cols-2 gap-3">
            {(["STUDENT", "LECTURER"] as const).map((role) => (
              <button
                key={role}
                type="button"
                onClick={() => updateField("role", role)}
                className={`rounded-2xl border px-4 py-3 text-left transition ${
                  form.role === role
                    ? "border-primary bg-primary/6 text-primary shadow-sm"
                    : "border-slate-200 bg-white text-slate-600 hover:border-primary/20 hover:text-slate-900"
                }`}
              >
                <div className="text-sm font-semibold">
                  {role === "STUDENT" ? "Student" : "Lecturer"}
                </div>
                <div className="mt-1 text-xs leading-5">
                  {role === "STUDENT" ? "Scan attendance and track attendance history." : "Run sessions and manage live class attendance."}
                </div>
              </button>
            ))}
          </div>
          <p className="text-sm leading-6 text-slate-600">{roleSummary}</p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="firstName" className="font-medium text-slate-700">
              First Name
            </Label>
            <Input
              id="firstName"
              value={form.firstName}
              onChange={(event) => updateField("firstName", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white px-4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName" className="font-medium text-slate-700">
              Last Name
            </Label>
            <Input
              id="lastName"
              value={form.lastName}
              onChange={(event) => updateField("lastName", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white px-4"
              required
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-medium text-slate-700">
              Email Address
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="name@tasued.edu.ng"
              value={form.email}
              onChange={(event) => updateField("email", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white px-4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="department" className="font-medium text-slate-700">
              Department
            </Label>
            <Input
              id="department"
              value={form.department}
              onChange={(event) => updateField("department", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white px-4"
              required
            />
          </div>
        </div>

        {form.role === "STUDENT" ? (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="matricNumber" className="font-medium text-slate-700">
                Matric Number
              </Label>
              <Input
                id="matricNumber"
                value={form.matricNumber}
                onChange={(event) => updateField("matricNumber", event.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white px-4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="level" className="font-medium text-slate-700">
                Level
              </Label>
              <select
                id="level"
                value={form.level}
                onChange={(event) => updateField("level", event.target.value)}
                className="flex h-12 w-full rounded-2xl border border-slate-200 bg-white px-4 text-sm text-slate-900 shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
              >
                {["100", "200", "300", "400", "500"].map((level) => (
                  <option key={level} value={level}>
                    {level} Level
                  </option>
                ))}
              </select>
            </div>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="title" className="font-medium text-slate-700">
                Title
              </Label>
              <Input
                id="title"
                value={form.title}
                onChange={(event) => updateField("title", event.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white px-4"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="staffId" className="font-medium text-slate-700">
                Staff ID
              </Label>
              <Input
                id="staffId"
                value={form.staffId}
                onChange={(event) => updateField("staffId", event.target.value)}
                className="h-12 rounded-2xl border-slate-200 bg-white px-4"
                required
              />
            </div>
          </div>
        )}

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="password" className="font-medium text-slate-700">
              Password
            </Label>
            <Input
              id="password"
              type="password"
              value={form.password}
              onChange={(event) => updateField("password", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white px-4"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="font-medium text-slate-700">
              Confirm Password
            </Label>
            <Input
              id="confirmPassword"
              type="password"
              value={form.confirmPassword}
              onChange={(event) => updateField("confirmPassword", event.target.value)}
              className="h-12 rounded-2xl border-slate-200 bg-white px-4"
              required
            />
          </div>
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-500" />
            <p className="text-sm leading-6 text-red-700">{error}</p>
          </div>
        ) : null}

        {success ? (
          <div className="flex items-start gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
            <p className="text-sm leading-6 text-emerald-700">{success}</p>
          </div>
        ) : null}

        <Button
          type="submit"
          size="lg"
          className="h-12 w-full rounded-2xl bg-gradient-to-r from-primary to-accent text-base font-semibold text-white hover:from-primary/92 hover:to-accent/92"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <LoadingSpinner size="sm" className="mr-2" />
              Creating account...
            </>
          ) : (
            "Create Account"
          )}
        </Button>
      </form>
    </AuthShell>
  );
}
