# Fixing 401 Unauthorized Error on Vercel

## The Problem
You're getting `401 (Unauthorized)` when trying to log in on `https://my-qare.vercel.app`

## Most Common Causes

### 1. Missing `NEXTAUTH_SECRET` ⚠️ **MOST LIKELY**

**Check:**
- Go to Vercel Dashboard → Your Project → Settings → Environment Variables
- Look for `NEXTAUTH_SECRET`
- If it's missing, add it!

**Fix:**
1. Generate a secret:
   ```bash
   openssl rand -base64 32
   ```
   Or use: https://generate-secret.vercel.app/32

2. Add to Vercel:
   - Key: `NEXTAUTH_SECRET`
   - Value: (paste the generated secret)
   - Environment: Production, Preview, Development (select all)

3. **Redeploy** your application

### 2. Missing or Incorrect `NEXTAUTH_URL`

**Check:**
- Go to Vercel Dashboard → Settings → Environment Variables
- Look for `NEXTAUTH_URL`

**Fix:**
- Key: `NEXTAUTH_URL`
- Value: `https://my-qare.vercel.app` (must match your exact Vercel URL)
- **Must include `https://`**
- Environment: Production, Preview, Development

### 3. Database Not Seeded

The database might not have the admin user in production.

**Check:**
- Look at Vercel build logs
- See if `npm run db:seed` ran successfully

**Fix:**
1. Connect to your production database
2. Run the seed script:
   ```bash
   DATABASE_URL="your-production-database-url" npm run db:seed
   ```

### 4. Database Connection Issues

**Check:**
- Is `DATABASE_URL` set correctly in Vercel?
- Does it point to your production database (not localhost)?

**Fix:**
- Verify `DATABASE_URL` in Vercel environment variables
- Make sure it's the production database URL
- Format: `postgresql://user:password@host:port/database?schema=public`

## Quick Checklist

Before trying to log in, verify:

- [ ] `NEXTAUTH_SECRET` is set in Vercel (generate if missing)
- [ ] `NEXTAUTH_URL` is set to `https://my-qare.vercel.app`
- [ ] `DATABASE_URL` is set to production database
- [ ] Database has been seeded (admin user exists)
- [ ] Application has been redeployed after adding variables

## How to Verify

1. **Check Vercel Function Logs:**
   - Go to Vercel Dashboard → Deployments → Latest → Functions
   - Click on `/api/auth/[...nextauth]`
   - Look for error messages

2. **Check Build Logs:**
   - Go to Vercel Dashboard → Deployments → Latest → Build Logs
   - Look for Prisma generation and seeding

3. **Test Login:**
   - Try: `admin@mycarer.com` / `admin123`
   - Check browser console (F12) for errors
   - Check Network tab for the 401 error details

## After Fixing

1. **Redeploy** your application
2. **Clear browser cookies** for the site
3. **Try logging in again**

## Still Not Working?

Check the Vercel function logs - the updated auth code now logs detailed error messages that will help identify the exact issue.

