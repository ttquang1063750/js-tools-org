#!/usr/bin/env bash
# ══════════════════════════════════════════════════════════════
# Bài 8: DevOps & Automation với Bash
# Series: Bash & Shell Scripting — js-tools.org
# Chạy: chmod +x devops_automation.sh && ./devops_automation.sh
# ══════════════════════════════════════════════════════════════

set -euo pipefail

echo "======================================="
echo "  DevOps & Automation with Bash"
echo "======================================="

# ────────────────────────────────────────
# 1. GIT HOOKS
# ────────────────────────────────────────

echo ""
echo "=== 1. Git Hooks ==="

echo "-- pre-commit hook example --"
echo "Checks: large files (>5MB), secrets detection, ESLint, ShellCheck"
echo ""
echo "Key patterns:"
echo '  git diff --cached --name-only    # List staged files'
echo '  git diff --cached -G "pattern"   # Search staged content'
echo '  chmod +x .git/hooks/pre-commit   # Make hook executable'

echo ""
echo "-- commit-msg hook example --"
echo "Validates Conventional Commits format:"
echo '  Pattern: ^(feat|fix|docs|chore|refactor)(\(scope\))?: .{1,72}$'
echo '  Example: feat(auth): add Google OAuth login'

echo ""
echo "-- Sharing hooks with team --"
echo '  git config core.hooksPath .githooks'
echo '  # Or add to package.json:'
echo '  # "scripts": { "prepare": "git config core.hooksPath .githooks" }'

# ────────────────────────────────────────
# 2. CI/CD SCRIPTING
# ────────────────────────────────────────

echo ""
echo "=== 2. CI/CD Scripting ==="

demo_ci_build() {
  echo "-- CI Build Pipeline --"
  echo "Step 1: npm ci"
  echo "Step 2: npm run lint"
  echo "Step 3: npm run test -- --coverage"
  echo "Step 4: npm run build"
  echo "Step 5: du -sh dist/"
  echo ""
  echo "GitHub Actions commands:"
  echo '  echo "::group::Step Name"           # Collapsible group'
  echo '  echo "::error::message"             # Error annotation'
  echo '  echo "key=value" >> $GITHUB_OUTPUT  # Export output'
}

demo_ci_build

echo ""
echo "Required env var pattern:"
echo '  : "${DEPLOY_HOST:?DEPLOY_HOST not set}"'
echo '  : "${SSH_KEY:?SSH_KEY not set}"'

# ────────────────────────────────────────
# 3. DOCKER & BASH
# ────────────────────────────────────────

echo ""
echo "=== 3. Docker & Bash ==="

wait_for_service() {
  local host="$1" port="$2" timeout="${3:-10}"
  echo "Waiting for $host:$port (timeout: ${timeout}s)..."
  # In production: until nc -z "$host" "$port"; do sleep 1; done
  echo "  $host:$port ready"
}

echo "-- Docker Entrypoint Pattern --"
wait_for_service "postgres" "5432" 60
wait_for_service "redis" "6379" 30

echo ""
echo "Dockerfile usage:"
echo '  COPY docker-entrypoint.sh /usr/local/bin/'
echo '  RUN chmod +x /usr/local/bin/docker-entrypoint.sh'
echo '  ENTRYPOINT ["docker-entrypoint.sh"]'
echo '  CMD ["node", "server.js"]'
echo ""
echo 'Key: exec "$@"  # Replace shell with app process'
echo '     # App receives signals directly (SIGTERM, SIGINT)'

echo ""
echo "-- Docker Compose Helpers --"
echo '  docker-compose up -d --build'
echo '  docker-compose logs -f --tail=100 app'
echo '  docker-compose exec app /bin/bash'
echo '  docker system prune -f'

# ────────────────────────────────────────
# 4. CRON JOBS & SSH
# ────────────────────────────────────────

echo ""
echo "=== 4. Cron Jobs & SSH ==="

echo "-- Crontab Syntax --"
echo '# min hour day month weekday command'
echo '0 2 * * *     backup.sh       # Daily 2:00 AM'
echo '*/5 * * * *   health.sh       # Every 5 min'
echo '0 9 * * 1-5   report.sh       # 9AM, Mon-Fri'
echo '0 0 1 * *     cleanup.sh      # 1st of month'
echo ""
echo "Always redirect output:"
echo '  * * * * * /path/script.sh >> /var/log/cron.log 2>&1'

echo ""
echo "-- SSH Automation --"
echo '  ssh-keygen -t ed25519 -C "deploy@myapp"'
echo '  ssh-copy-id -i ~/.ssh/deploy_key.pub user@server'
echo ""
echo "  # Rsync (better than scp):"
echo '  rsync -avz --delete --exclude="node_modules" ./dist/ user@server:/var/www/app/'
echo ""
echo "  # SSH Tunnel (port forwarding):"
echo '  ssh -L 5432:localhost:5432 user@server -N'

# ────────────────────────────────────────
# 5. MAKEFILE & SHELLCHECK
# ────────────────────────────────────────

echo ""
echo "=== 5. Makefile & ShellCheck ==="

echo "-- Makefile Example --"
echo '.PHONY: help install build deploy clean'
echo '.DEFAULT_GOAL := help'
echo ''
echo 'help:        ## Show commands'
echo 'install:     ## npm ci'
echo 'build:       ## npm run build'
echo 'deploy: build  ## Deploy (runs build first)'
echo 'clean:       ## rm -rf dist node_modules'

echo ""
echo "-- ShellCheck Common Fixes --"
echo 'SC2086: Always quote variables'
echo '  Bad:  rm $filename'
echo '  Good: rm "$filename"'
echo ""
echo 'SC2046: Quote command substitution'
echo '  Bad:  rm $(find . -name "*.tmp")'
echo '  Good: find . -name "*.tmp" -exec rm {} +'
echo ""
echo 'SC2155: Declare and assign separately'
echo '  Bad:  local output=$(command)'
echo '  Good: local output'
echo '        output=$(command)'

if command -v shellcheck >/dev/null 2>&1; then
  echo ""
  echo "-- Running ShellCheck on this script --"
  shellcheck "$0" && echo "ShellCheck passed!" || echo "ShellCheck found issues"
else
  echo ""
  echo "ShellCheck not installed. Install: brew install shellcheck"
fi

# ────────────────────────────────────────
# SERIES BEST PRACTICES CHECKLIST
# ────────────────────────────────────────

echo ""
echo "======================================="
echo "  Series Best Practices Checklist"
echo "======================================="
echo '  [x] #!/usr/bin/env bash + set -euo pipefail'
echo '  [x] Quote all variables: "$var"'
echo '  [x] Use [[ ]] instead of [ ]'
echo '  [x] Use $(command) instead of backticks'
echo '  [x] Trap signals for cleanup'
echo '  [x] Log with timestamp and levels'
echo '  [x] Run ShellCheck before commit'
echo '  [x] Organize code with functions'
echo '  [x] Dry-run mode for dangerous scripts'
echo '  [x] Check dependencies with command -v'
echo ""
echo "=== Demo complete! ==="
