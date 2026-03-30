# TASUED SmartAttend Full-Stack Architecture

## Architecture Summary

TASUED SmartAttend uses a three-tier architecture implemented in Next.js App Router:

- **Presentation layer**: Next.js pages/layouts with reusable React components.
- **Application layer**: API routes for auth, session, attendance, and reports.
- **Data layer**: PostgreSQL accessed with Prisma ORM.

## Data Model (Core Entities)

- `User`: base account (`email`, `passwordHash`, `role`).
- `Student`: student profile linked to `User`.
- `Lecturer`: lecturer profile linked to `User`.
- `Course`: course metadata and lecturer assignment.
- `Enrolment`: join table between students and courses.
- `Session`: per-class attendance session with secure token and TTL.
- `AttendanceRecord`: attendance entries with unique `(sessionId, studentId)`.

## Critical API Contracts

- `POST /api/sessions`: create attendance session and token.
- `POST /api/attendance/scan`: validate scanned payload and record attendance.
- `GET /api/reports/course/:courseId`: return attendance analytics.
- `GET /api/reports/course/:courseId/csv`: export CSV records.

## Security Rules

- NextAuth session-based authentication.
- Role-based route and API guards (`ADMIN`, `LECTURER`, `STUDENT`).
- Time-bound QR token verification on server.
- Duplicate prevention in API and DB unique constraint.

## Deployment Targets

- Next.js app hosted on Vercel or comparable Node hosting.
- PostgreSQL on Railway/Neon/Supabase.
- Environment-specific secrets managed via `.env`.

