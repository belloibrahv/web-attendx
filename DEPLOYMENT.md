# 🚀 TASUED AttendX - Vercel Deployment Guide

This guide will help you deploy the TASUED AttendX QR Attendance System to Vercel.

## 📋 Prerequisites

1. **GitHub Repository**: ✅ Already set up at `https://github.com/belloibrahv/web-attendx.git`
2. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
3. **Database**: PostgreSQL database (Neon, Supabase, or similar)

## 🔧 Environment Variables Setup

Before deploying, you'll need to configure these environment variables in Vercel:

### Required Environment Variables:

```bash
# Database Configuration
DATABASE_URL="postgresql://username:password@host:port/database?sslmode=require"

# NextAuth Configuration  
NEXTAUTH_SECRET="your-secure-random-secret-key-here"
NEXTAUTH_URL="https://your-app-name.vercel.app"
```

### 🔑 How to Generate NEXTAUTH_SECRET:

```bash
# Option 1: Using OpenSSL
openssl rand -base64 32

# Option 2: Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Option 3: Online generator
# Visit: https://generate-secret.vercel.app/32
```

## 🚀 Deployment Steps

### Step 1: Connect to Vercel

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click "New Project"
3. Import from GitHub: `belloibrahv/web-attendx`
4. Select the repository and click "Import"

### Step 2: Configure Project Settings

1. **Framework Preset**: Next.js (auto-detected)
2. **Root Directory**: `./` (leave as default)
3. **Build Command**: `npm run build` (auto-configured)
4. **Output Directory**: `.next` (auto-configured)
5. **Install Command**: `npm install` (auto-configured)

### Step 3: Set Environment Variables

In the Vercel dashboard:

1. Go to **Settings** → **Environment Variables**
2. Add each variable:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXTAUTH_SECRET`: Generated secret key
   - `NEXTAUTH_URL`: Your Vercel app URL (e.g., `https://tasued-attendx.vercel.app`)

### Step 4: Deploy

1. Click **"Deploy"**
2. Wait for the build to complete (usually 2-3 minutes)
3. Your app will be available at `https://your-app-name.vercel.app`

## 🗄️ Database Setup

### Option 1: Neon (Recommended)

1. Go to [neon.tech](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it as `DATABASE_URL` in Vercel

### Option 2: Supabase

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the connection string
5. Add it as `DATABASE_URL` in Vercel

### Database Migration

After deployment, you may need to run migrations:

1. In Vercel dashboard, go to **Functions** → **Edge Config**
2. Or use Vercel CLI:
   ```bash
   npx vercel env pull .env.local
   npm run prisma:migrate
   npm run db:seed
   ```

## 🔧 Custom Domain (Optional)

1. In Vercel dashboard, go to **Settings** → **Domains**
2. Add your custom domain
3. Update `NEXTAUTH_URL` to your custom domain
4. Redeploy the application

## 📊 Monitoring & Analytics

Vercel provides built-in:
- **Performance monitoring**
- **Error tracking**
- **Analytics dashboard**
- **Function logs**

Access these in your Vercel dashboard.

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**:
   - Check environment variables are set
   - Verify database connection string
   - Check build logs in Vercel dashboard

2. **Database Connection Error**:
   - Verify `DATABASE_URL` format
   - Ensure database allows external connections
   - Check SSL requirements

3. **Authentication Issues**:
   - Verify `NEXTAUTH_SECRET` is set
   - Check `NEXTAUTH_URL` matches your domain
   - Ensure no trailing slashes in URLs

4. **Prisma Issues**:
   - Ensure `postinstall` script runs `prisma generate`
   - Check database schema is up to date

### Getting Help:

- Check Vercel deployment logs
- Review function logs for API errors
- Use Vercel CLI for local debugging:
  ```bash
  npm i -g vercel
  vercel dev
  ```

## 🎯 Post-Deployment Checklist

- [ ] Application loads successfully
- [ ] Login functionality works
- [ ] Database connection established
- [ ] QR code generation works
- [ ] All user roles accessible
- [ ] Mobile responsiveness verified
- [ ] Performance metrics acceptable

## 🔄 Continuous Deployment

Vercel automatically deploys when you push to the `main` branch:

```bash
git add .
git commit -m "Update: description of changes"
git push origin main
```

## 📈 Performance Optimization

The application is already optimized with:
- ✅ Next.js 16 with App Router
- ✅ Automatic code splitting
- ✅ Image optimization
- ✅ Static generation where possible
- ✅ Edge functions for API routes

## 🎓 Academic Note

This deployment guide is part of the **TASUED AttendX** final year project documentation. The system is designed for institutional use and follows academic research standards.

---

**🎉 Congratulations!** Your TASUED AttendX system is now live and ready for institutional use.

For technical support, contact the development team through TASUED's Computer Science Department.