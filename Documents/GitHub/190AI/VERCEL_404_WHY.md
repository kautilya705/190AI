# Why You're Getting 404 on Vercel

## The app is built correctly

- **Local build works:** `npm run build` produces `dist/index.html` and `dist/assets/*`.
- **Screens are built:** StudentDashboard, ProfessorOverview, AssignmentDetail are all in the bundle.
- **Routing is set up:** `vercel.json` rewrites all routes to `/index.html`.

So the 404 is **not** because the screen wasn't built or because index.html is "not showing" in your code.  
The 404 happens because **Vercel is not serving your built app** — either the build never runs, it fails, or the wrong folder is used as the website root.

---

## Most likely causes

### 1. Wrong Root Directory (very common)

If in Vercel the **Root Directory** is set to something like `backend` or a subfolder:

- The build either doesn’t run or runs in the wrong place.
- There is no `index.html` in what Vercel uses as the site root.
- **Result:** every request → 404.

**Fix:**  
Vercel Dashboard → Your Project → **Settings → General → Root Directory**

- Set to **`.`** (project root) or leave **empty**.
- It must **not** be `backend` or any subfolder.
- Save and **redeploy**.

### 2. Build failing on Vercel

If the build fails on Vercel:

- No `dist/` folder is produced.
- Vercel has nothing to serve.
- **Result:** 404 for all routes.

**Fix:**  
Vercel Dashboard → **Deployments** → latest deployment → **Build Logs**.

- Check for errors (e.g. `npm install` or `vite build` failing).
- Fix the reported error (e.g. missing dependency, Node version), then redeploy.

### 3. Framework / build not detected

If Vercel doesn’t detect the project as a Vite app:

- It might not run `npm run build`.
- Or it might use the wrong output directory.
- **Result:** 404.

**Fix:**  
Vercel Dashboard → **Settings → General**

- **Framework Preset:** set to **Vite** (do not leave as “Other” if you have the option).
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`
- Save and redeploy.

---

## Quick checklist

In Vercel → Project → **Settings → General**, confirm:

| Setting           | Value              |
|------------------|--------------------|
| Root Directory   | `.` or empty       |
| Framework Preset  | Vite               |
| Build Command     | `npm run build`    |
| Output Directory  | `dist`             |
| Install Command   | `npm install`      |

Then: **Deployments → Redeploy** (without using cache).

---

## Summary

- **404 = Vercel is not serving your built app.**
- It’s **not** that “index.html isn’t showing” or “the screen wasn’t built” in your repo — the build and `index.html` are correct locally.
- Fix it by making sure **Root Directory** is the repo root, the **build runs and succeeds** on Vercel, and **Output Directory** is `dist`.
