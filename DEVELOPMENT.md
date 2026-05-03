# Development Guide

## ✅ Development Server Running

Your development server is now running at:
- **Local**: http://localhost:3000
- **Network**: http://10.79.238.35:3000

## Quick Start

### Start Development Server
```bash
cd web
npm run dev
```

### Access the Application
- Open http://localhost:3000 in your browser
- Use test accounts from `prisma/seed.ts`

## Test Accounts

### Admin
- Email: `admin@university.edu`
- Password: `admin123`
- Dashboard: http://localhost:3000/admin

### Lecturer
- Email: `lecturer1@university.edu`
- Password: `lecturer123`
- Dashboard: http://localhost:3000/lecturer

### Student
- Email: `student1@university.edu`
- Password: `student123`
- Dashboard: http://localhost:3000/student

## Testing the Attendance Workflow

### 1. Test Lecturer Session Creation
1. Login as lecturer at http://localhost:3000/login
2. Navigate to Sessions: http://localhost:3000/lecturer/sessions
3. Create a new session:
   - Select a course
   - Set duration (5-15 minutes)
   - Add venue (optional)
   - Click "Create Session & Generate QR"
4. ✅ QR code should appear
5. ✅ Session info should display
6. ✅ Timer should count down

### 2. Test Session Persistence (NEW!)
1. While viewing active session, navigate to Reports
2. Return to Sessions page
3. ✅ **Session should auto-load**
4. ✅ **QR code should still be visible**
5. ✅ **Live attendance should continue updating**

### 3. Test View Session Button (NEW!)
1. Scroll to "Recent Sessions" section
2. Find an active session
3. Click "View Session" button
4. ✅ **Session should load with QR code**
5. ✅ **Attendance should display**

### 4. Test Student QR Scanning

#### Option A: Same Device (Screenshot Method)
1. Take screenshot of QR code from lecturer's screen
2. Open new incognito window
3. Login as student
4. Go to http://localhost:3000/student/scan
5. Click "Start Camera"
6. Point camera at screenshot
7. ✅ Attendance should be recorded

#### Option B: Two Devices
1. **Device 1 (Lecturer)**: Display QR code
2. **Device 2 (Student)**: 
   - Login as student
   - Go to scan page
   - Point camera at Device 1's screen
   - ✅ Attendance should be recorded

### 5. Verify Attendance Recorded
1. Check lecturer's live attendance list
2. Student should appear in the list
3. Check student's history: http://localhost:3000/student/history
4. Recent attendance should show

## Browser Console Logs

Open browser console (F12) to see detailed logs:

### Session Creation Logs
```
[Session Create] Request from user: lecturer1@university.edu
[Session Create] Lecturer found: xxx
[Session Create] Course found: CSC101
[Session Create] Token generated, length: 64
[Session Create] Session created in DB: xxx
[Session Create] Payload encoded, length: xxx
[QR Generator] Generated QR payload: {...}
```

### QR Scanning Logs
```
[Scan] Request received from user: student1@university.edu
[Scan] Student found: MAT/2024/001
[Scan] Attempting to decode payload...
[Scan] Payload decoded successfully: {...}
[Scan] Session found: {...}
[Scan] Token validated successfully
[Scan] Attendance recorded successfully: {...}
```

## Common Development Issues

### Issue: Port 3000 Already in Use
```bash
# Kill process on port 3000
lsof -ti:3000 | xargs kill -9

# Or use different port
PORT=3001 npm run dev
```

### Issue: Database Connection Error
```bash
# Check DATABASE_URL in .env
cat .env | grep DATABASE_URL

# Test connection
npx prisma db push
```

### Issue: Prisma Client Not Generated
```bash
# Generate Prisma client
npm run prisma:generate

# Or
npx prisma generate
```

### Issue: Camera Not Working
- Ensure you're using HTTPS or localhost
- Check browser permissions (click lock icon in address bar)
- Try different browser (Chrome/Edge recommended)
- Close other apps using camera

### Issue: QR Code Not Scanning
- Ensure good lighting
- Hold device steady
- Center QR code in frame
- Try different camera (front/back)
- Check console for errors

## Development Commands

### Database
```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Open Prisma Studio
npm run prisma:studio

# Seed database
npm run db:seed
```

### Development
```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Run linter
npm run lint
```

### Testing
```bash
# Test QR encoding
node test-qr-encoding.js

# Expected output:
# ✓ SUCCESS: Server and client encodings are identical!
```

## Project Structure

```
web/
├── src/
│   ├── app/                    # Next.js app directory
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   ├── admin/             # Admin dashboard
│   │   ├── lecturer/          # Lecturer dashboard
│   │   ├── student/           # Student dashboard
│   │   ├── api/               # API routes
│   │   └── home/              # Public homepage
│   ├── components/            # React components
│   │   ├── layout/           # Layout components
│   │   ├── ui/               # UI components
│   │   └── ...               # Feature components
│   ├── lib/                   # Utility functions
│   │   ├── auth.ts           # Authentication
│   │   ├── db.ts             # Database client
│   │   ├── qr.ts             # QR code logic
│   │   └── ...
│   └── data/                  # Static data
├── prisma/                    # Database schema & migrations
├── public/                    # Static assets
└── docs/                      # Documentation
```

## Environment Variables

Required in `.env`:
```env
DATABASE_URL="postgresql://..."
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"
```

## Performance Tips

### Development
- Use Turbopack (enabled by default in Next.js 16)
- Keep browser console open for logs
- Use React DevTools for debugging
- Monitor Network tab for API calls

### Production
- Run `npm run build` to check for errors
- Test on different devices and browsers
- Verify HTTPS is enabled
- Check database connection pooling

## Debugging Tips

### Check Session State
```javascript
// In browser console
localStorage.getItem('session')
```

### Test QR Encoding
```javascript
// In browser console
const payload = {
  sessionId: "test-123",
  courseId: "course-456",
  token: "test-token",
  expires: new Date().toISOString()
};

const encoded = btoa(JSON.stringify(payload))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, "");

console.log("Encoded:", encoded);
```

### Check API Response
```javascript
// In browser console
fetch('/api/sessions')
  .then(r => r.json())
  .then(console.log)
```

## Documentation

- **TROUBLESHOOTING.md**: Common issues and solutions
- **SETUP_AND_TEST.md**: Setup and testing guide
- **FIXES_APPLIED.md**: Recent bug fixes
- **UX_IMPROVEMENTS.md**: UX enhancement details
- **RENDER_DEPLOYMENT.md**: Production deployment guide

## Getting Help

1. Check browser console for errors
2. Review server logs in terminal
3. Check documentation files
4. Verify database state with Prisma Studio
5. Test with different browsers/devices

## Next Steps

1. ✅ Development server is running
2. ✅ Test the attendance workflow
3. ✅ Verify session persistence works
4. ✅ Test QR code scanning
5. ✅ Check all user roles (admin, lecturer, student)
6. 🚀 Deploy to production when ready

## Production Deployment

See `RENDER_DEPLOYMENT.md` for production deployment instructions.

## Notes

- The slow filesystem warning is normal on some systems
- Turbopack root warning has been silenced
- All features are working correctly
- Development server auto-reloads on file changes

Happy coding! 🎉
