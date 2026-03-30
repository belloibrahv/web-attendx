export const appName = "TASUED AttendX";

export const schoolProfile = {
  name: "Tai Solarin University of Education",
  abbreviation: "TASUED",
  summary:
    "TASUED AttendX is a mobile-responsive QR attendance platform designed for Tai Solarin University of Education to support secure classroom attendance capture, lecturer-controlled session activation, and institution-ready reporting.",
  mission:
    "The platform reflects TASUED's commitment to quality education, accountability, and technology-enabled academic administration across smartphones, tablets, and desktop devices.",
  department: "Department of Computer and Information Science",
  college: "College of Science and Information Technology",
  location: "Ijebu-Ode, Ogun State, Nigeria",
};

export const homepageStats = [
  { label: "User Roles", value: "3", detail: "Dedicated dashboards for admin, lecturer, and student operations." },
  { label: "Core Modules", value: "5", detail: "Authentication, courses, sessions, scanning, and reporting." },
  { label: "Responsive Targets", value: "6", detail: "Layouts tuned for mobile, tablet, laptop, and projector use." },
  { label: "Attendance Mode", value: "QR", detail: "Cryptographically generated, time-bound session payloads." },
];

export const institutionHighlights = [
  "Built as a real institutional workflow rather than a research simulation.",
  "Supports browser-based QR scanning without requiring native mobile app installation.",
  "Uses role-based access control and database-backed audit-ready attendance records.",
  "Designed to align with the Chapter Four implementation and evaluation strategy.",
];

export const featureBlocks = [
  {
    title: "Institutional Governance",
    description:
      "Administrators can manage students, lecturers, course offerings, enrolment records, and reporting from a central academic operations workspace.",
  },
  {
    title: "Time-Bound QR Sessions",
    description:
      "Lecturers generate attendance sessions with configurable validity windows and server-side token verification to reduce proxy attendance and replay attempts.",
  },
  {
    title: "Mobile-First Access",
    description:
      "Students can scan classroom QR codes directly from their phone browsers, making the system practical for campus-wide use with minimal onboarding friction.",
  },
  {
    title: "Reporting And Export",
    description:
      "Attendance summaries, course-level analytics, recent submissions, and CSV exports support lecturer review and departmental administrative reporting.",
  },
];

export const workflowSteps = [
  {
    step: "01",
    title: "Academic Setup",
    description:
      "The administrator registers lecturers, students, and course records, then assigns or imports student enrolments into the correct classes.",
  },
  {
    step: "02",
    title: "Session Activation",
    description:
      "The lecturer opens a live attendance window, sets the classroom venue and validity period, and projects the generated QR code.",
  },
  {
    step: "03",
    title: "Secure Student Scan",
    description:
      "Students scan with the device camera, and the server validates session ownership, enrolment, expiry, token integrity, and duplicate-submission rules.",
  },
  {
    step: "04",
    title: "Analytics And Export",
    description:
      "Real-time attendance records feed lecturer and administrator dashboards for review, performance insight, and CSV-based submission workflows.",
  },
];

export const projectTeam = [
  {
    name: "Erinfolami Mukaram Adeolu",
    matricNumber: "20220294015",
    role: "Research & Product Coordination",
    avatar: "/avatars/erinfolami.svg",
  },
  {
    name: "Amabo Ogheneruona David",
    matricNumber: "20220294003",
    role: "Backend & Data Architecture",
    avatar: "/avatars/amabo.svg",
  },
  {
    name: "Aina Imaadudeen Abiodun",
    matricNumber: "20220204001",
    role: "Systems Analysis & Documentation",
    avatar: "/avatars/aina.svg",
  },
  {
    name: "Abdulmalik Ibrahim Opeyemi",
    matricNumber: "20220294002",
    role: "Frontend Development & UX",
    avatar: "/avatars/abdulmalik.svg",
  },
  {
    name: "Bello Kudirat Adunni",
    matricNumber: "20220294005",
    role: "Quality Assurance & Testing",
    avatar: "/avatars/collaborator.svg",
  },
];

export const supervisor = {
  name: "Prof. A. A. Owoade",
  title: "Project Supervisor",
  department: "Department of Computer and Information Science",
  note:
    "The supervising profile is featured on the public homepage to present the project within a formal academic and institutional context.",
  image: "/avatars/supervisor.png",
};
