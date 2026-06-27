#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# Bài 7: Thực Chiến Bash — Backup, Monitor & Deploy Scripts
# Series: Bash & Shell Scripting — js-tools.org
# Chạy: chmod +x real_world_scripts.sh && ./real_world_scripts.sh
# ══════════════════════════════════════════════════════════════

set -euo pipefail

# ────────────────────────────────────────
# 1. ERROR HANDLING
# ────────────────────────────────────────

echo "═══ 1. Error Handling ═══"

# set -e  : Dừng khi lệnh exit != 0
# set -u  : Lỗi khi dùng biến chưa khai báo
# set -o pipefail : Pipe trả exit code của lệnh thất bại đầu tiên

# Cho phép lệnh fail với || true:
rm /tmp/not-exist-file-12345.tmp 2>/dev/null || true

# Giá trị mặc định cho biến:
DB_PORT="${DB_PORT:-5432}"
echo "DB_PORT = $DB_PORT"

# Trap — bẫy lỗi và cleanup:
TMPFILE=$(mktemp)
cleanup() {
  rm -f "$TMPFILE"
  echo "Cleaned up temp file"
}
trap cleanup EXIT

on_error() {
  echo "Error at line $1 (exit code: $?)"
}
trap 'on_error $LINENO' ERR

echo "Temp file created: $TMPFILE"

# ────────────────────────────────────────
# 2. LOGGING FUNCTION
# ────────────────────────────────────────

echo ""
echo "═══ 2. Logging Function ═══"

RED='\033[0;31m'
YELLOW='\033[1;33m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
NC='\033[0m'

log() {
  local level="$1"; shift
  local message="$*"
  local timestamp
  timestamp=$(date '+%Y-%m-%d %H:%M:%S')
  local color="$NC"
  case "$level" in
    DEBUG) color="$BLUE" ;;
    INFO)  color="$GREEN" ;;
    WARN)  color="$YELLOW" ;;
    ERROR) color="$RED" ;;
  esac
  echo -e "${color}[${timestamp}] [${level}] ${message}${NC}"
}

log_info()  { log "INFO" "$@"; }
log_warn()  { log "WARN" "$@"; }
log_error() { log "ERROR" "$@"; }
log_debug() { log "DEBUG" "$@"; }

log_info "Application started"
log_debug "Connecting to database..."
log_warn "Disk usage > 80%"
log_error "API server unreachable"

# ────────────────────────────────────────
# 3. BACKUP SCRIPT
# ────────────────────────────────────────

echo ""
echo "═══ 3. Backup Script (Demo) ═══"

demo_backup() {
  local source_dir="${1:-.}"
  local backup_dir="/tmp/backup_demo_$$"
  local max_backups=3
  local date_str
  date_str=$(date '+%Y-%m-%d_%H%M%S')
  local backup_name="demo_backup_${date_str}.tar.gz"

  mkdir -p "$backup_dir"

  log_info "Backing up $source_dir..."
  tar -czf "${backup_dir}/${backup_name}" \
    --exclude='node_modules' \
    --exclude='.git' \
    -C "$(dirname "$source_dir")" \
    "$(basename "$source_dir")" 2>/dev/null || {
    log_error "Backup failed"
    return 1
  }

  local size
  size=$(du -h "${backup_dir}/${backup_name}" | cut -f1)
  log_info "Backup done: $backup_name ($size)"

  # Rotation — xóa backup cũ
  local count
  count=$(find "$backup_dir" -name "demo_backup_*.tar.gz" -type f | wc -l | tr -d ' ')
  if (( count > max_backups )); then
    local excess=$(( count - max_backups ))
    log_info "Rotating: removing $excess old backups"
    find "$backup_dir" -name "demo_backup_*.tar.gz" -type f \
      | sort | head -n "$excess" | xargs rm -f
  fi

  local total
  total=$(find "$backup_dir" -name "demo_backup_*.tar.gz" -type f | wc -l | tr -d ' ')
  log_info "Total backups: $total"

  # Cleanup demo
  rm -rf "$backup_dir"
}

demo_backup /tmp

# ────────────────────────────────────────
# 4. HEALTH CHECK MONITOR
# ────────────────────────────────────────

echo ""
echo "═══ 4. Health Check (Demo — single run) ═══"

check_endpoint() {
  local url="$1"
  local timeout=5
  local http_code
  http_code=$(curl -s -o /dev/null -w "%{http_code}" --max-time "$timeout" "$url" 2>/dev/null) || http_code="000"
  local response_time
  response_time=$(curl -s -o /dev/null -w "%{time_total}" --max-time "$timeout" "$url" 2>/dev/null) || response_time="N/A"

  if [[ "$http_code" -ge 200 && "$http_code" -lt 400 ]] 2>/dev/null; then
    log_info "OK  | $url | HTTP $http_code | ${response_time}s"
  else
    log_error "FAIL | $url | HTTP $http_code"
  fi
}

check_endpoint "https://httpbin.org/status/200"
check_endpoint "https://httpbin.org/status/500"

# ────────────────────────────────────────
# 5. BATCH FILE RENAMER
# ────────────────────────────────────────

echo ""
echo "═══ 5. Batch Renamer (Demo) ═══"

DEMO_DIR=$(mktemp -d)
touch "$DEMO_DIR/my file.txt" "$DEMO_DIR/report (final).pdf" "$DEMO_DIR/photo 2024.jpg"

sanitize_filenames() {
  local dir="$1"
  for file in "$dir"/*; do
    [[ -f "$file" ]] || continue
    local base dirn new_base
    base=$(basename "$file")
    dirn=$(dirname "$file")
    new_base=$(echo "$base" | tr ' ' '_' | tr -d '()[]{}')
    if [[ "$base" != "$new_base" ]]; then
      echo "  '$base' -> '$new_base'"
      mv "$file" "${dirn}/${new_base}"
    fi
  done
}

sanitize_filenames "$DEMO_DIR"
echo "Files after rename:"
ls "$DEMO_DIR"
rm -rf "$DEMO_DIR"

# ────────────────────────────────────────
# 6. .ENV PARSER
# ────────────────────────────────────────

echo ""
echo "═══ 6. .env Parser (Demo) ═══"

ENV_DEMO=$(mktemp)
cat > "$ENV_DEMO" << 'ENVFILE'
# Database config
DB_HOST=localhost
DB_PORT=5432
DB_NAME="myapp_db"

# API
API_KEY='secret-key-123'
ENVFILE

load_env() {
  local env_file="$1"
  local loaded=0
  while IFS= read -r line || [[ -n "$line" ]]; do
    [[ -z "$line" || "$line" =~ ^[[:space:]]*# ]] && continue
    line=$(echo "$line" | xargs)
    if [[ "$line" =~ ^([A-Za-z_][A-Za-z0-9_]*)=(.*)$ ]]; then
      local key="${BASH_REMATCH[1]}"
      local value="${BASH_REMATCH[2]}"
      value="${value%\"}"; value="${value#\"}"
      value="${value%\'}"; value="${value#\'}"
      echo "  $key = $value"
      loaded=$((loaded + 1))
    fi
  done < "$env_file"
  echo "Loaded $loaded variables"
}

load_env "$ENV_DEMO"
rm -f "$ENV_DEMO"

echo ""
echo "═══ Demo complete! ═══"
