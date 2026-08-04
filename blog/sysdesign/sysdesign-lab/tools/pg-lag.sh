#!/bin/bash
# pg-lag.sh — đo replication lag THẬT, đọc từ chính PostgreSQL (Bài 7).
#
# Vì sao không tự đo bằng cách ghi rồi đọc: cách đó cho bạn lag *cộng thêm* thời gian
# round-trip của app, và không phân biệt được ba thành phần khác nhau của lag. PostgreSQL
# phơi sẵn cả ba:
#
#   write_lag   thời gian tới khi replica GHI được WAL xuống đĩa
#   flush_lag   thời gian tới khi replica FLUSH xong (bền vững)
#   replay_lag  thời gian tới khi replica ÁP DỤNG xong — ĐÂY mới là cái người đọc thấy
#
# replay_lag là con số quan trọng nhất cho mục 7.3: dữ liệu đã tới replica nhưng chưa
# được áp dụng thì lệnh SELECT vẫn trả về giá trị cũ.
set -u
cd "$(dirname "$0")/.."

echo "── Phía PRIMARY: pg_stat_replication ──"
docker compose exec -T postgres psql -U lab -d lab -x -c "
  SELECT application_name,
         state,
         sync_state,
         pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), sent_lsn))   AS chua_gui,
         pg_size_pretty(pg_wal_lsn_diff(pg_current_wal_lsn(), replay_lsn)) AS chua_replay,
         COALESCE(write_lag::text,  '-') AS write_lag,
         COALESCE(flush_lag::text,  '-') AS flush_lag,
         COALESCE(replay_lag::text, '-') AS replay_lag
  FROM pg_stat_replication;" 2>/dev/null

echo "── Phía REPLICA: đang ở chế độ nào và chậm bao nhiêu giây ──"
docker compose exec -T postgres-replica psql -U lab -d lab -x -c "
  SELECT pg_is_in_recovery() AS dang_la_standby,
         -- Khi không có lưu lượng ghi, hàm này tăng dần theo thời gian dù replica đã
         -- bắt kịp — vì nó đo 'khoảng cách tới bản ghi WAL cuối cùng đã replay'.
         -- Đừng alert dựa trên nó khi hệ thống rảnh.
         COALESCE(EXTRACT(EPOCH FROM now() - pg_last_xact_replay_timestamp())::numeric(10,3), 0)
           AS giay_ke_tu_giao_dich_cuoi_replay,
         pg_last_wal_receive_lsn() AS da_nhan,
         pg_last_wal_replay_lsn()  AS da_replay;" 2>/dev/null
