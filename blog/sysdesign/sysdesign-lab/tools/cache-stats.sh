#!/bin/bash
# cache-stats.sh — gộp số liệu cache của CẢ BA replica.
#
# Vì sao cần script này: mỗi replica có bộ đếm RIÊNG trong bộ nhớ của nó. Đọc /stats của
# một replica chỉ cho bạn 1/3 sự thật. Con số cần cho Bài 5 là TỔNG số truy vấn database
# mà toàn hệ thống đã tạo ra.
#
#   ./tools/cache-stats.sh reset   → xoá bộ đếm trên cả 3 replica
#   ./tools/cache-stats.sh         → in tổng hợp
set -u
cd "$(dirname "$0")/.."

if [ "${1:-show}" = "reset" ]; then
  for a in app1 app2 app3; do
    docker compose exec -T "$a" node -e "
      require('http').get('http://127.0.0.1:3000/reset-stats', r => r.resume());
    " 2>/dev/null
  done
  echo "đã xoá bộ đếm trên app1, app2, app3"
  exit 0
fi

docker compose exec -T app1 node -e '
const http = require("http");
const get = (host) =>
  new Promise((res) => {
    const r = http.get({ host, port: 3000, path: "/stats" }, (s) => {
      let b = "";
      s.on("data", (d) => (b += d));
      s.on("end", () => {
        try { res(JSON.parse(b)); } catch { res(null); }
      });
    });
    r.on("error", () => res(null));
  });
(async () => {
  const rows = (await Promise.all(["app1", "app2", "app3"].map(get))).filter(Boolean);
  const sum = (f) => rows.reduce((a, r) => a + (r[f] || 0), 0);
  const hits = sum("cacheHits"), misses = sum("cacheMisses"), db = sum("dbQueries");
  const joins = sum("singleFlightJoins"), reqs = sum("totalRequests");
  const rwwT = sum("rwwTotal"), rwwS = sum("rwwStale"), rwwP = sum("rwwPinned");
  for (const r of rows) {
    console.log(`  ${r.instance}: req=${r.totalRequests} hit=${r.cacheHits} miss=${r.cacheMisses} db=${r.dbQueries} join=${r.singleFlightJoins} qDepth=${r.dbMaxQueueDepth} wait=${r.dbAvgWaitMs}ms pool=${r.dbMaxConcurrency}`);
  }
  const total = hits + misses;
  console.log(`  ---- TỔNG: req=${reqs} hit=${hits} miss=${misses} dbQueries=${db} singleFlightJoins=${joins}`);
  const maxQ = Math.max(...rows.map((r) => r.dbMaxQueueDepth || 0));
  const avgWait = rows.length ? rows.reduce((a, r) => a + (r.dbAvgWaitMs || 0), 0) / rows.length : 0;
  console.log(`  ---- HÀNG ĐỢI DB: sâu nhất=${maxQ} · chờ trung bình=${avgWait.toFixed(2)}ms · pool=${rows[0] ? rows[0].dbMaxConcurrency : "?"}/replica`);
  if (rwwT) {
    console.log(`  ---- READ-YOUR-WRITES: tong=${rwwT} doc_ra_du_lieu_cu=${rwwS} ghim_ve_primary=${rwwP} · ti le cu = ${((rwwS / rwwT) * 100).toFixed(2)}% · READ_PIN_MS=${rows[0] ? rows[0].readPinMs : "?"}`);
  }
  if (total) console.log(`  hit ratio = ${((hits / total) * 100).toFixed(2)}%   ·   truy vấn DB / request = ${(db / reqs).toFixed(4)}`);
})();
' 2>/dev/null
