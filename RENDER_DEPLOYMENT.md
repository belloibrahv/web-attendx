# TASUED AttendX - Render Deployment Guide

## Prerequisites
- GitHub repository: https://github.com/belloibrahv/web-attendx.git
- Render account (free tier available)

## Deployment Steps

### 1. Database Setup
1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click "New +" → "PostgreSQL"
3. Configure:
   - **Name**: `tasued-attendx-db`
   - **Database**: `tasued_attendx`
   - **User**: `tasued_user`
   - **Region**: Choose closest to your users
   - **Plan**: Free (or paid for production)
4. Click "Create Database"
5. Copy the **External Database URL** (starts with `postgresql://`)

### 2. Web Service Setup
1. Click "New +" → "Web Service"
2. Connect your GitHub repository: `belloibrahv/web-attendx`
3. Configure:
   - **Name**: `tasued-attendx`
   - **Region**: Same as database
   - **Branch**: `main`
   - **Root Directory**: `web`
   - **Runtime**: `Node`
   - **Build Command**: `npm ci && npm run build`
   - **Start Command**: `npm start`
   - **Plan**: Free (or paid for production)

### 3. Environment Variables
Add these environment variables in the Render dashboard:

```
NODE_ENV=production
DATABASE_URL=[Your PostgreSQL External Database URL from step 1]
NEXTAUTH_SECRET=[Generate a secure random string - use: openssl rand -base64 32]
```

**Important:** Do NOT set `NEXTAUTH_URL` in production. NextAuth.js will automatically detect the correct URL.

### 4. Database Migration
After first deployment:
1. Go to your web service dashboard
2. Open the "Shell" tab
3. Run: `npx prisma migrate deploy`
4. Run: `npm run db:seed` (to populate with test data)

## Test Accounts
After seeding, you can login with:

**Admin:**
- Email: admin@tasued.edu.ng
- Password: admin123

**Lecturer (Supervisor):**
- Email: supervisor@tasued.edu.ng  
- Password: supervisor123

**Student:**
- Email: abdulmalik@student.tasued.edu.ng
- Password: student123

## Production Considerations
- Upgrade to paid plans for better performance
- Set up custom domain
- Configure SSL certificates
- Monitor application logs
- Set up backup strategies for database

## Troubleshooting

### Logout Redirects to Localhost
- Ensure `NEXTAUTH_URL` is NOT set in production environment variables
- NextAuth.js automatically detects the production URL
- If set incorrectly, remove the variable and redeploy

### QR Scanner Issues  
- Ensure the site is served over HTTPS (Render provides this automatically)
- Camera access requires a secure context
- Try the alternative scanner if the primary one fails

### Other Issues
- Check build logs in Render dashboard
- Verify all environment variables are set
- Ensure database is accessible
- Check application logs for runtime errors

## Support
For issues, check the GitHub repository or contact the development team.