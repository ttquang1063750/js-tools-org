#!/bin/bash
# ratelimit-test.sh — chạy lại toàn bộ phép đo của Bài 13.
#
#   ./tools/ratelimit-test.sh boundary    so 4 thuat toan o moc giao cua so
#   ./tools/ratelimit-test.sh bench       do do tre cua chinh loi goi limiter
#   ./tools/ratelimit-test.sh memory      do bo nho moi nguoi dung
#   ./tools/ratelimit-test.sh nonatomic   tai tao loi INCR + EXPIRE tach roi
#   ./tools/ratelimit-test.sh overhead    do p99 dau-cuoi: /fast vs /limited
#   ./tools/ratelimit-test.sh e2e         3 replica sau LB, han muc 500/s toan cuc
set -u
cd "$(dirname "$0")/.."

MODE="${1:-boundary}"
LIMIT="${2:-100}"

case "$MODE" in
  boundary | bench | memory | nonatomic)
    docker compose --profile ratelimit up -d redis >/dev/null 2>&1
    docker compose run --rm --no-deps \
      -e ROLE="$MODE" -e LIMIT="$LIMIT" -e CALLS="${CALLS:-20000}" -e USERS="${USERS:-200}" \
      rlworker ratelimit.js 2>/dev/null
    ;;

  overhead)
    # Han muc rat cao => khong request nao bi tu choi. Hieu so voi /fast la CHI PHI thuan.
    RATE_LIMIT=1000000 docker compose --profile ratelimit up -d app1 redis >/dev/null 2>&1
    sleep 3
    for path in "fast" "limited?user=bench"; do
      echo "  --- /$path"
      docker compose run --rm --no-deps loadgen \
        loadgen.js --url "http://app1:3000/$path" -c 20 -d 10 -w 3 --json 2>/dev/null | tail -1
    done
    ;;

  e2e)
    # Han muc 500/s TOAN CUC cho ca 3 replica: bo dem nam o Redis, khong nam trong
    # bo nho tung app. Ky vong = suc chua ban dau (500) + 500/s * so giay do.
    RATE_LIMIT="${LIMIT:-500}" docker compose --profile ratelimit up -d >/dev/null 2>&1
    sleep 4
    docker compose run --rm --no-deps loadgen \
      loadgen.js --url "http://lb:8080/limited?user=alice" -c 20 -d 10 -w 0 --json 2>/dev/null | tail -1
    ;;

  *)
    echo "khong biet che do '$MODE' — xem phan chu thich dau file"
    exit 1
    ;;
esac
