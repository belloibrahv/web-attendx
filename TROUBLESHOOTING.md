# Attendance System Troubleshooting Guide

## Issues Fixed

### 1. QR Code Encoding/Decoding Issues
**Problem**: The QR code encoding was using Node.js Buffer API which doesn't work in the browser.

**Solution**: Updated `web/src/lib/qr.ts` to use browser-compatible base64 encoding:
- Client-side: Uses `btoa()` and `atob()` 
- Server-side: Uses Node.js `Buffer`
- Proper base64url format conversion

### 2. Async Token Generation
**Problem**: Crypto functions were synchronous imports causing issues.

**Solution**: Made token generation and validation async to properly handle server-side crypto module.

### 3. Enhanced Logging
**Problem**: Hard to debug issues without proper logging.

**Solution**: Added comprehensive logging to both API routes:
- Session creation logs
- QR scanning logs
- Token validation logs
- Error tracking

## Testing the Workflow

### Step 1: Test Lecturer Session Creation

1. **Login as Lecturer**
   - Email: Use a lecturer account from your database
   - Password: Your lecturer password

2. **Navigate to Sessions Page**
   - Go to `/lecturer/sessions`

3. **Create a Session**
   - Select a course
   - Set duration (5-15 minutes)
   - Add venue (optional)
   - Click "Create Session & Generate QR"

4. **Check Browser Console**
   Look for logs like:
   ```
   [Session Create] Request from user: lecturer@example.com
   [Session Create] Lecturer found: xxx
   [Session Create] Course found: CSC101
   [Session Create] Token generated, length: 64
   [Session Create] Session created in DB: xxx
   [Session Create] Payload encoded, length: xxx
   ```

5. **Verify QR Code Display**
   - QR code should appear
   - Session info should show
   - Timer should count down

### Step 2: Test Student QR Scanning

1. **Login as Student**
   - Email: Use a student account
   - Password: Your student password

2. **Navigate to Scan Page**
   - Go to `/student/scan`

3. **Start Camera**
   - Click "Start Camera"
   - Allow camera permissions
   - Camera feed should appear

4. **Scan QR Code**
   - Point camera at lecturer's QR code
   - Or use a screenshot/printed QR code

5. **Check Browser Console**
   Look for logs like:
   ```
   [Scan] Request received from user: student@example.com
   [Scan] Student found: MAT/2024/001
   [Scan] Attempting to decode payload...
   [Scan] Payload decoded successfully
   [Scan] Session found: xxx
   [Scan] Token validated successfully
   [Scan] Attendance recorded successfully
   ```

## Common Issues and Solutions

### Issue 1: "Camera access denied"
**Symptoms**: Scanner shows permission error

**Solutions**:
1. Check browser permissions (click lock icon in address bar)
2. Ensure you're using HTTPS or localhost
3. Try a different browser (Chrome/Edge recommended)
4. Check if another app is using the camera

### Issue 2: "Invalid QR code format"
**Symptoms**: Scan fails with format error

**Solutions**:
1. Check browser console for decode errors
2. Verify QR code was generated correctly
3. Try generating a new session
4. Ensure good lighting when scanning

### Issue 3: "Session not found"
**Symptoms**: QR scans but session not found

**Solutions**:
1. Check if session expired
2. Verify database connection
3. Check session was created in database:
   ```sql
   SELECT * FROM "Session" ORDER BY "startTime" DESC LIMIT 5;
   ```

### Issue 4: "You are not enrolled in this course"
**Symptoms**: Student can't mark attendance

**Solutions**:
1. Verify student is enrolled in the course
2. Check enrolments table:
   ```sql
   SELECT * FROM "Enrolment" WHERE "studentId" = 'xxx';
   ```
3. Add enrolment if missing

### Issue 5: "Token validation failed"
**Symptoms**: QR scans but token doesn't match

**Solutions**:
1. Check console logs for token comparison
2. Verify session token in database matches payload
3. Try creating a new session

### Issue 6: Session creation fails
**Symptoms**: Error when creating session

**Solutions**:
1. Check lecturer is assigned to the course
2. Verify no active session exists for that course
3. Check database connection
4. Review server logs

## Database Verification

### Check Active Sessions
```sql
SELECT 
  s.id,
  s.status,
  s."expiryTime",
  c."courseCode",
  c."courseTitle",
  l."firstName" || ' ' || l."lastName" as lecturer
FROM "Session" s
JOIN "Course" c ON s."courseId" = c.id
JOIN "Lecturer" l ON s."lecturerId" = l.id
WHERE s.status = 'ACTIVE'
ORDER BY s."startTime" DESC;
```

### Check Recent Attendance
```sql
SELECT 
  a."markedAt",
  s."firstName" || ' ' || s."lastName" as student,
  s."matricNumber",
  c."courseCode",
  sess.status
FROM "AttendanceRecord" a
JOIN "Student" s ON a."studentId" = s.id
JOIN "Course" c ON a."courseId" = c.id
JOIN "Session" sess ON a."sessionId" = sess.id
ORDER BY a."markedAt" DESC
LIMIT 10;
```

### Check Student Enrolments
```sql
SELECT 
  s."matricNumber",
  s."firstName" || ' ' || s."lastName" as student,
  c."courseCode",
  c."courseTitle"
FROM "Enrolment" e
JOIN "Student" s ON e."studentId" = s.id
JOIN "Course" c ON e."courseId" = c.id
ORDER BY s."matricNumber";
```

## Browser Console Commands

### Test QR Encoding/Decoding
```javascript
// In browser console
const payload = {
  sessionId: "test-123",
  courseId: "course-456",
  token: "test-token-789",
  expires: new Date().toISOString()
};

const encoded = btoa(JSON.stringify(payload))
  .replace(/\+/g, "-")
  .replace(/\//g, "_")
  .replace(/=/g, "");

console.log("Encoded:", encoded);

// Decode it back
let base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
while (base64.length % 4) base64 += "=";
const decoded = JSON.parse(atob(base64));
console.log("Decoded:", decoded);
```

### Check Camera Support
```javascript
// In browser console
console.log("Camera support:", !!navigator.mediaDevices?.getUserMedia);
console.log("Secure context:", window.isSecureContext);
```

## Network Debugging

### Check API Requests
1. Open Browser DevTools (F12)
2. Go to Network tab
3. Filter by "Fetch/XHR"
4. Create session or scan QR
5. Check request/response:
   - Status code (should be 200)
   - Response body (should have `ok: true`)
   - Request payload

### Common HTTP Status Codes
- `200`: Success
- `400`: Bad request (invalid data)
- `401`: Unauthorized (not logged in)
- `403`: Forbidden (not enrolled/assigned)
- `404`: Not found (session/profile missing)
- `409`: Conflict (already recorded/active session exists)

## Performance Optimization

### If QR Scanning is Slow
1. Ensure good lighting
2. Hold device steady
3. Center QR code in frame
4. Try different camera (front/back)
5. Reduce camera resolution in scanner settings

### If Session Creation is Slow
1. Check database connection
2. Verify database indexes exist
3. Check server resources
4. Review database query performance

## Security Checklist

- [ ] HTTPS enabled in production
- [ ] NEXTAUTH_SECRET is set and secure
- [ ] Database credentials are secure
- [ ] Session tokens are cryptographically secure (64 chars)
- [ ] Token comparison uses constant-time algorithm
- [ ] Sessions expire properly (5-15 minutes)
- [ ] Students can only mark attendance once per session
- [ ] Students must be enrolled to mark attendance
- [ ] Lecturers can only create sessions for their courses

## Next Steps

1. **Test the complete workflow** with the fixes applied
2. **Monitor console logs** for any errors
3. **Check database** to verify data is being created
4. **Test edge cases**:
   - Expired sessions
   - Duplicate attendance
   - Unenrolled students
   - Multiple active sessions
5. **Optimize** based on real-world usage

## Getting Help

If issues persist:
1. Check all console logs (browser and server)
2. Verify database state
3. Test with different browsers
4. Check network requests in DevTools
5. Review the error messages carefully
