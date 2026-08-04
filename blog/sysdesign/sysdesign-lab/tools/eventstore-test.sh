#!/bin/bash
# eventstore-test.sh — chạy lại toàn bộ phép đo của Bài 14.
#
#   ./tools/eventstore-test.sh seed [EVENTS]   ghi N su kien vao log append-only
#   ./tools/eventstore-test.sh project         replay bang MOT cau SQL
#   ./tools/eventstore-test.sh projectApp      replay bang code ung dung (thuc te hon)
#   ./tools/eventstore-test.sh replay2x [0|1]  chay projection 2 lan (0 = ngay tho)
#   ./tools/eventstore-test.sh snapshot [AGG]  aggregate dai vs ngan
#   ./tools/eventstore-test.sh concurrent      hai nguoi ghi cung version
#   ./tools/eventstore-test.sh verify          read model con khop voi log khong
#
# Thu tu de tai lap dung so trong bai: seed -> replay2x 0 -> replay2x 1 -> snapshot.
set -u
cd "$(dirname "$0")/.."

MODE="${1:-seed}"
ARG="${2:-}"

docker compose --profile eventstore up -d postgres >/dev/null 2>&1

case "$MODE" in
  seed)
    docker compose run --rm --no-deps -e ROLE=seed -e EVENTS="${ARG:-200000}" esworker eventstore.js 2>/dev/null
    ;;
  replay2x)
    docker compose run --rm --no-deps -e ROLE=replay2x -e IDEMPOTENT="${ARG:-0}" esworker eventstore.js 2>/dev/null
    ;;
  snapshot)
    docker compose run --rm --no-deps -e ROLE=snapshot -e AGG="${ARG:-acc-long}" esworker eventstore.js 2>/dev/null
    ;;
  project | projectApp | concurrent | verify)
    docker compose run --rm --no-deps -e ROLE="$MODE" esworker eventstore.js 2>/dev/null
    ;;
  *)
    echo "khong biet che do '$MODE' — xem phan chu thich dau file"
    exit 1
    ;;
esac
