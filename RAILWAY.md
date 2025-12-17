# Railway Deployment

AntigraviPizza is deployed on Railway.

## Quick Deploy

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/antigravipizza)

## Manual Deployment

See [deploy-railway.md](.agent/workflows/deploy-railway.md) for detailed instructions.

## Environment Variables

Required environment variables:
- `DB_TYPE=sqlite`
- `NODE_ENV=production`
- `PORT=5173`

## Database

SQLite database is stored in a Railway volume mounted at `/app/data`.

## Monitoring

- Logs: `railway logs`
- Metrics: Available in Railway dashboard
- Database size: Check Volumes section

## Updates

Push to main branch for automatic deployment:

```bash
git push origin main
```
