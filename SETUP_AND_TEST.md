# Setup and Testing Guide

## Prerequisites

1. **Node.js** (v18 or higher)
2. **PostgreSQL** database (Neon or local)
3. **Modern browser** (Chrome, Edge, Safari, or Firefox)
4. **HTTPS or localhost** (required for camera access)

## Initial Setup

### 1. Install Dependencies

```bash
cd web
npm install
```

### 2. Configure Environment Variables

Ensure your `.env` file has:

```env
DATABASE_URL="your-postgresql-connection-string"
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"  # or your production URL
```

### 3. Setup Database

```bash
# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Seed the database with test data
npm run db:seed
```

### 4. Test QR Encoding

```bash
# Run the encoding test
node test-qr-encoding.js
```

Expected output:
```
✓ SUCCESS: Server and client encodings are identical!
```

### 5. Start Development Server

```bash
npm run dev
```

The app should be running at `http://localhost:3000`

## Test Accounts

After seeding, you should have these test accounts:

### Admin Account
- Email: `admin@university.edu`
- Password: `admin123`
- Role: ADMIN

### Lecturer Accounts
- Email: `lecturer1@university.edu`
- Password: `lecturer123`
- Role: LECTURER

### Student Accounts
- Email: `student1@university.edu`
- Password: `student123`
- Role: STUDENT

(Check `prisma/seed.ts` for all test accounts)

## Testing Workflow

### Test 1: Lecturer Creates Session

1. **Login as Lecturer**
   ```
   URL: http://localhost:3000/login
   Email: lecturer1@university.edu
   Password: lecturer123
   ```

2. **Navigate to Sessions**
   ```
   URL: http://localhost:3000/lecturer/sessions
   ```

3. **Create a Session**
   - Select a course from dropdown
   - Set duration: 10 minutes
   - Add venue: "Lecture Hall A"
   - Click "Create Session & Generate QR"

4. **Verify Success**
   - ✓ QR code appears
   - ✓ Session info displays (course, venue, time)
   - ✓ Timer counts down
   - ✓ "Active Session" badge shows
   - ✓ Live attendance section appears

5. **Check Browser Console**
   Should see logs like:
   ```
   [Session Create] Request from user: lecturer1@university.edu
   [Session Create] Lecturer found: xxx
   [Session Create] Course found: CSC101
   [Session Create] Token generated, length: 64
   [Session Create] Session created in DB: xxx
   [Session Create] Payload encoded, length: xxx
   [QR Generator] Generated QR payload: {...}
   [QR Generator] Encoded QR value length: xxx
   ```

### Test 2: Student Scans QR Code

#### Option A: Same Device Testing

1. **Take Screenshot of QR Code**
   - Screenshot the QR code from lecturer's screen
   - Save it to your device

2. **Login as Student** (in new incognito window)
   ```
   URL: http://localhost:3000/login
   Email: student1@university.edu
   Password: student123
   ```

3. **Navigate to Scan Page**
   ```
   URL: http://localhost:3000/student/scan
   ```

4. **Scan QR Code**
   - Click "Start Camera"
   - Allow camera permissions
   - Point camera at the screenshot/printed QR code
   - Wait for automatic detection

#### Option B: Two Device Testing

1. **Device 1 (Lecturer)**
   - Display QR code on screen

2. **Device 2 (Student)**
   - Login as student
   - Go to scan page
   - Point camera at Device 1's screen

5. **Verify Success**
   - ✓ "Attendance Recorded" message appears
   - ✓ Course details display
   - ✓ Timestamp shows
   - ✓ Success icon appears

6. **Check Browser Console**
   Should see logs like:
   ```
   [Scan] Request received from user: student1@university.edu
   [Scan] Student found: MAT/2024/001
   [Scan] Attempting to decode payload...
   [Scan] Payload decoded successfully: {...}
   [Scan] Session found: {...}
   [Scan] Token validated successfully
   [Scan] Attendance recorded successfully: {...}
   ```

### Test 3: Verify Attendance Recorded

1. **Check Lecturer Dashboard**
   - Go back to lecturer's session page
   - Live attendance should show the student
   - Count should increment

2. **Check Student History**
   ```
   URL: http://localhost:3000/student/history
   ```
   - Recent attendance should appear

3. **Check Database**
   ```sql
   SELECT * FROM "AttendanceRecord" 
   ORDER BY "markedAt" DESC 
   LIMIT 5;
   ```

### Test 4: Edge Cases

#### Test 4.1: Duplicate Attendance
1. Try scanning the same QR code again
2. Should show: "Attendance already recorded for this session"

#### Test 4.2: Expired Session
1. Wait for session to expire (or manually update DB)
2. Try scanning
3. Should show: "Session expired"

#### Test 4.3: Unenrolled Student
1. Login as a student not enrolled in the course
2. Try scanning
3. Should show: "You are not enrolled in this course"

#### Test 4.4: Multiple Active Sessions
1. Try creating another session for the same course
2. Should show: "An active session already exists"

## Debugging Tips

### Issue: QR Code Not Generating

**Check:**
1. Browser console for errors
2. Network tab for failed API calls
3. Database connection
4. Lecturer is assigned to the course

**Debug:**
```javascript
// In browser console
fetch('/api/sessions', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    courseId: 'your-course-id',
    ttlMinutes: 10,
    venue: 'Test Hall'
  })
}).then(r => r.json()).then(console.log)
```

### Issue: Camera Not Working

**Check:**
1. Browser permissions (click lock icon in address bar)
2. Using HTTPS or localhost
3. Camera not in use by another app
4. Browser supports camera API

**Debug:**
```javascript
// In browser console
navigator.mediaDevices.getUserMedia({ video: true })
  .then(stream => {
    console.log('Camera works!', stream);
    stream.getTracks().forEach(track => track.stop());
  })
  .catch(err => console.error('Camera error:', err));
```

### Issue: QR Scan Fails

**Check:**
1. Good lighting conditions
2. QR code is clear and not blurry
3. Camera is focused
4. QR code is within frame

**Debug:**
```javascript
// Test decode manually
const testPayload = "your-encoded-qr-string";
let base64 = testPayload.replace(/-/g, "+").replace(/_/g, "/");
while (base64.length % 4) base64 += "=";
const decoded = JSON.parse(atob(base64));
console.log('Decoded:', decoded);
```

### Issue: Token Validation Fails

**Check:**
1. Session exists in database
2. Token matches in database
3. Session is ACTIVE
4. Session not expired

**Debug:**
```sql
-- Check session details
SELECT 
  id,
  "sessionToken",
  status,
  "expiryTime",
  "startTime"
FROM "Session"
WHERE id = 'your-session-id';
```

## Performance Testing

### Load Testing Session Creation

```bash
# Install artillery (if not installed)
npm install -g artillery

# Create test file: artillery-test.yml
# Then run:
artillery run artillery-test.yml
```

### Monitor Database Performance

```sql
-- Check slow queries
SELECT * FROM pg_stat_statements 
ORDER BY total_exec_time DESC 
LIMIT 10;

-- Check active sessions
SELECT COUNT(*) FROM "Session" WHERE status = 'ACTIVE';

-- Check attendance records
SELECT COUNT(*) FROM "AttendanceRecord" 
WHERE "markedAt" > NOW() - INTERVAL '1 day';
```

## Production Deployment Checklist

- [ ] Environment variables set correctly
- [ ] Database migrations run
- [ ] HTTPS enabled
- [ ] NEXTAUTH_SECRET is strong and unique
- [ ] Database connection pooling configured
- [ ] Error logging enabled
- [ ] Session expiry cron job running
- [ ] Backup strategy in place
- [ ] Camera permissions documented for users
- [ ] Browser compatibility tested
- [ ] Mobile responsiveness verified
- [ ] QR code size optimized for scanning
- [ ] Rate limiting configured
- [ ] CORS configured correctly

## Monitoring

### Key Metrics to Track

1. **Session Creation Rate**
   - How many sessions created per day
   - Peak usage times

2. **Attendance Scan Success Rate**
   - Successful scans vs failed scans
   - Common error types

3. **Average Scan Time**
   - Time from camera start to attendance recorded

4. **Session Expiry**
   - How many sessions expire without attendance
   - Optimal session duration

5. **Database Performance**
   - Query response times
   - Connection pool usage

### Logging

Check logs for:
- `[Session Create]` - Session creation events
- `[Scan]` - QR scan events
- `[QR Generator]` - QR generation events
- Error messages and stack traces

## Support

If you encounter issues:

1. Check `TROUBLESHOOTING.md` for common solutions
2. Review browser console logs
3. Check server logs
4. Verify database state
5. Test with different browsers/devices
6. Review network requests in DevTools

## Next Steps

After successful testing:

1. **Customize** the UI to match your institution's branding
2. **Add features** like:
   - Email notifications
   - Attendance reports
   - Analytics dashboard
   - Bulk operations
3. **Optimize** performance based on usage patterns
4. **Document** for end users
5. **Train** lecturers and students
