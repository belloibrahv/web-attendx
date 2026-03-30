"use client";

import type { ComponentType } from "react";
import { useEffect, useState } from "react";
import {
  BarChart3,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Cog,
  Pause,
  Play,
  QrCode,
  Target,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

type ResearchMetric = {
  label: string;
  value: string;
};

type ResearchTab = {
  id: string;
  title: string;
  chapter: string;
  source: string;
  icon: ComponentType<{ className?: string }>;
  headline: string;
  summary: string;
  notes: string[];
  explorationNote: string;
  metrics: ResearchMetric[];
};

const researchTabs: ResearchTab[] = [
  {
    id: "study-focus",
    title: "Study Focus",
    chapter: "Chapter 1",
    source: "Sections 1.3 to 1.5",
    icon: BookOpen,
    headline: "Aim, scope, and academic context of the study",
    summary:
      "The study aims to develop a mobile-based attendance management system that uses QR codes to record student attendance securely and efficiently within a Nigerian university context.",
    notes: [
      "The proposed system is positioned as a secure, cost-effective, and user-friendly alternative to manual and hardware-intensive attendance methods.",
      "The scope covers undergraduate courses and focuses on attendance recording together with basic reporting capabilities.",
      "The study explicitly excludes broader academic functions such as grading and learning analytics.",
      "Three principal user roles are identified in the methodology: student, lecturer, and administrator.",
    ],
    explorationNote:
      "This gives users a quick briefing on what the project solves and the operational boundary the paper sets for the system.",
    metrics: [
      { label: "Primary Institution", value: "TASUED" },
      { label: "Main Actors", value: "3 Roles" },
      { label: "System Scope", value: "Attendance + Reports" },
    ],
  },
  {
    id: "objectives",
    title: "Objectives",
    chapter: "Chapter 1",
    source: "Section 1.3.2",
    icon: Target,
    headline: "Five research objectives guide the implementation",
    summary:
      "The paper frames the project around investigation, adoption analysis, prototype development, security controls, and user evaluation.",
    notes: [
      "Investigate the limitations of manual, card-based, biometric, and Wi-Fi attendance systems in terms of efficiency, security, and cost.",
      "Analyse mobile technology adoption in educational contexts and identify the main success factors and challenges.",
      "Design and implement a prototype that generates unique lecture QR codes, supports scanning, and stores attendance in a secure database.",
      "Integrate authentication and data integrity mechanisms that reduce proxy attendance and align with QR security best practice.",
      "Evaluate the finished system through user testing focused on usability, accuracy, and user satisfaction.",
    ],
    explorationNote:
      "These objectives are useful as a presentation guide because they explain why the interface is organized around roles, sessions, scanning, and reports.",
    metrics: [
      { label: "Research Objectives", value: "5" },
      { label: "Security Target", value: "Proxy Prevention" },
      { label: "Evaluation Focus", value: "Usability + Accuracy" },
    ],
  },
  {
    id: "design",
    title: "Design Logic",
    chapter: "Chapter 3",
    source: "Sections 3.1 to 3.4",
    icon: Cog,
    headline: "The system is grounded in Design Science and a three-tier architecture",
    summary:
      "Chapter Three adopts Design Science Research for artifact creation, then translates that into an Agile incremental build model and a presentation, application, and data layer architecture.",
    notes: [
      "The Design Science process in the paper moves from problem identification to objective definition, design and development, and evaluation.",
      "The development methodology is Agile incremental, with planning, requirement specification, system design, module development, testing, and integration.",
      "The architecture is organized into three layers: presentation for user interaction, application for business logic and QR validation, and data for secure persistence.",
      "Functional requirements include session creation, QR generation, scanning, validation, storage, duplicate prevention, reporting, history, and data export.",
    ],
    explorationNote:
      "This tab helps readers connect the homepage design to the paper's engineering method rather than seeing the interface as a standalone visual exercise.",
    metrics: [
      { label: "Architecture", value: "3 Tiers" },
      { label: "Development Model", value: "Agile Incremental" },
      { label: "Core Functions", value: "QR + Validation + Reports" },
    ],
  },
  {
    id: "qr-logic",
    title: "QR Workflow",
    chapter: "Chapters 3 & 4",
    source: "Sections 3.5, 4.1.3.3, 4.1.3.4, 4.1.6",
    icon: QrCode,
    headline: "Attendance is secured with time-bound QR sessions and server validation",
    summary:
      "The paper describes QR generation and verification as the core system workflow, combining session identifiers, secure tokens, expiry checks, and duplicate prevention.",
    notes: [
      "Each lecture session creates a unique session record with identifiers, lecturer and course linkage, start and expiry time, and a secure session token.",
      "The QR payload carries session data for validation, while the session validity window is intentionally limited to between five and fifteen minutes.",
      "When a student scans, the server verifies session existence, expiry, token integrity, and whether that student has already marked attendance.",
      "The database reinforces integrity with a unique constraint on session and student so that one student cannot produce multiple records for the same session.",
    ],
    explorationNote:
      "This is the strongest implementation tab for presentations because it shows that the system is not a simulation: the paper defines a real verification chain and a database-backed control against duplicate attendance.",
    metrics: [
      { label: "Session Window", value: "5 to 15 mins" },
      { label: "Token Strength", value: "256-bit" },
      { label: "Duplicate Rule", value: "1 Scan per Session" },
    ],
  },
  {
    id: "evaluation",
    title: "Results",
    chapter: "Chapter 4",
    source: "Sections 4.2.3 to 4.4",
    icon: BarChart3,
    headline: "Testing and pilot evaluation show measurable operational gains",
    summary:
      "Chapter Four reports positive pilot results across performance, usability, institutional readiness, and comparative efficiency against the traditional manual process.",
    notes: [
      "User Acceptance Testing involved 45 undergraduate students and 6 lecturers, producing an overall composite mean score of 4.43 out of 5.00.",
      "The highest UAT construct was Behavioural Intention to Use at 4.65, indicating strong readiness for institutional adoption.",
      "Testing results reported 94.3% unit test coverage, a 100% integration pass rate across 12 scenarios, 1.4-second scan-to-confirmation time, and stress testing up to 350 users.",
      "Comparative analysis showed attendance time falling from 8.4 minutes to 1.2 minutes, an 85.7% reduction, with zero confirmed proxy attendance incidents during the pilot.",
    ],
    explorationNote:
      "For visitors exploring the project, this tab works like presentation evidence: it turns the paper's evaluation chapter into short, defensible talking points.",
    metrics: [
      { label: "Pilot Group", value: "51 Users" },
      { label: "Composite UAT", value: "4.43 / 5.00" },
      { label: "Attendance Gain", value: "85.7% Faster" },
    ],
  },
];

export function ResearchPresentation() {
  const [activeTab, setActiveTab] = useState(0);
  const [isAutoPlay, setIsAutoPlay] = useState(true);
  const currentTab = researchTabs[activeTab];

  useEffect(() => {
    if (!isAutoPlay) return;

    const timer = window.setInterval(() => {
      setActiveTab((previous) => (previous + 1) % researchTabs.length);
    }, 7000);

    return () => window.clearInterval(timer);
  }, [isAutoPlay]);

  const nextTab = () => {
    setActiveTab((previous) => (previous + 1) % researchTabs.length);
    setIsAutoPlay(false);
  };

  const previousTab = () => {
    setActiveTab((previous) => (previous - 1 + researchTabs.length) % researchTabs.length);
    setIsAutoPlay(false);
  };

  const selectTab = (index: number) => {
    setActiveTab(index);
    setIsAutoPlay(false);
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-[2rem] bg-gradient-to-br from-white/70 via-white/35 to-secondary/15 shadow-[0_30px_80px_-35px_rgba(0,35,95,0.45)]" />

      <Card className="relative overflow-hidden rounded-[2rem] border-white/50 bg-white/80 shadow-2xl backdrop-blur-xl">
        <CardContent className="p-0">
          <div className="border-b border-primary/10 bg-gradient-to-r from-primary/8 via-white to-secondary/12 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-gradient-to-br from-primary to-accent text-white shadow-lg shadow-primary/15">
                      <BookOpen className="h-5 w-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-slate-900">Research Explorer</h3>
                      <p className="text-sm text-slate-600">
                        Banner notes drawn from the approved project paper
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className="bg-primary text-white hover:bg-primary">Paper-backed</Badge>
                    <Badge variant="outline" className="border-primary/15 bg-white/70 text-slate-700">
                      Tabs + presentation view
                    </Badge>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setIsAutoPlay((value) => !value)}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-white/80 text-slate-600 transition hover:border-primary/20 hover:text-primary"
                    title={isAutoPlay ? "Pause presentation" : "Resume presentation"}
                  >
                    {isAutoPlay ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </button>
                  <button
                    type="button"
                    onClick={previousTab}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-white/80 text-slate-600 transition hover:border-primary/20 hover:text-primary"
                    aria-label="Previous research tab"
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={nextTab}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-primary/10 bg-white/80 text-slate-600 transition hover:border-primary/20 hover:text-primary"
                    aria-label="Next research tab"
                  >
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="-mx-1 overflow-x-auto pb-1">
                <div className="flex min-w-max gap-2 px-1">
                  {researchTabs.map((tab, index) => (
                    <button
                      key={tab.id}
                      type="button"
                      onClick={() => selectTab(index)}
                      className={cn(
                        "group flex min-w-[132px] items-center gap-2 rounded-2xl border px-3 py-2 text-left transition",
                        activeTab === index
                          ? "border-primary/20 bg-white text-primary shadow-sm"
                          : "border-transparent bg-white/45 text-slate-600 hover:border-primary/10 hover:bg-white/75 hover:text-slate-900",
                      )}
                    >
                      <tab.icon
                        className={cn(
                          "h-4 w-4 shrink-0",
                          activeTab === index ? "text-primary" : "text-slate-500 group-hover:text-primary",
                        )}
                      />
                      <div>
                        <div className="text-sm font-semibold">{tab.title}</div>
                        <div className="text-[11px] text-slate-500">{tab.chapter}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6 px-5 py-6 sm:px-6">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="secondary" className="bg-secondary/85 text-primary">
                {currentTab.chapter}
              </Badge>
              <Badge variant="outline" className="border-primary/10 bg-white text-slate-600">
                {currentTab.source}
              </Badge>
              {isAutoPlay ? (
                <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                  Presentation mode on
                </Badge>
              ) : null}
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="mt-1 flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/8 text-primary">
                  <currentTab.icon className="h-5 w-5" />
                </div>
                <div className="space-y-2">
                  <h4 className="font-heading text-3xl leading-tight text-slate-950">
                    {currentTab.headline}
                  </h4>
                  <p className="text-sm leading-7 text-slate-600">{currentTab.summary}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {currentTab.metrics.map((metric) => (
                <div
                  key={metric.label}
                  className="rounded-2xl border border-primary/10 bg-gradient-to-br from-white to-primary/5 p-4"
                >
                  <div className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                    {metric.label}
                  </div>
                  <div className="mt-2 text-xl font-semibold text-slate-900">{metric.value}</div>
                </div>
              ))}
            </div>

            <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="rounded-[1.5rem] border border-primary/10 bg-white/85 p-5 shadow-sm">
                <div className="mb-4 flex items-center gap-2 text-sm font-semibold text-slate-900">
                  <CheckCircle2 className="h-4 w-4 text-primary" />
                  Presentation Notes
                </div>
                <div className="space-y-3">
                  {currentTab.notes.map((note) => (
                    <div key={note} className="flex items-start gap-3">
                      <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-accent" />
                      <p className="text-sm leading-7 text-slate-700">{note}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-4">
                <div className="rounded-[1.5rem] border border-primary/10 bg-gradient-to-br from-primary/95 to-[#0d377f] p-5 text-white">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-secondary/85">
                    Exploration Note
                  </div>
                  <p className="mt-3 text-sm leading-7 text-white/90">{currentTab.explorationNote}</p>
                </div>

                <div className="rounded-[1.5rem] border border-secondary/25 bg-secondary/12 p-5">
                  <div className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
                    Navigation Hint
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-700">
                    Use the scrollable tabs above to move between study focus, objectives, design logic,
                    QR workflow, and evaluation results exactly as summarized from the paper.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 pt-1">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-primary via-accent to-secondary transition-all duration-500"
                  style={{ width: `${((activeTab + 1) / researchTabs.length) * 100}%` }}
                />
              </div>
              <div className="text-xs font-medium text-slate-500">
                {activeTab + 1} of {researchTabs.length}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
