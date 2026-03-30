import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BarChart3, BookOpen, QrCode, Shield, Users } from "lucide-react";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { ResearchPresentation } from "@/components/research-presentation";
import {
  featureBlocks,
  homepageStats,
  institutionHighlights,
  projectTeam,
  schoolProfile,
  supervisor,
  workflowSteps,
} from "@/data/site";
import { getSafeSession } from "@/lib/safe-session";

const operationalPillars = [
  {
    title: "Lecturer-Controlled Sessions",
    description: "Attendance windows are opened and closed by the lecturer with time-bound QR session validity.",
    icon: QrCode,
  },
  {
    title: "Verified Student Capture",
    description: "Students use browser-based scanning while the backend checks token integrity, enrolment, and duplicate rules.",
    icon: Shield,
  },
  {
    title: "Institution Reporting",
    description: "Attendance records feed lecturer and administrative reporting with audit-ready operational visibility.",
    icon: BarChart3,
  },
];

const supervisorFocus = [
  "Provides academic oversight for the system design, implementation discipline, and institutional fit of the project.",
  "Anchors the work within the Department of Computer and Information Science and the wider academic objectives of TASUED.",
  "Supports the project's emphasis on security, operational clarity, and credible real-world deployment.",
];

export default async function HomePage() {
  // Use safe session handling to prevent JWT errors
  const { session, error } = await getSafeSession();
  
  // If we have a valid session with a role, redirect to appropriate dashboard
  if (session?.user?.role && !error) {
    const role = session.user.role;
    if (role === "ADMIN") redirect("/admin");
    if (role === "LECTURER") redirect("/lecturer");
    if (role === "STUDENT") redirect("/student");
  }
  
  // If there was a session error, we'll just show the homepage (user needs to login again)

  const supervisorImageClass = supervisor.image.endsWith(".svg")
    ? "object-contain p-6"
    : "object-cover object-top";

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(0,35,95,0.12),transparent_25%),radial-gradient(circle_at_bottom_right,rgba(191,124,9,0.14),transparent_22%),linear-gradient(135deg,#f8fafc_0%,#eef4ff_42%,#fffaf0_100%)]">
      <header className="fixed left-1/2 top-4 z-50 w-full max-w-6xl -translate-x-1/2 px-4">
        <div className="flex items-center justify-between rounded-2xl border border-white/50 bg-white/90 px-3 py-2 shadow-lg shadow-primary/10 backdrop-blur-xl sm:px-6 sm:py-3">
          <BrandMark compact className="sm:!compact-false" />
          <nav className="hidden items-center gap-4 md:flex lg:gap-6">
            <Link href="#research" className="text-sm font-medium text-slate-600 transition hover:text-primary">
              Research
            </Link>
            <Link href="#team" className="text-sm font-medium text-slate-600 transition hover:text-primary">
              Team
            </Link>
            <Link href="#supervisor" className="text-sm font-medium text-slate-600 transition hover:text-primary">
              Supervisor
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/register"
              className="hidden rounded-xl border border-primary/15 bg-white px-3 py-1.5 text-sm font-medium text-primary transition hover:border-primary/25 hover:bg-primary/5 sm:inline-flex sm:px-4 sm:py-2"
            >
              Register
            </Link>
            <Link
              href="/login"
              className="inline-flex rounded-xl bg-gradient-to-r from-primary to-accent px-3 py-1.5 text-sm font-medium text-white shadow-lg shadow-primary/15 transition hover:-translate-y-0.5 hover:shadow-xl sm:px-4 sm:py-2"
            >
              Login
            </Link>
          </div>
        </div>
      </header>

      <main className="pt-20 sm:pt-24">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute left-2 top-10 h-48 w-48 rounded-full bg-primary/12 blur-3xl sm:left-4 sm:top-20 sm:h-72 sm:w-72" />
            <div className="absolute right-3 top-16 h-64 w-64 rounded-full bg-accent/10 blur-3xl sm:right-6 sm:top-32 sm:h-96 sm:w-96" />
            <div className="absolute bottom-[-20px] left-1/4 h-48 w-48 rounded-full bg-secondary/15 blur-3xl sm:bottom-[-40px] sm:left-1/3 sm:h-72 sm:w-72" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-20 lg:px-8 lg:py-28">
            <div className="grid items-start gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16">
              <div className="space-y-8 lg:space-y-10">
                <div className="space-y-6">
                  <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/70 px-3 py-1.5 text-xs font-medium text-primary shadow-sm sm:px-4 sm:py-2 sm:text-sm">
                    <span className="h-2 w-2 rounded-full bg-accent" />
                    <span className="hidden sm:inline">Institutional Deployment-Ready Attendance Platform</span>
                    <span className="sm:hidden">TASUED Attendance Platform</span>
                  </div>

                  <div className="space-y-4">
                    <h1 className="font-heading text-3xl font-bold leading-tight text-slate-950 sm:text-5xl lg:text-7xl xl:leading-tight">
                      Mobile Attendance
                      <span className="block bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                        Governance for TASUED
                      </span>
                    </h1>
                    <p className="max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8 lg:text-xl">
                      {schoolProfile.summary}
                    </p>
                    <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base sm:leading-8">
                      {schoolProfile.mission}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2 sm:gap-3">
                    <div className="rounded-full border border-primary/15 bg-white/85 px-3 py-1.5 text-xs text-slate-700 shadow-sm sm:px-4 sm:py-2 sm:text-sm">
                      <span className="font-semibold text-primary">Dept:</span> <span className="hidden sm:inline">{schoolProfile.department}</span><span className="sm:hidden">CIS</span>
                    </div>
                    <div className="rounded-full border border-primary/15 bg-white/85 px-3 py-1.5 text-xs text-slate-700 shadow-sm sm:px-4 sm:py-2 sm:text-sm">
                      <span className="font-semibold text-primary">Location:</span> {schoolProfile.location}
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-primary to-accent px-6 py-3 text-base font-semibold text-white shadow-xl shadow-primary/15 transition hover:-translate-y-1 hover:shadow-2xl sm:gap-3 sm:px-8 sm:py-4 sm:text-lg"
                  >
                    Access Platform
                    <ArrowRight className="h-4 w-4 sm:h-5 sm:w-5" />
                  </Link>
                  <Link
                    href="/register"
                    className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/90 px-6 py-3 text-base font-semibold text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:border-primary/20 hover:text-primary sm:px-8 sm:py-4 sm:text-lg"
                  >
                    Register User
                  </Link>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  {institutionHighlights.map((highlight) => (
                    <div
                      key={highlight}
                      className="rounded-2xl border border-white/60 bg-white/75 px-4 py-3 text-sm leading-6 text-slate-700 shadow-sm backdrop-blur-sm sm:px-5 sm:py-4 sm:leading-7"
                    >
                      {highlight}
                    </div>
                  ))}
                </div>
              </div>

              <div className="relative order-first lg:order-last">
                <div className="absolute inset-0 rounded-[2.25rem] bg-gradient-to-br from-primary/20 via-white/30 to-accent/15 blur-2xl" />
                <div className="relative overflow-hidden rounded-[2.25rem] border border-slate-200/70 bg-white/90 p-4 shadow-[0_30px_80px_-40px_rgba(0,35,95,0.45)] backdrop-blur-xl sm:p-6 lg:p-8">
                  <div className="absolute inset-0 bg-[linear-gradient(140deg,rgba(0,35,95,0.04),transparent_45%,rgba(191,124,9,0.08))]" />
                  <div className="relative space-y-6 sm:space-y-8">
                    <div className="flex items-start justify-between gap-3 sm:gap-4">
                      <div className="space-y-3">
                        <div className="inline-flex items-center gap-2 rounded-full border border-primary/10 bg-primary/5 px-3 py-1.5 text-xs font-medium text-primary sm:px-4 sm:py-2 sm:text-sm">
                          <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                          <span className="hidden sm:inline">Purposeful Platform Summary</span>
                          <span className="sm:hidden">Platform Summary</span>
                        </div>
                        <div>
                          <h2 className="font-heading text-xl font-bold text-slate-950 sm:text-2xl lg:text-3xl">
                            Built for real lecture attendance operations.
                          </h2>
                          <p className="mt-2 max-w-xl text-xs leading-6 text-slate-600 sm:mt-3 sm:text-sm sm:leading-7">
                            The banner now focuses on what the system actually does for the institution:
                            controlled attendance sessions, verified QR scanning, and reporting that can support departmental administration.
                          </p>
                        </div>
                      </div>

                      <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-md sm:h-16 sm:w-16 sm:rounded-3xl lg:h-20 lg:w-20">
                        <Image
                          src="/main-logo.png"
                          alt="Tai Solarin University of Education logo"
                          fill
                          className="object-contain p-2 sm:p-3"
                          sizes="(max-width: 640px) 48px, (max-width: 1024px) 64px, 80px"
                          priority
                        />
                      </div>
                    </div>

                    <div className="grid gap-2 sm:gap-3 sm:grid-cols-2">
                      {homepageStats.map((stat) => (
                        <div key={stat.label} className="rounded-xl border border-slate-200 bg-white/92 p-3 shadow-sm sm:rounded-2xl sm:p-4">
                          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">
                            {stat.label}
                          </div>
                          <div className="mt-1 text-xl font-bold text-slate-950 sm:mt-2 sm:text-3xl">{stat.value}</div>
                          <p className="mt-1 text-xs leading-5 text-slate-600 sm:mt-2 sm:text-sm sm:leading-6">{stat.detail}</p>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-3">
                      <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                        Operational Pillars
                      </div>
                      <div className="grid gap-2 sm:gap-3">
                        {operationalPillars.map((pillar) => (
                          <div
                            key={pillar.title}
                            className="flex gap-3 rounded-xl border border-primary/10 bg-gradient-to-r from-primary/[0.04] to-accent/[0.03] p-3 sm:gap-4 sm:rounded-2xl sm:p-4"
                          >
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-white text-primary shadow-sm sm:h-11 sm:w-11 sm:rounded-2xl">
                              <pillar.icon className="h-4 w-4 sm:h-5 sm:w-5" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-xs font-semibold text-slate-900 sm:text-sm">{pillar.title}</h3>
                              <p className="text-xs leading-6 text-slate-600 sm:text-sm sm:leading-7">{pillar.description}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section id="research" className="relative py-12 sm:py-20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="grid items-start gap-6 lg:grid-cols-[0.42fr_0.58fr] lg:gap-8">
              <div className="space-y-4 sm:space-y-6">
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-3 py-1.5 text-xs font-medium text-primary shadow-sm sm:px-4 sm:py-2 sm:text-sm">
                  <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
                  Research Explorer
                </div>
                <div className="space-y-3 sm:space-y-4">
                  <h2 className="font-heading text-2xl font-bold text-slate-950 sm:text-4xl lg:text-5xl">
                    Explore the paper as a guided presentation.
                  </h2>
                  <p className="text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
                    This section separates research evidence from the homepage banner and gives
                    visitors a clearer, dedicated place to review the study focus, objectives,
                    architecture, QR workflow, and measured outcomes.
                  </p>
                </div>

                <div className="grid gap-3">
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Factual Basis
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      The explorer uses details drawn from your Chapters One, Three, and Four, including the stated objectives, architecture logic, QR session controls, and UAT findings.
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/60 bg-white/80 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">
                      Presentation Utility
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-700">
                      It works as an on-page presentation aid for project defence, supervisor review, and stakeholder exploration without overwhelming the banner itself.
                    </p>
                  </div>
                </div>
              </div>

              <div>
                <ResearchPresentation />
              </div>
            </div>
          </div>
        </section>

        <section id="features" className="relative py-20 bg-white/45">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                How The System Works
              </div>
              <h2 className="font-heading text-4xl font-bold text-slate-950 lg:text-5xl">
                Core capabilities for a credible institutional workflow
              </h2>
              <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-600">
                The platform is organized around governance, secure attendance capture, mobile accessibility, and reporting that can support departmental administration.
              </p>
            </div>

            <div className="mt-14 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {featureBlocks.map((feature) => (
                <div
                  key={feature.title}
                  className="rounded-[1.75rem] border border-slate-200 bg-white/90 p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
                >
                  <h3 className="text-xl font-semibold text-slate-900">{feature.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{feature.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-16 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {workflowSteps.map((step) => (
                <div
                  key={step.step}
                  className="rounded-[1.75rem] border border-primary/10 bg-gradient-to-br from-white to-primary/[0.04] p-6 shadow-sm"
                >
                  <div className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
                    Step {step.step}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold text-slate-900">{step.title}</h3>
                  <p className="mt-4 text-sm leading-7 text-slate-600">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="team" className="relative py-20">
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute right-0 top-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
            <div className="absolute bottom-0 left-0 h-80 w-80 rounded-full bg-accent/10 blur-3xl" />
          </div>

          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-white/85 px-4 py-2 text-sm font-medium text-primary shadow-sm">
                <Users className="h-4 w-4" />
                Project Team
              </div>
              <h2 className="font-heading text-4xl font-bold text-slate-950 lg:text-5xl">
                The student team behind TASUED AttendX
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-slate-600">
                Final year Computer Science students working across research, engineering, documentation, and quality assurance.
              </p>
            </div>

            <div className="mt-14 grid gap-8 md:grid-cols-2 xl:grid-cols-5">
              {projectTeam.map((member) => (
                <div
                  key={member.name}
                  className="group rounded-[1.75rem] border border-white/60 bg-white/80 p-6 text-center shadow-sm backdrop-blur-sm transition hover:-translate-y-2 hover:shadow-lg"
                >
                  <div className="relative mx-auto h-24 w-24 overflow-hidden rounded-full border-4 border-white shadow-lg">
                    <Image src={member.avatar} alt={member.name} fill className="object-cover" sizes="96px" />
                  </div>
                  <div className="mt-5 space-y-2">
                    <h3 className="text-base font-semibold leading-6 text-slate-900">{member.name}</h3>
                    <p className="text-xs font-medium tracking-[0.16em] text-slate-500">{member.matricNumber}</p>
                    <p className="text-sm leading-7 text-slate-600">{member.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="supervisor" className="relative py-20 bg-white/45">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="text-center space-y-5">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary/15 bg-primary/5 px-4 py-2 text-sm font-medium text-primary">
                Academic Supervision
              </div>
              <h2 className="font-heading text-4xl font-bold text-slate-950 lg:text-5xl">
                Supervising lecturer and project guidance
              </h2>
              <p className="mx-auto max-w-3xl text-lg leading-8 text-slate-600">
                The supervisor section now presents the lecturer portrait more intentionally, within a stronger academic layout that reflects formal oversight and institutional credibility.
              </p>
            </div>

            <div className="mt-16 grid items-center gap-10 lg:grid-cols-[0.95fr_1.05fr]">
              <div className="relative mx-auto w-full max-w-xl">
                <div className="absolute inset-0 rounded-[2.5rem] bg-gradient-to-br from-primary/25 via-accent/20 to-secondary/20 blur-3xl" />
                <div className="relative overflow-hidden rounded-[2.5rem] border border-white/30 bg-slate-950 p-4 shadow-[0_30px_80px_-35px_rgba(0,35,95,0.55)]">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(247,204,7,0.16),transparent_20%),linear-gradient(160deg,rgba(0,35,95,0.97),rgba(4,22,49,0.98))]" />
                  <div className="relative rounded-[2rem] border border-white/10 bg-white/5 p-4">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/6">
                      <Image
                        src={supervisor.image}
                        alt={supervisor.name}
                        fill
                        className={supervisorImageClass}
                        sizes="(max-width: 1024px) 100vw, 40vw"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent p-6">
                        <div className="inline-flex rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-secondary">
                          Supervising Lecturer
                        </div>
                        <h3 className="mt-4 font-heading text-3xl font-bold text-white">{supervisor.name}</h3>
                        <p className="mt-2 text-sm leading-7 text-white/80">{supervisor.department}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="inline-flex rounded-full border border-primary/15 bg-white px-4 py-2 text-sm font-medium text-primary shadow-sm">
                    {supervisor.title}
                  </div>
                  <h3 className="font-heading text-4xl font-bold text-slate-950">
                    Formal academic oversight for a deployable system.
                  </h3>
                  <p className="text-lg leading-8 text-slate-600">{supervisor.note}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      Institution
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{schoolProfile.name}</p>
                  </div>
                  <div className="rounded-[1.5rem] border border-slate-200 bg-white/90 p-5 shadow-sm">
                    <div className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-500">
                      College
                    </div>
                    <p className="mt-3 text-sm leading-7 text-slate-700">{schoolProfile.college}</p>
                  </div>
                </div>

                <div className="rounded-[1.75rem] border border-primary/10 bg-gradient-to-br from-white to-primary/[0.04] p-6 shadow-sm">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Supervisor Focus
                  </div>
                  <div className="mt-4 space-y-3">
                    {supervisorFocus.map((item) => (
                      <div key={item} className="flex items-start gap-3">
                        <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                        <p className="text-sm leading-7 text-slate-700">{item}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden py-20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary/95 to-accent" />
          <div className="absolute left-10 top-10 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
          <div className="absolute bottom-10 right-10 h-80 w-80 rounded-full bg-secondary/20 blur-3xl" />

          <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
            <div className="space-y-6">
              <h2 className="font-heading text-4xl font-bold text-white lg:text-5xl">
                Ready to use the TASUED attendance platform?
              </h2>
              <p className="mx-auto max-w-2xl text-lg leading-8 text-white/90">
                Sign in to continue existing academic operations or register a new student or lecturer account for supervised use within the platform.
              </p>
            </div>

            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link
                href="/login"
                className="inline-flex items-center gap-3 rounded-2xl bg-white px-8 py-4 text-lg font-semibold text-primary shadow-lg transition hover:-translate-y-1 hover:shadow-2xl"
              >
                Login Now
                <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-2xl border border-white/20 bg-white/10 px-8 py-4 text-lg font-semibold text-white backdrop-blur-sm transition hover:-translate-y-0.5 hover:bg-white/16"
              >
                Register User
              </Link>
            </div>
          </div>
        </section>
      </main>

      <footer className="relative overflow-hidden bg-slate-950 text-white">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-primary/20 to-slate-950" />
        <div className="relative mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-4 py-12 text-center sm:px-6 sm:text-left lg:flex-row lg:px-8">
          <div className="flex items-center gap-4">
            <BrandMark compact />
            <div className="text-sm text-slate-300">
              <div className="font-semibold">{schoolProfile.name}</div>
              <div className="text-slate-400">{schoolProfile.department}</div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2 text-sm text-slate-400 sm:flex-row sm:gap-6">
            <span>© 2026 Final Year Project</span>
            <span className="hidden sm:inline">•</span>
            <span>{schoolProfile.location}</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
