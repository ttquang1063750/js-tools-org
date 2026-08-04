-- 20-schema.sql — schema tối giản cho Bài 7 và Bài 8.
--
-- Bảng `profiles` tồn tại để tái tạo đúng một bug: người dùng đổi ảnh đại diện (ghi vào
-- primary) rồi tải lại trang (đọc từ replica) và thấy ảnh cũ. Vì thế bảng chỉ cần đủ để
-- một lệnh ghi và một lệnh đọc chạm vào cùng một dòng.
CREATE TABLE IF NOT EXISTS profiles (
  id         INTEGER PRIMARY KEY,
  avatar     TEXT        NOT NULL,
  -- Số phiên bản tăng dần: nhờ nó mà "dữ liệu cũ" là một điều ĐO ĐƯỢC chứ không phải
  -- cảm nhận. Đọc ra version nhỏ hơn version vừa ghi = đọc dữ liệu cũ, không thể tranh cãi.
  version    BIGINT      NOT NULL DEFAULT 0,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

INSERT INTO profiles (id, avatar, version)
SELECT g, 'avatar-v0.png', 0
FROM generate_series(1, 1000) AS g
ON CONFLICT (id) DO NOTHING;

-- Bảng dùng để bơm ghi ồ ạt nhằm CỐ Ý tạo replication lag (Bài 7 mục 7.3).
-- Không có index ngoài khoá chính: mục tiêu là sinh nhiều WAL nhanh nhất có thể.
CREATE TABLE IF NOT EXISTS write_load (
  id     BIGSERIAL PRIMARY KEY,
  filler TEXT NOT NULL
);
