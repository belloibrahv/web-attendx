# Changelog

## [Latest] - 2026-05-03

### Fixed
- **Favicon**: Changed favicon from default Next.js icon to TASUED logo
  - Replaced `src/app/favicon.ico` with TASUED main logo
  - Added proper favicon metadata in root layout
  - Added Apple touch icon support
  
- **Logout Redirect**: Fixed logout redirect issue
  - Changed redirect from `/` to `/home` on logout
  - Added `signOut` page configuration in NextAuth
  - Users now properly redirected to homepage after logout
  - No more brief `localhost:3000` display

### Changed
- Updated favicon metadata in `src/app/layout.tsx`
- Updated logout callbacks in dashboard components
- Enhanced NextAuth configuration

### Files Modified
- `src/app/favicon.ico` - Replaced with TASUED logo
- `src/app/layout.tsx` - Added favicon metadata
- `src/lib/auth.ts` - Added signOut page configuration
- `src/components/layout/dashboard-shell.tsx` - Updated logout callback
- `src/components/layout/dashboard-layout.tsx` - Updated logout callback

---

## Previous Updates

### UX Improvements - Session Management
- Auto-load active sessions on page load
- Added "View Session" buttons to active sessions
- Added "Create New Session" button
- Enhanced API responses with complete session data
- Improved state management for sessions

### Bug Fixes - Attendance Workflow
- Fixed QR code encoding for browser compatibility
- Made token generation async
- Added comprehensive logging
- Enhanced error handling

### Data Corrections
- Fixed team member matric numbers
- Corrected all student registration numbers

### Development Setup
- Configured Turbopack root
- Added comprehensive development guide
- Created troubleshooting documentation

---

## Testing the Fixes

### Test Favicon Change
1. Open the application in browser
2. Check browser tab icon
3. ✅ Should show TASUED logo instead of Next.js icon
4. Check on mobile (add to home screen)
5. ✅ Should show TASUED logo

### Test Logout Redirect
1. Login as any user (admin/lecturer/student)
2. Navigate to any dashboard page
3. Click "Logout" button
4. ✅ Should redirect to homepage (/home)
5. ✅ Should NOT show `localhost:3000` briefly
6. ✅ URL should be `localhost:3000/home`

---

## Known Issues

None at this time.

---

## Upcoming Features

- Session notifications
- Multiple session view
- Session templates
- Bulk operations
- Real-time sync with WebSocket
- Session analytics
