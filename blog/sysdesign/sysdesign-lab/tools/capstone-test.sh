#!/bin/bash
# capstone-test.sh — vòng lặp đo → vá → đo lại của Bài 18.
#
#   ./tools/capstone-test.sh seed        gieo 1.000 link (chay mot lan)
#   ./tools/capstone-test.sh all         chay lan luot v1 -> v5, in bang ket qua
#   ./tools/capstone-test.sh v1|..|v5    chay rieng mot phien ban
#
# MOI PHIEN BAN CHI DOI DUNG MOT THAM SO so voi phien ban truoc. Do la dieu kien de
# quy ket cai thien cho dung nguyen nhan — neu doi hai thu cung luc thi ban chi biet
# "co gi do tot hon", khong biet la thu nao.
set -u
cd "$(dirname "$0")/.."

MODE="${1:-all}"

step() {
  local name="$1"
  shift
  env "$@" docker compose --profile capstone up -d --force-recreate shortener >/dev/null 2>&1
  sleep 5
  curl -s "http://localhost:3010/admin/reset" >/dev/null
  docker compose run --rm --no-deps loadgen loadgen.js --url "http://shortener:3000/r/" \
    --key-space 1000 --key-param code -c 20 -d 12 -w 3 --json 2>/dev/null | tail -1 |
    python3 -c "
import json,sys
d = json.load(sys.stdin); L = d['latencyMs']
print(f'  $name  rps={d[\"throughputRps\"]:9.1f}  p50={L[\"p50\"]:6.2f}  p95={L[\"p95\"]:6.2f}  p99={L[\"p99\"]:7.2f}')"
  curl -s "http://localhost:3010/admin/stats" | python3 -c "
import json,sys
d = json.load(sys.stdin)
print(f'         dbReads={d[\"dbReads\"]:7d}  dbWrites={d[\"dbWrites\"]:7d}  redisOps={d[\"redisOps\"]:8d}  hitRatio={d[\"hitRatio\"]}')"
}

case "$MODE" in
  seed)
    docker compose --profile capstone up -d >/dev/null 2>&1
    sleep 10
    echo "  gieo 1.000 link..."
    for i in $(seq 0 999); do
      curl -s -o /dev/null "http://localhost:3010/new?code=k$i&url=https://js-tools.org/blog/$i"
    done
    echo "  xong"
    ;;
  v1) step "v1" CACHE=0 ASYNC_CLICKS=0 READ_REPLICA=0 ;;
  v2) step "v2" CACHE=1 ASYNC_CLICKS=0 READ_REPLICA=0 ;;
  v3) step "v3" CACHE=1 ASYNC_CLICKS=1 READ_REPLICA=0 ;;
  v4) step "v4" CACHE=1 ASYNC_CLICKS=1 READ_REPLICA=1 ;;
  v5) step "v5" CACHE=1 ASYNC_CLICKS=1 READ_REPLICA=1 SHORT_RATE_LIMIT=1000000 ;;
  all)
    echo "  v1 = goc: khong cache · ghi click dong bo · doc primary"
    step "v1" CACHE=0 ASYNC_CLICKS=0 READ_REPLICA=0
    echo "  v2 = v1 + cache-aside (Bai 5)"
    step "v2" CACHE=1 ASYNC_CLICKS=0 READ_REPLICA=0
    echo "  v3 = v2 + dem click bat dong bo (Bai 12)"
    step "v3" CACHE=1 ASYNC_CLICKS=1 READ_REPLICA=0
    echo "  v4 = v3 + read replica (Bai 7)"
    step "v4" CACHE=1 ASYNC_CLICKS=1 READ_REPLICA=1
    echo "  v5 = v4 + rate limit (Bai 13)"
    step "v5" CACHE=1 ASYNC_CLICKS=1 READ_REPLICA=1 SHORT_RATE_LIMIT=1000000
    ;;
  *)
    echo "khong biet che do '$MODE' — xem phan chu thich dau file"
    exit 1
    ;;
esac
