---
description: Deploy AntigraviPizza to Railway
---

# Deploy to Railway

This workflow guides you through deploying the AntigraviPizza application to Railway.

## Prerequisites

- Railway account (https://railway.app)
- Railway CLI installed: `npm install -g @railway/cli`
- GitHub repository with latest code pushed

## Steps

### 1. Login to Railway

```bash
railway login
```

### 2. Initialize Railway Project

```bash
railway init
```

Select "Create new project" and give it a name (e.g., "antigravipizza")

### 3. Link to GitHub Repository

In Railway dashboard:
- Go to your project
- Click "New" → "GitHub Repo"
- Select your AntigraviPizza repository
- Railway will auto-detect the Dockerfile

### 4. Configure Environment Variables

In Railway dashboard, go to Variables and add:

```
DB_TYPE=sqlite
NODE_ENV=production
PORT=5173
```

### 5. Add Volume for SQLite Database

In Railway dashboard:
- Go to your service
- Click "Settings" → "Volumes"
- Add volume:
  - Mount path: `/app/data`
  - Size: 1GB

### 6. Update Dockerfile for Volume

Ensure Dockerfile uses the volume path for database:

```dockerfile
# Database will be stored in /app/data/antigravipizza.db
ENV DB_PATH=/app/data/antigravipizza.db
```

### 7. Deploy

Railway will automatically deploy on push to main branch.

Or manually trigger:

```bash
railway up
```

### 8. Run Database Seed (First Deploy Only)

After first deployment, access the Railway shell:

```bash
railway run bash
```

Then run:

```bash
node server/init-schema.js
node server/seed-categories.js
node server/seed-ingredients.js
node server/seed-preparations.js
```

### 9. Get Deployment URL

```bash
railway domain
```

Or check in Railway dashboard under "Settings" → "Domains"

## Monitoring

- View logs: `railway logs`
- Check metrics in Railway dashboard
- Monitor database size in Volumes section

## Updating

Push to GitHub main branch and Railway will auto-deploy:

```bash
git add .
git commit -m "Update application"
git push origin main
```

## Troubleshooting

### Database not persisting
- Ensure volume is mounted at `/app/data`
- Check DB_PATH environment variable

### Build fails
- Check Railway logs: `railway logs`
- Verify Dockerfile is correct
- Ensure all dependencies are in package.json

### Seed data missing
- Run seed scripts manually via Railway shell
- Check that seed JSON files are in the repository
