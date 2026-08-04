#!/bin/bash
# lock-test.sh — chạy hai worker tranh một lock và in ra số xung đột THẬT (Bài 10).
#
#   ./tools/lock-test.sh <LOCK:off|on> <FENCE:0|1> <PAUSE_MS> [LOCK_TTL_MS] [ROUNDS] [WORK_MS]
#
# Con số quan trọng nhất là `xung_dot`: số lần có TỪ HAI worker cùng ở trong vùng tới hạn
# tại cùng một thời điểm. Lock được dựng lên để giữ con số này bằng 0.
set -u
cd "$(dirname "$0")/.."

LOCK="${1:-off}"
FENCE="${2:-0}"
PAUSE="${3:-0}"
TTL="${4:-200}"
ROUNDS="${5:-60}"
WORK="${6:-300}"

# Xoá sạch bộ đếm để mỗi phép đo bắt đầu từ 0.
docker compose exec -T redis redis-cli -n 0 DEL \
  lab:lock:job lab:crit:inside lab:crit:conflicts \
  lab:res:seen lab:res:writes lab:res:accepted lab:res:rejected lab:fence:seq >/dev/null 2>&1

run_worker() {
  docker compose run --rm --no-deps \
    -e WORKER="$1" -e LOCK="$LOCK" -e FENCE="$FENCE" \
    -e PAUSE_MS="$PAUSE" -e LOCK_TTL_MS="$TTL" -e ROUNDS="$ROUNDS" -e WORK_MS="$WORK" \
    lockworker lock-worker.js 2>/dev/null | grep '^{'
}

# Hai worker chạy ĐỒNG THỜI — đó là điều kiện để xung đột có cơ hội xảy ra.
run_worker w1 &
p1=$!
run_worker w2 &
p2=$!
wait $p1 $p2

get() { docker compose exec -T redis redis-cli -n 0 GET "$1" 2>/dev/null | tr -d '\r'; }

writes=$(get lab:res:writes)
conflicts=$(get lab:crit:conflicts)
rejected=$(get lab:res:rejected)
accepted=$(get lab:res:accepted)
echo "  LOCK=$LOCK FENCE=$FENCE PAUSE_MS=$PAUSE TTL=$TTL WORK_MS=$WORK"
echo "  vao_vung_toi_han=${writes:-0}  XUNG_DOT=${conflicts:-0}  fencing_chap_nhan=${accepted:-0}  fencing_TU_CHOI=${rejected:-0}"
