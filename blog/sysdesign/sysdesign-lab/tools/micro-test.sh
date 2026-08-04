#!/bin/bash
# micro-test.sh — chạy lại toàn bộ phép đo của Bài 15.
#
#   ./tools/micro-test.sh cost              mono vs micro: p99 va throughput
#   ./tools/micro-test.sh availability      do khac dung cua chuoi N hop (fail 1%/hop)
#   ./tools/micro-test.sh saga [N] [0|1]    N saga hong o buoc 3, co/khong hanh dong bu
#
# Moi buoc trong ca hai kien truc lam DUNG cung mot luong viec (`doUnitOfWork`), nen
# chenh lech do duoc chi den tu cach GOI, khong den tu luong viec.
set -u
cd "$(dirname "$0")/.."

MODE="${1:-cost}"
docker compose --profile micro up -d >/dev/null 2>&1
sleep 3

# Doc trang thai saga cua ca ba instance. Moi service GIU DU LIEU CUA RIENG NO, nen
# phai hoi tung instance — day chinh la dieu lam viec doi chieu du lieu tro nen kho.
read_state() {
  for a in app1 app2 app3; do
    echo -n "  $a: "
    docker compose exec -T "$a" node -e "
      require('http').get('http://127.0.0.1:3000/stats', r => {
        let b = ''; r.on('data', c => (b += c));
        r.on('end', () => { const j = JSON.parse(b); console.log(JSON.stringify(j.sagaState), 'compensations=' + j.sagaCompensations); });
      });" 2>/dev/null
  done
}

case "$MODE" in
  cost)
    for m in mono micro; do
      echo "  --- mode=$m (4 buoc, w=5000)"
      docker compose run --rm --no-deps loadgen \
        loadgen.js --url "http://app1:3000/chain?mode=$m&hops=4&w=5000" -c 20 -d 10 -w 3 --json 2>/dev/null | tail -1
    done
    ;;

  availability)
    for h in 1 2 4 8; do
      echo "  --- $h hop, moi hop hong 1%  (ly thuyet: 0.99^$h)"
      docker compose run --rm --no-deps loadgen \
        loadgen.js --url "http://app1:3000/chain?mode=micro&hops=$h&w=2000&fail=0.01" -c 20 -d 8 -w 2 --json 2>/dev/null |
        tail -1
    done
    ;;

  saga)
    N="${2:-200}"
    COMP="${3:-1}"
    for a in app1 app2 app3; do
      docker compose exec -T "$a" node -e "require('http').get('http://127.0.0.1:3000/saga-reset', r => r.resume())" 2>/dev/null
    done
    sleep 1
    echo "  chay $N saga, hong o buoc 3 (inventory), compensate=$COMP"
    for i in $(seq 1 "$N"); do
      curl -s -o /dev/null "http://localhost:3001/saga?failAt=3&compensate=$COMP"
    done
    echo "  --- trang thai tung service sau khi chay xong"
    read_state
    echo "  (mong doi voi compensate=1: tat ca ve 0. Voi compensate=0: order=$N, payment=$N, inventory=0)"
    ;;

  *)
    echo "khong biet che do '$MODE' — xem phan chu thich dau file"
    exit 1
    ;;
esac
