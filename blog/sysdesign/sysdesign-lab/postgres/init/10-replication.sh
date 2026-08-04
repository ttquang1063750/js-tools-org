#!/bin/bash
# 10-replication.sh — chạy MỘT LẦN khi primary được khởi tạo (Bài 7).
#
# Vì sao là file .sh trong /docker-entrypoint-initdb.d/ chứ không phải lệnh `docker exec`
# sau khi chạy: entrypoint của image postgres chạy initdb → bật server tạm → chạy các
# script trong thư mục này → TẮT server tạm → mới bật server thật. Nhờ trình tự đó, phần
# ghi thêm vào pg_hba.conf dưới đây đã có hiệu lực ngay khi server thật lên, không cần
# reload thủ công và không có khoảng thời gian nào replica bị từ chối kết nối.
set -e

# Role riêng cho replication. Cấp REPLICATION chứ không phải SUPERUSER — nguyên tắc
# quyền tối thiểu: role này chỉ cần đọc WAL, không cần gì khác.
psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
  CREATE ROLE replicator WITH REPLICATION LOGIN PASSWORD 'replpass';
EOSQL

# pg_hba.conf mà entrypoint sinh ra KHÔNG có dòng nào cho database ảo `replication`,
# nên nếu thiếu dòng dưới đây thì pg_basebackup của replica sẽ bị từ chối với thông báo
# "no pg_hba.conf entry for replication connection" — lỗi rất hay gặp khi tự dựng.
#
# `trust` chỉ dùng được vì đây là mạng nội bộ của lab. Ở môi trường thật phải là
# scram-sha-256 và giới hạn dải IP.
echo "host replication replicator all trust" >>"$PGDATA/pg_hba.conf"
echo "[init] da tao role replicator va mo pg_hba cho replication"
