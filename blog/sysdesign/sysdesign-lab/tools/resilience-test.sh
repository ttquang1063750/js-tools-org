#!/bin/bash
# resilience-test.sh — chạy lại toàn bộ phép đo của Bài 17.
#
#   ./tools/resilience-test.sh amplify [N] [budget]  retry amplification 3x3x3
#   ./tools/resilience-test.sh jitter                song retry co va khong jitter
#   ./tools/resilience-test.sh breaker               circuit breaker khi dependency chet
#   ./tools/resilience-test.sh deadline              timeout ngoai ngan hon viec ben trong
set -u
cd "$(dirname "$0")/.."

MODE="${1:-amplify}"
docker compose --profile micro up -d >/dev/null 2>&1
sleep 3

reset_leaf() {
  for a in app1 app2 app3; do
    docker compose exec -T "$a" node -e "require('http').get('http://127.0.0.1:3000/leaf-reset',r=>r.resume())" 2>/dev/null
  done
  sleep 1
}

read_leaf() {
  for a in app1 app2 app3; do
    docker compose exec -T "$a" node -e "
      require('http').get('http://127.0.0.1:3000/leaf-stats', r => {
        let b = ''; r.on('data', c => (b += c));
        r.on('end', () => { const j = JSON.parse(b);
          if (j.leafHits || j.retryCount || j.retryBudgetDenied)
            console.log('   ', j.instance, 'leafHits=' + j.leafHits, 'retry=' + j.retryCount, 'budgetDenied=' + j.retryBudgetDenied);
        });
      });" 2>/dev/null
  done
}

case "$MODE" in
  amplify)
    N="${2:-30}"
    BUDGET="${3:-0}"
    reset_leaf
    echo "  $N request nguoi dung · chuoi 3 tang · moi tang thu lai 3 lan · budget=$BUDGET"
    for i in $(seq 1 "$N"); do
      curl -s -o /dev/null "http://localhost:3001/layer?depth=3&retries=3&fail=1&budget=$BUDGET"
    done
    read_leaf
    echo "  (khong budget: $N x 27 = $((N * 27)) lan dap vao service tan cung)"
    ;;

  jitter | breaker | deadline)
    docker compose run --rm --no-deps -e ROLE="$MODE" resworker resilience.js 2>/dev/null
    ;;

  *)
    echo "khong biet che do '$MODE' — xem phan chu thich dau file"
    exit 1
    ;;
esac
