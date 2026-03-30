# QR UX Specification

## Lecturer QR Session Flow

1. Lecturer opens `Sessions` page and clicks `Start session`.
2. Form fields: `course`, `venue`, `ttlMinutes` (5-15), optional `notes`.
3. On submit:
   - show loading state and disable submit.
   - create session via secure API.
   - show generated QR and countdown timer.
4. During active session:
   - live attendance count refreshes.
   - warning appears when less than 60 seconds remain.
5. On expiry:
   - QR panel state changes to expired.
   - action buttons become `Start new session` / `Close session`.

## Student Scan Flow

1. Student opens `Scan QR` page.
2. Permission states:
   - `granted`: scanner starts immediately.
   - `denied`: show fix instructions and retry button.
   - `prompt`: show educational guidance before request.
3. On successful scan:
   - decode payload.
   - call validation API.
   - show success card with course title and timestamp.
4. Error states:
   - invalid code.
   - expired session.
   - duplicate attendance.
   - network/server failure.
5. Accessibility:
   - readable status text (not color-only feedback).
   - large action targets for mobile.
   - clear retry and fallback navigation.

## Responsive Rules

- Mobile first: scanner and QR card occupy single-column layout.
- Tablet/desktop: split view for scanner/metadata or QR/live list.
- All key actions remain visible without horizontal scrolling.

