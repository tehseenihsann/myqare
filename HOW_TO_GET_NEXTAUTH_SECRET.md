# How to Get/Set NEXTAUTH_SECRET in Vercel

## Viewing Environment Variables in Vercel

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com/dashboard
   - Sign in to your account

2. **Navigate to Your Project**
   - Click on your project (`my-qare` or similar)

3. **Go to Settings**
   - Click on **Settings** tab at the top

4. **Click on Environment Variables**
   - In the left sidebar, click **Environment Variables**

5. **Check for NEXTAUTH_SECRET**
   - Look for `NEXTAUTH_SECRET` in the list
   - **Note**: Vercel masks secret values for security, so you'll see `••••••••` instead of the actual value
   - You can see if it exists, but not the actual value

## If NEXTAUTH_SECRET Doesn't Exist

You need to **generate a new secret** and add it to Vercel.

### Step 1: Generate a Secret

**Option A: Using OpenSSL (Terminal)**
```bash
openssl rand -base64 32
```

**Option B: Using Node.js**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

**Option C: Online Generator**
- Visit: https://generate-secret.vercel.app/32
- Copy the generated secret

### Step 2: Add to Vercel

1. In Vercel Dashboard → Your Project → Settings → Environment Variables
2. Click **Add New** button
3. Fill in:
   - **Key**: `NEXTAUTH_SECRET`
   - **Value**: (paste the generated secret)
   - **Environment**: 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - (Select all three to use the same secret everywhere)
4. Click **Save**

### Step 3: Redeploy

After adding the environment variable:
1. Go to **Deployments** tab
2. Click the **⋯** (three dots) on the latest deployment
3. Click **Redeploy**
   - OR
4. Push a new commit to trigger a new deployment

## If NEXTAUTH_SECRET Already Exists

If you see `NEXTAUTH_SECRET` in the list but don't know its value:

**You have two options:**

### Option 1: Generate a New One (Recommended)
1. Generate a new secret (use methods above)
2. In Vercel, click on the existing `NEXTAUTH_SECRET` entry
3. Click **Edit** or **Update**
4. Replace the value with your new secret
5. Save and redeploy

### Option 2: Check Your Local .env File
If you set it locally, check:
- `.env.local`
- `.env`
- Look for: `NEXTAUTH_SECRET=...`

**Note**: If you change the secret, all existing sessions will be invalidated and users will need to log in again.

## Quick Command to Generate and Copy

Run this in your terminal to generate and copy to clipboard:

**Windows (PowerShell):**
```powershell
openssl rand -base64 32 | Set-Clipboard
```

**Mac/Linux:**
```bash
openssl rand -base64 32 | pbcopy  # Mac
openssl rand -base64 32 | xclip -selection clipboard  # Linux
```

Then paste it directly into Vercel.

## Verification

After setting `NEXTAUTH_SECRET`:

1. ✅ Check it appears in Environment Variables list
2. ✅ Redeploy your application
3. ✅ Check build logs - should not show warnings about missing secret
4. ✅ Try logging in - should work now!

## Important Notes

- **Never commit secrets to Git** - Always use environment variables
- **Use different secrets for different environments** if needed (Production vs Development)
- **Keep your secret secure** - Don't share it publicly
- **If compromised**, generate a new one immediately

