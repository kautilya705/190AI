# Vercel 404 Fix Guide

If you're still getting 404 errors, try these steps:

## Option 1: Check Vercel Project Settings

1. Go to Vercel Dashboard → Your Project → Settings → General
2. Verify:
   - **Framework Preset**: Should be "Vite" (or auto-detected)
   - **Root Directory**: Should be `.` (not `backend` or anything else)
   - **Build Command**: Should be `npm run build`
   - **Output Directory**: Should be `dist`
   - **Install Command**: Should be `npm install`

## Option 2: Manual Redeploy

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the three dots on the latest deployment
3. Click "Redeploy"
4. Make sure "Use existing Build Cache" is **unchecked**
5. Click "Redeploy"

## Option 3: Check Build Logs

1. Go to Vercel Dashboard → Your Project → Deployments
2. Click on the latest deployment
3. Check the "Build Logs" tab
4. Look for errors like:
   - "Cannot find module"
   - "Build failed"
   - "Output directory not found"

## Option 4: Verify Local Build Works

```bash
# Test build locally
npm install
npm run build

# Check if dist folder exists
ls -la dist/

# Should see index.html in dist/
```

## Option 5: Force Framework Detection

If Vercel isn't detecting Vite:
1. Go to Project Settings → General
2. Under "Framework Preset", manually select "Vite"
3. Save and redeploy

## Common Issues

- **404 on all routes**: Build output not found → Check Output Directory
- **404 on specific routes**: Routing not configured → Check vercel.json rewrites
- **Build fails**: Missing dependencies → Check package.json and npm install
