import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpenCheck, Building2, ShieldCheck, Smartphone, Users, BarChart3, Clock, CheckCircle, GraduationCap, BookOpen } from "lucide-react";
import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { BrandMark } from "@/components/brand-mark";
import { Badge } from "@/components/ui/badge";
import {
  appName,
  featureBlocks,
  homepageStats,
  institutionHighlights,
  projectTeam,
  schoolProfile,
  supervisor,
  workflowSteps,
} from "@/data/site";
import { authOptions } from "@/lib/auth";

const primaryLinkClass =
  "inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-2.5 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/85 hover:shadow-lg hover:shadow-primary/25";

const primaryLinkClassLarge =
  "inline-flex h-11 items-center justify-center gap-1.5 rounded-lg border border-transparent bg-primary px-4 text-sm font-medium text-primary-foreground transition-all hover:bg-primary/85 hover:shadow-lg hover:shadow-primary/25 hover:scale-105";

const ghostLinkClass =
  "inline-flex h-7 items-center justify-center rounded-[12px] px-2.5 text-[0.8rem] font-medium text-foreground transition-all hover:bg-muted hover:scale-105";

const outlineLinkClass =
  "inline-flex h-9 items-center justify-center rounded-lg border border-border bg-background px-3 text-sm font-medium text-foreground transition-all hover:bg-muted hover:border-primary/50 hover:shadow-md";

export default async function HomePage() {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (role === "ADMIN") redirect("/admin");
  if (role === "LECTURER") redirect("/lecturer");
  if (role === "STUDENT") redirect("/student");

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top_left,rgba(247,204,7,0.22),transparent_24%),radial-gradient(circle_at_top_right,rgba(0,35,95,0.16),transparent_32%),linear-gradient(180deg,#f9fbff_0%,#eef4ff_42%,#f8fafc_100%)] text-foreground">
      <div className="hero-grid">
        <header className="sticky top-0 z-40 mx-auto flex max-w-7xl items-center justify-between border-b border-white/20 bg-white/80 px-4 py-4 backdrop-blur-md sm:px-6 lg:px-8">
          <BrandMark />
          <nav className="hidden items-center gap-6 md:flex">
            <Link href="#features" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Features
            </Link>
            <Link href="#project-team" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Team
            </Link>
            <Link href="#supervisor" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              Supervisor
            </Link>
          </nav>
          <div className="flex items-center gap-2 sm:gap-3">
            <Link href="/login" className={ghostLinkClass}>
              Login
            </Link>
            <Link href="/login" className={primaryLinkClass}>
              Open System
            </Link>
          </div>
        </header>

        <main className="mx-auto max-w-7xl space-y-16 px-4 pb-16 pt-8 sm:px-6 lg:px-8">
          {/* Hero Section */}
          <section className="grid gap-8 pb-4 lg:grid-cols-[1.16fr_0.84fr] lg:items-center">
            <div className="space-y-8 animate-reveal-up">
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-4">
                  <CheckCircle className="mr-1 h-3 w-3" />
                  Production-Ready System
                </Badge>
                <h1 className="max-w-4xl font-heading text-4xl leading-tight text-primary sm:text-5xl lg:text-6xl">
                  Professional QR Attendance Management for{" "}
                  <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                    TASUED
                  </span>
                </h1>
                <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
                  {schoolProfile.summary} Built with enterprise-grade security, real-time analytics, and mobile-first design for seamless institutional deployment.
                </p>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <Link href="/login" className={primaryLinkClassLarge}>
                  Access {appName}
                  <ArrowRight className="size-4" />
                </Link>
                <Link href="#system-overview" className={outlineLinkClass}>
                  Explore Features
                </Link>
              </div>

              {/* Key Metrics */}
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                {homepageStats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className="group animate-reveal-up rounded-[28px] border border-white/65 bg-white/88 p-5 shadow-lg shadow-primary/8 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-primary/15 hover:scale-105"
                    style={{ animationDelay: `${index * 90}ms` }}
                  >
                    <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">{stat.label}</p>
                    <p className="mt-3 font-heading text-4xl text-primary group-hover:text-accent transition-colors">{stat.value}</p>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.detail}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Enhanced Institution Card */}
            <div className="relative">
              <div className="absolute -left-6 top-10 h-32 w-32 rounded-full bg-secondary/35 blur-3xl" />
              <div className="absolute -right-4 top-20 h-28 w-28 rounded-[30px] bg-primary/15 blur-2xl" />
              <div className="absolute bottom-8 right-10 h-24 w-24 rounded-full bg-green-700/20 blur-2xl" />
              <div className="animate-float-slow relative overflow-hidden rounded-[36px] border border-primary/10 bg-[linear-gradient(160deg,rgba(0,35,95,0.98)_0%,rgba(17,59,124,0.96)_55%,rgba(38,91,39,0.96)_100%)] p-6 text-white shadow-2xl shadow-primary/20">
                <div className="animate-drift absolute -right-14 top-12 h-44 w-44 rotate-45 rounded-[36px] bg-secondary/25" />
                <div className="absolute -left-12 bottom-10 h-28 w-28 rounded-full bg-white/10" />
                <div className="relative space-y-6">
                  <div className="inline-flex rounded-full bg-white/10 p-3">
                    <Image
                      src="/logo.png"
                      alt="TASUED logo"
                      width={180}
                      height={48}
                      className="h-auto w-40 object-contain"
                      priority
                    />
                  </div>
                  <div className="space-y-3">
                    <Badge variant="secondary" className="bg-white/20 text-white border-white/30">
                      Institution Profile
                    </Badge>
                    <h2 className="font-heading text-3xl">{schoolProfile.name}</h2>
                    <p className="text-sm leading-7 text-white/80">
                      {schoolProfile.department}, {schoolProfile.college}, {schoolProfile.location}.
                    </p>
                    <p className="text-sm leading-7 text-white/80">{schoolProfile.mission}</p>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="rounded-[24px] bg-white/10 p-4 transition-all hover:bg-white/15">
                      <Building2 className="size-5 text-secondary" />
                      <p className="mt-3 text-sm font-semibold">Institution-first structure</p>
                      <p className="mt-2 text-sm leading-6 text-white/75">
                        Organized around real academic administration and operational reporting.
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-white/10 p-4 transition-all hover:bg-white/15">
                      <ShieldCheck className="size-5 text-secondary" />
                      <p className="mt-3 text-sm font-semibold">Security-oriented workflow</p>
                      <p className="mt-2 text-sm leading-6 text-white/75">
                        Tokenized sessions with server-side validation and anti-fraud measures.
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-white/10 p-4 transition-all hover:bg-white/15">
                      <Smartphone className="size-5 text-secondary" />
                      <p className="mt-3 text-sm font-semibold">Mobile browser access</p>
                      <p className="mt-2 text-sm leading-6 text-white/75">
                        No app installation required - works on any mobile browser.
                      </p>
                    </div>
                    <div className="rounded-[24px] bg-white/10 p-4 transition-all hover:bg-white/15">
                      <BookOpenCheck className="size-5 text-secondary" />
                      <p className="mt-3 text-sm font-semibold">Academic record support</p>
                      <p className="mt-2 text-sm leading-6 text-white/75">
                        CSV exports and comprehensive reporting for institutional use.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Features Section */}
          <section id="features" className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="rounded-[32px] border border-primary/10 bg-white/88 p-8 shadow-lg shadow-primary/5 backdrop-blur-sm">
              <div className="space-y-4">
                <Badge variant="success" className="mb-2">
                  <BarChart3 className="mr-1 h-3 w-3" />
                  Why This Matters
                </Badge>
                <h2 className="font-heading text-3xl text-primary">Institutional Strategy</h2>
                <p className="text-sm leading-7 text-muted-foreground">
                  Built with a three-tier full-stack Next.js architecture ensuring clear separation of concerns while maintaining deployment simplicity. Designed for real institutional adoption with enterprise-grade features.
                </p>
              </div>
              <div className="mt-6 space-y-3">
                {institutionHighlights.map((highlight, index) => (
                  <div key={highlight} className="group rounded-[20px] bg-slate-50 px-4 py-3 text-sm text-slate-700 transition-all hover:bg-slate-100 hover:shadow-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-600 flex-shrink-0" />
                      <span>{highlight}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              {featureBlocks.map((feature, index) => (
                <div
                  key={feature.title}
                  className="group rounded-[32px] border border-primary/10 bg-white/88 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-primary/15 hover:scale-105"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Badge variant="outline" className="mb-3 text-xs">
                    Feature {index + 1}
                  </Badge>
                  <h3 className="font-heading text-2xl text-primary group-hover:text-accent transition-colors">{feature.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Workflow Section */}
          <section id="workflow" className="space-y-8">
            <div className="text-center space-y-4">
              <Badge variant="secondary" className="mb-2">
                <Clock className="mr-1 h-3 w-3" />
                Operational Workflow
              </Badge>
              <h2 className="font-heading text-4xl text-primary">How the System Works</h2>
              <p className="max-w-3xl mx-auto text-lg leading-8 text-muted-foreground">
                From institutional setup to live attendance capture and comprehensive reporting - designed for real-world deployment.
              </p>
            </div>
            <div className="grid gap-6 lg:grid-cols-4">
              {workflowSteps.map((item, index) => (
                <div
                  key={item.step}
                  className="group relative rounded-[30px] border border-primary/10 bg-white/88 p-6 shadow-lg shadow-primary/5 backdrop-blur-sm transition-all hover:shadow-xl hover:shadow-primary/15 hover:scale-105"
                  style={{ animationDelay: `${index * 150}ms` }}
                >
                  <div className="absolute -top-3 -right-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-bold text-white shadow-lg">
                    {index + 1}
                  </div>
                  <Badge variant="outline" className="mb-3 text-xs font-mono">
                    {item.step}
                  </Badge>
                  <h3 className="font-heading text-xl text-primary group-hover:text-accent transition-colors">{item.title}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">{item.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Project Team Section */}
          <section id="project-team" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="font-heading text-3xl font-semibold text-primary">
                Development Team
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Computer Science students who built this system
              </p>
            </div>
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5">
              {projectTeam.map((member, index) => (
                <div 
                  key={member.name} 
                  className="group text-center space-y-4 p-6 rounded-2xl border border-border/50 bg-card/50 hover:bg-card transition-all duration-200 hover:border-primary/20"
                >
                  {/* Avatar */}
                  <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold text-lg">
                    {member.name.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </div>
                  
                  {/* Name */}
                  <div>
                    <h3 className="font-medium text-foreground text-sm leading-tight">
                      {member.name}
                    </h3>
                    <p className="text-xs text-muted-foreground mt-1 font-mono">
                      {member.matricNumber}
                    </p>
                  </div>
                  
                  {/* Role */}
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {member.role}
                  </p>
                </div>
              ))}
            </div>
          </section>

          {/* Academic Supervisor Section */}
          <section id="supervisor" className="space-y-8">
            <div className="text-center space-y-4">
              <h2 className="font-heading text-3xl font-semibold text-primary">
                Project Supervisor
              </h2>
              <p className="max-w-2xl mx-auto text-muted-foreground">
                Academic guidance and oversight
              </p>
            </div>
            
            <div className="max-w-4xl mx-auto">
              <div className="grid gap-8 lg:grid-cols-[300px_1fr] items-start">
                {/* Supervisor Photo */}
                <div className="mx-auto lg:mx-0">
                  <div className="relative w-64 h-80 lg:w-full lg:h-96 rounded-2xl overflow-hidden border border-border/50 bg-gradient-to-br from-primary via-primary/95 to-accent">
                    <Image 
                      src={supervisor.image} 
                      alt={supervisor.name} 
                      fill 
                      className="object-cover" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  </div>
                </div>
                
                {/* Supervisor Information */}
                <div className="space-y-6 text-center lg:text-left">
                  <div>
                    <h3 className="font-heading text-2xl font-semibold text-primary mb-2">
                      {supervisor.name}
                    </h3>
                    <p className="text-muted-foreground mb-1">{supervisor.title}</p>
                    <p className="text-sm text-muted-foreground">{supervisor.department}</p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-muted/30 border border-border/50">
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {supervisor.note}
                    </p>
                  </div>
                  
                  <div className="p-4 rounded-xl bg-primary/5 border border-primary/10">
                    <p className="text-sm leading-relaxed text-foreground">
                      The system emphasizes security, operational clarity, and mobile accessibility 
                      for credible institutional deployment.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Call to Action */}
          <section className="text-center space-y-8 py-16">
            <div className="space-y-4">
              <Badge variant="secondary" className="mb-4">
                <ArrowRight className="mr-1 h-3 w-3" />
                Ready for Deployment
              </Badge>
              <h2 className="font-heading text-4xl text-primary">Experience TASUED AttendX</h2>
              <p className="max-w-2xl mx-auto text-lg leading-8 text-muted-foreground">
                Access the fully functional attendance management system designed specifically for institutional use.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-4">
              <Link href="/login" className={primaryLinkClassLarge}>
                Access System
                <ArrowRight className="size-4" />
              </Link>
              <Link href="#features" className={outlineLinkClass}>
                Learn More
              </Link>
            </div>
          </section>
        </main>

        {/* Footer */}
        <footer className="border-t border-white/20 bg-white/50 backdrop-blur-sm">
          <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
              <BrandMark compact />
              <div className="flex items-center gap-6 text-sm text-muted-foreground">
                <span>© 2026 TASUED AttendX</span>
                <span>•</span>
                <span>Final Year Project</span>
                <span>•</span>
                <span>Computer Science Department</span>
              </div>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
}
