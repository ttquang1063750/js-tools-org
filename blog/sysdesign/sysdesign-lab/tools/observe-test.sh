#!/bin/bash
# observe-test.sh — chạy lại toàn bộ phép đo của Bài 16.
#
#   ./tools/observe-test.sh percentile   percentile nao NHIN THAY duoc su co
#   ./tools/observe-test.sh cardinality  them nhan user_id -> so chuoi thoi gian no ra sao
#   ./tools/observe-test.sh trace        waterfall co va khong truyen correlation ID
#   ./tools/observe-test.sh slo          SLI va error budget tinh tu histogram that
set -u
cd "$(dirname "$0")/.."

MODE="${1:-percentile}"
run() { docker compose run --rm --no-deps loadgen loadgen.js "$@" 2>/dev/null | tail -1; }

case "$MODE" in
  percentile)
    docker compose --profile micro up -d app1 >/dev/null 2>&1
    sleep 3
    # Su co co hinh dang dien hinh: da so nhanh, mot ti le nho rat cham. Cau hoi la
    # percentile nao nhin thay duoc no — va cau tra loi phu thuoc vao chinh ti le do.
    for P in 0.005 0.01 0.02 0.05; do
      curl -s "localhost:3001/metrics-reset" >/dev/null
      echo -n "  ti_le_cham=$P  "
      run --url "http://app1:3000/incident?p=$P&ms=300" -c 20 -d 8 -w 2 --json |
        python3 -c "
import json,sys;L=json.load(sys.stdin)['latencyMs']
print(f\"mean={L['mean']:6.2f} p50={L['p50']:5.2f} p95={L['p95']:6.2f} p99={L['p99']:7.2f} max={L['max']}\")"
      curl -s 'localhost:3001/metrics?top=1' |
        python3 -c "import json,sys;t=json.load(sys.stdin)['top'][0];print(f\"                  histogram trong app: p99={t['p99']} p99.9={t['p999']}\")"
    done
    ;;

  cardinality)
    for L in "route,status" "route,status,user"; do
      METRIC_LABELS="$L" docker compose --profile micro up -d --force-recreate app1 >/dev/null 2>&1
      sleep 3
      curl -s "localhost:3001/metrics-reset" >/dev/null
      # 50.000 nguoi dung khac nhau — con so rat khiem ton so voi mot dich vu that.
      run --url "http://app1:3000/fast" -c 20 -d 8 -w 1 --key-space 50000 --key-param user --json >/dev/null
      curl -s "localhost:3001/metrics?top=1" | python3 -c "
import json,sys;d=json.load(sys.stdin)
print(f\"  labels={str(d['labels']):34s} chuoi_thoi_gian={d['soChuoiThoiGian']:7d}  bytes={d['uocLuongBytes']:9d}\")"
    done
    ;;

  trace)
    docker compose --profile micro up -d >/dev/null 2>&1
    sleep 3
    for PROP in 1 0; do
      echo "  --- propagate=$PROP"
      CID=$(curl -s "localhost:3001/traced-chain?hops=3&slowHop=2&slowMs=250&propagate=$PROP" |
        python3 -c "import json,sys;print(json.load(sys.stdin)['correlationId'])")
      # /trace-all dong vai BO THU GOM: hoi tung instance roi ghep span lai, vi khong
      # tien trinh nao tu no nhin thay toan bo duong di cua mot request.
      curl -s "localhost:3001/trace-all?id=$CID" | python3 -c "
import json,sys;d=json.load(sys.stdin)
print('  so chang:', d['soChang'])
for s in d['spans']: print(f\"    {s['name']:22s} {s['ms']:8.2f} ms  {s['phanTram']:5.1f}%\")"
    done
    ;;

  slo)
    docker compose --profile micro up -d app1 >/dev/null 2>&1
    sleep 3
    for P in 0.001 0.01 0.02; do
      curl -s "localhost:3001/metrics-reset" >/dev/null
      run --url "http://app1:3000/incident?p=$P&ms=300" -c 20 -d 8 -w 1 --json >/dev/null
      curl -s "localhost:3001/metrics?sloMs=250&sloTarget=99.9&top=1" | python3 -c "
import json,sys;s=json.load(sys.stdin)['slo']
print(f\"  ti_le_cham=$P  SLI={s['sli']:7.3f}%  muc_tieu={s['mucTieu']}%  budget_da_dot={s['budgetDaDot']:>9s}  dat_SLO={s['datSlo']}\")"
    done
    ;;

  *)
    echo "khong biet che do '$MODE' — xem phan chu thich dau file"
    exit 1
    ;;
esac
