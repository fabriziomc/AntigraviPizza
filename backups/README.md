# Backups Directory

This directory contains automatic database backups.

## Files

- `latest-backup.json` - Most recent database backup (auto-generated)

## Backup Format

```json
{
  "version": "1.0",
  "timestamp": 1702641234567,
  "date": "2024-12-15T08:00:00.000Z",
  "data": {
    "recipes": [...],
    "pizzaNights": [...],
    "guests": [...],
    "ingredients": [...],
    "preparations": [...]
  }
}
```

## Usage

### Create Backup
```bash
node server/backup-db.js
```

### Restore from Backup
```bash
node server/restore-db.js
```

## Automatic Restore

The application automatically restores from backup on Railway deployment if the database is empty.
