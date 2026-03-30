import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, BarChart3, QrCode, Shield, Users } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { appName, schoolProfile } from "@/data/site";

type AuthShellProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
  footer?: ReactNode;
};

const accessHighlights = [
  {
    title: "Role-Based Access",
    description: "Students, lecturers, and administrators access dedicated dashboards and controlled workflows.",
    icon: Users,
  },
  {
    title: "Time-Bound QR Sessions",
    description: "Lecturers control session validity windows and live attendance capture from the classroom.",
    icon: QrCode,
  },
  {
    title: "Audit-Ready Records",
    description: "Attendance data is validated, stored securely, and prepared for reporting and export.",
    icon: BarChart3,
  },
];

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
}: AuthShellProps) {
  return (
    <div className="min-h-screen overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(0,35,95,0.14),transparent_28%),radial-gradient(circle_at_bottom_right,rgba(191,124,9,0.18),transparent_24%),linear-gradient(135deg,#f8fafc_0%,#eef4ff_40%,#fff8ea_100%)]">
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute left-[-80px] top-24 h-72 w-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute right-[-40px] top-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" />
        <div className="absolute bottom-[-80px] left-1/3 h-80 w-80 rounded-full bg-secondary/15 blur-3xl" />
      </div>

      <header className="relative z-10 px-4 py-6 sm:px-6">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <BrandMark />
          <Link
            href="/home"
            className="inline-flex items-center gap-2 rounded-xl border border-white/60 bg-white/75 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm backdrop-blur-sm transition hover:border-primary/20 hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Homepage
          </Link>
        </div>
      </header>

      <main className="relative z-10 mx-auto grid max-w-6xl gap-8 px-4 pb-10 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <section className="relative overflow-hidden rounded-[2rem] border border-white/20 bg-slate-950 px-6 py-8 text-white shadow-[0_30px_80px_-30px_rgba(0,35,95,0.55)] sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,204,7,0.14),transparent_22%),radial-gradient(circle_at_bottom_left,rgba(38,91,39,0.22),transparent_30%),linear-gradient(145deg,rgba(0,35,95,0.98),rgba(2,18,43,0.96))]" />
          <div className="relative space-y-8">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-secondary">
              <Shield className="h-4 w-4" />
              {eyebrow}
            </div>

            <div className="space-y-5">
              <div className="flex items-center gap-4">
                <div className="relative flex h-20 w-20 items-center justify-center overflow-hidden rounded-3xl border border-white/10 bg-white/10 shadow-lg">
                  <Image
                    src="/logo.png"
                    alt="Tai Solarin University of Education logo"
                    fill
                    className="object-contain p-3"
                    sizes="80px"
                    priority
                  />
                </div>
                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-white/60">Institutional Access</p>
                  <h1 className="font-heading text-3xl font-bold text-white sm:text-4xl">{appName}</h1>
                </div>
              </div>

              <p className="max-w-xl text-base leading-8 text-white/80">{schoolProfile.summary}</p>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Institution</div>
                <div className="mt-2 text-lg font-semibold text-white">{schoolProfile.abbreviation}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">Department</div>
                <div className="mt-2 text-lg font-semibold text-white">CIS</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/10 p-4">
                <div className="text-xs uppercase tracking-[0.2em] text-white/50">QR Window</div>
                <div className="mt-2 text-lg font-semibold text-white">5 to 15 mins</div>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-secondary/85">Platform Value</p>
                <h2 className="mt-3 font-heading text-3xl font-semibold leading-tight text-white">
                  Secure access for a real institutional attendance workflow.
                </h2>
              </div>

              <div className="grid gap-3">
                {accessHighlights.map((item) => (
                  <div
                    key={item.title}
                    className="flex gap-4 rounded-2xl border border-white/10 bg-white/10 p-4 backdrop-blur-sm"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-white/10 text-secondary">
                      <item.icon className="h-5 w-5" />
                    </div>
                    <div className="space-y-1">
                      <h3 className="text-sm font-semibold text-white">{item.title}</h3>
                      <p className="text-sm leading-7 text-white/70">{item.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-[1.75rem] border border-white/10 bg-white/10 p-5">
              <p className="text-sm uppercase tracking-[0.24em] text-secondary/80">Academic Context</p>
              <p className="mt-3 text-sm leading-7 text-white/80">
                {schoolProfile.name}, {schoolProfile.location}. {schoolProfile.college}.
              </p>
            </div>
          </div>
        </section>

        <section className="relative">
          <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/70 to-white/40 shadow-[0_24px_70px_-35px_rgba(0,35,95,0.32)]" />
          <div className="relative rounded-[2rem] border border-white/60 bg-white/90 p-7 shadow-xl backdrop-blur-xl sm:p-8">
            <div className="mb-8 space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                <span className="h-2 w-2 rounded-full bg-accent" />
                {eyebrow}
              </div>
              <div className="space-y-2">
                <h2 className="font-heading text-3xl font-bold text-slate-950">{title}</h2>
                <p className="text-sm leading-7 text-slate-600">{description}</p>
              </div>
            </div>

            <div>{children}</div>

            {footer ? <div className="mt-8 border-t border-slate-200 pt-6">{footer}</div> : null}
          </div>
        </section>
      </main>
    </div>
  );
}
