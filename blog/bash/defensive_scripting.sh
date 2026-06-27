#!/bin/bash
# ==============================================================================
# Script thực hành: Defensive Bash & Security Best Practices
# Series: Lập trình Bash & Shell Scripting từ Cơ bản đến Nâng cao (Bài 10)
# Link bài học: https://js-tools.org/blog/bash/bash-defensive-scripting
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Strict Mode (Chế độ nghiêm ngặt)
# ------------------------------------------------------------------------------
# Kích hoạt chế độ phòng thủ:
#   -e: Thoát ngay lập tức khi một lệnh đơn lẻ gặp lỗi (exit code khác 0)
#   -u: Báo lỗi và dừng script khi truy cập một biến chưa được khai báo
#   -o pipefail: Bắt lỗi của mọi lệnh trong pipeline (mặc định chỉ lấy exit code của lệnh cuối)
set -euo pipefail

echo "=== DEFENSIVE BASH SCRIPT ==="

# ------------------------------------------------------------------------------
# 2. Sử dụng TRAP để bắt tín hiệu và dọn dẹp tài nguyên
# ------------------------------------------------------------------------------
# Tạo một thư mục tạm thời an toàn
TEMP_DIR=$(mktemp -d -t "defensive_script_XXXXXX")
echo "[INIT] Đã tạo thư mục làm việc tạm: $TEMP_DIR"

# Đăng ký hàm cleanup chạy tự động khi script thoát (hoặc bị ngắt)
cleanup() {
    local exit_code=$?
    echo "[CLEANUP] Đang dọn dẹp thư mục tạm..."
    rm -rf "$TEMP_DIR"
    echo "[CLEANUP] Đã xóa thư mục tạm thời. Exit code cuối: $exit_code"
}
# Bẫy sự kiện EXIT, SIGINT (Ctrl+C), SIGTERM (Kill)
trap cleanup EXIT SIGINT SIGTERM

# Ghi một số file tạm
echo "Dữ liệu tuyệt mật" > "$TEMP_DIR/secret.txt"

# ------------------------------------------------------------------------------
# 3. Kiểm tra và validate tham số đầu vào an toàn
# ------------------------------------------------------------------------------
validate_arguments() {
    echo "Đang validate tham số đầu vào..."
    # Kiểm tra số lượng tham số tối thiểu
    if [ "$#" -lt 1 ]; then
        echo "Lỗi: Thiếu tham số bắt buộc!" >&2
        echo "Cú pháp: $0 <tên_file_cần_xử_lý> [tham_số_khác]" >&2
        # Sử dụng exit 1 (sẽ tự động kích hoạt trap và thoát script)
        exit 1
    fi
    
    local target_file="$1"
    
    # Phòng chống Shell Injection: Không dùng eval, validate chuỗi nghiêm ngặt
    # Kiểm tra xem file có thực sự tồn tại và là file thông thường hay không
    if [ ! -f "$target_file" ]; then
        echo "Lỗi: Tập tin '$target_file' không tồn tại!" >&2
        exit 1
    fi
    
    echo "Validate tham số thành công. Tập tin hợp lệ: $target_file"
}

# ------------------------------------------------------------------------------
# 4. Truy cập biến an toàn (Tránh lỗi unbound variable do 'set -u')
# ------------------------------------------------------------------------------
demo_safe_variable_access() {
    echo "Kiểm tra truy cập biến..."
    
    # Cách kiểm tra biến tùy chọn (Optional) có thể chưa tồn tại mà không gây crash:
    # Dùng cú pháp parameter expansion mặc định: ${VAR:-default}
    local user_role="${OPTIONAL_USER_ROLE:-guest}"
    echo "Vai trò của người dùng: $user_role"

    # Đoạn code dưới đây sẽ gây lỗi dừng script lập tức nếu không được kiểm tra:
    # echo "$UNDEFINED_VARIABLE" # <- Crash!
}

# Giả lập tham số đầu vào nếu chạy demo trực tiếp
if [ "$#" -eq 0 ]; then
    echo "--- CHẠY THỬ MÔ PHỎNG LỖI THIẾU THAM SỐ (SẼ TRIGGER TRAP) ---"
    validate_arguments
else
    validate_arguments "$@"
    demo_safe_variable_access
fi
