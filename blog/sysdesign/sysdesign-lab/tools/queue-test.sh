#!/bin/bash
# queue-test.sh — bơm job vào Redis Streams rồi tiêu thụ bằng N consumer (Bài 12).
#
#   ./tools/queue-test.sh <COUNT> <N_CONSUMER> [WORK_MS] [POISON_EVERY] [MAX_ATTEMPTS] [IDEMPOTENT] [ACK_MODE]
#
# Con số quan trọng nhất là `msActive`: thời gian từ lúc bắt đầu tới job CUỐI CÙNG được
# xử lý — không tính thời gian ngồi chờ stream rỗng.
set -u
cd "$(dirname "$0")/.."

COUNT="${1:-20000}"
NC="${2:-1}"
WORK="${3:-0}"
POISON="${4:-0}"
MAXATT="${5:-0}"
IDEM="${6:-0}"
ACKMODE="${7:-after}"
DUR="${8:-60000}"
BATCH="${9:-32}"

docker compose exec -T redis redis-cli DEL lab:jobs lab:jobs:dlq >/dev/null 2>&1
docker compose exec -T redis redis-cli --scan --pattern 'lab:q:seen:*' 2>/dev/null | head -20000 |
  xargs -r docker compose exec -T redis redis-cli DEL >/dev/null 2>&1

echo "  bơm $COUNT job..."
docker compose run --rm --no-deps -e ROLE=producer -e COUNT="$COUNT" -e POISON_EVERY="$POISON" \
  queueworker queue.js 2>/dev/null | grep '^{'

pids=()
for i in $(seq 1 "$NC"); do
  docker compose run --rm --no-deps \
    -e ROLE=consumer -e CONSUMER="c$i" -e WORK_MS="$WORK" -e DURATION_MS="$DUR" \
    -e MAX_ATTEMPTS="$MAXATT" -e IDEMPOTENT="$IDEM" -e ACK_MODE="$ACKMODE" -e BATCH="$BATCH" \
    queueworker queue.js 2>/dev/null | grep '^{' &
  pids+=($!)
done
wait "${pids[@]}"

echo "  --- trạng thái cuối"
echo -n "  xlen=$(docker compose exec -T redis redis-cli XLEN lab:jobs 2>/dev/null | tr -d '\r')"
echo -n "  dlq=$(docker compose exec -T redis redis-cli XLEN lab:jobs:dlq 2>/dev/null | tr -d '\r')"
echo "  pending=$(docker compose exec -T redis redis-cli XPENDING lab:jobs g1 2>/dev/null | head -1 | tr -d '\r')"
