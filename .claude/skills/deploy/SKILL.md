---
name: deploy
description: GitHub and Vercel deployment steps for Yunie's portfolio. Load this when setting up the project, pushing code, deploying, or connecting the custom domain.
---

# Deploy — Yunie Joo Portfolio

## Stack
- Repository: GitHub
- Hosting: Vercel (connected to GitHub for auto-deploy)
- Domain: Custom domain (TBD — to be connected in final phase)
- Framework: Next.js (Vercel auto-detects this, zero config needed)

---

## Initial Setup (Phase 1 — done once)

### 1. Initialize Git repo
```bash
git init
git add .
git commit -m "Initial project setup"
```

### 2. Create GitHub repo and push
```bash
gh repo create yunie-portfolio --public --source=. --remote=origin --push
```
If GitHub CLI (`gh`) is not installed, create the repo at github.com first, then:
```bash
git remote add origin https://github.com/[username]/yunie-portfolio.git
git push -u origin main
```

### 3. Connect to Vercel
- Go to vercel.com → Add New → Project
- Import from GitHub → select `yunie-portfolio`
- Framework preset: Next.js (auto-detected)
- Click Deploy
- Vercel generates a preview URL immediately (e.g. `yunie-portfolio.vercel.app`)

---

## Daily Workflow (every session)

### Save progress to GitHub
```bash
git add .
git commit -m "[describe what was built]"
git push
```
Vercel auto-deploys on every push. Preview URL updates automatically.

### When to commit
- After each completed component
- After each completed page layout
- Before starting something complex or experimental
- At the end of every working session

### Commit message format
Be specific. Examples:
- `Add navigation component with day/night theme toggle`
- `Complete homepage layout — hero slot, intro, work cards, footer`
- `Fix mobile breakpoint on case study sidebar`

---

## Custom Domain (Phase 8 — final)

### In Vercel
1. Go to project → Settings → Domains
2. Add your custom domain
3. Vercel shows DNS records to configure

### At your domain registrar (Namecheap, GoDaddy, etc.)
Add the DNS records Vercel provides:
- Type A record pointing to Vercel's IP
- Or CNAME record if using a subdomain

DNS propagation takes 5 minutes to 48 hours. Vercel shows status in real time.

---

## Environment Variables
If any environment variables are needed (e.g. for timezone API):
- Add to Vercel: Project Settings → Environment Variables
- Add locally: `.env.local` file (never commit this file to GitHub)
- `.env.local` is already in `.gitignore` by default in Next.js

---

## Troubleshooting

**Build fails on Vercel but works locally:**
- Check Node version: Vercel uses Node 18 by default. Confirm locally with `node --version`
- Check for any `process.env` variables used in code that aren't set in Vercel

**Site not updating after push:**
- Check Vercel dashboard → Deployments tab to see build status
- A failed build means the previous version stays live

**Custom domain not working:**
- DNS records can take up to 48 hours to propagate
- Check status in Vercel → Settings → Domains
