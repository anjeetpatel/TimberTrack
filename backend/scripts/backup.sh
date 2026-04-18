#!/bin/bash
#
# TimberTrack — Daily MongoDB Backup Script
#
# Usage: Run daily via cron. Add to crontab:
#   0 2 * * * /path/to/TimberTrack/backend/scripts/backup.sh >> /var/log/timbertrack-backup.log 2>&1
#
# Requires: mongodump (MongoDB Database Tools)
# Install: https://www.mongodb.com/try/download/database-tools
#

# ── Configuration ────────────────────────────────────────────────
MONGODB_URI="${MONGODB_URI:-mongodb://localhost:27017/timbertrack}"
BACKUP_BASE_DIR="${BACKUP_DIR:-./backups}"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="$BACKUP_BASE_DIR/$DATE"
RETENTION_DAYS=30

# ── Run backup ────────────────────────────────────────────────────
echo "[$DATE] Starting TimberTrack backup..."
mkdir -p "$BACKUP_DIR"

mongodump --uri="$MONGODB_URI" --out="$BACKUP_DIR"

if [ $? -eq 0 ]; then
  echo "[$DATE] ✅ Backup successful: $BACKUP_DIR"
else
  echo "[$DATE] ❌ Backup FAILED"
  exit 1
fi

# ── Cleanup old backups ───────────────────────────────────────────
echo "[$DATE] Removing backups older than $RETENTION_DAYS days..."
find "$BACKUP_BASE_DIR" -maxdepth 1 -type d -mtime +$RETENTION_DAYS -exec rm -rf {} + 2>/dev/null
echo "[$DATE] Cleanup complete."

# ── Disk usage report ────────────────────────────────────────────
BACKUP_SIZE=$(du -sh "$BACKUP_DIR" 2>/dev/null | cut -f1)
TOTAL_BACKUP_SIZE=$(du -sh "$BACKUP_BASE_DIR" 2>/dev/null | cut -f1)
echo "[$DATE] Backup size: $BACKUP_SIZE | Total backup storage: $TOTAL_BACKUP_SIZE"

echo "[$DATE] Done."
