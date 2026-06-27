#!/bin/bash
# ==============================================================================
# Script thực hành: System Automation, Monitoring & scheduling
# Series: Lập trình Bash & Shell Scripting từ Cơ bản đến Nâng cao (Bài 11)
# Link bài học: https://js-tools.org/blog/bash/bash-system-automation
# ==============================================================================

# Kích hoạt chế độ nghiêm ngặt bảo vệ hệ thống
set -euo pipefail

# Thư mục chứa logs của script tự động hóa
LOG_DIR="./logs"
LOG_FILE="$LOG_DIR/system_monitor.log"
mkdir -p "$LOG_DIR"

# ------------------------------------------------------------------------------
# 1. Hệ thống giám sát tài nguyên (CPU, RAM, Disk)
# ------------------------------------------------------------------------------
check_system_resources() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Khởi động phiên giám sát tài nguyên..." >> "$LOG_FILE"
    
    # 1.1 Kiểm tra dung lượng ổ đĩa (Root Partition)
    # df xuất phần trăm ổ đĩa root /, lấy dòng 2 cột 5, xóa ký tự %
    local disk_usage
    disk_usage=$(df -h / | awk 'NR==2 {print $5}' | sed 's/%//')
    echo "Dung lượng đĩa đã sử dụng: ${disk_usage}%" | tee -a "$LOG_FILE"
    
    # 1.2 Kiểm tra dung lượng RAM trống (Free memory percentage)
    # Lấy thông số từ free -m
    local total_mem free_mem mem_usage_percent
    if command -v free &> /dev/null; then
        total_mem=$(free -m | awk '/^Mem:/{print $2}')
        free_mem=$(free -m | awk '/^Mem:/{print $4 + $6}') # free + buff/cache
        mem_usage_percent=$(( 100 * (total_mem - free_mem) / total_mem ))
        echo "Dung lượng RAM đang sử dụng: ${mem_usage_percent}%" | tee -a "$LOG_FILE"
    else
        # Fallback cho macOS (Darwin) không có lệnh free
        local vm_page_size vm_pages_free vm_pages_total mem_used_gb
        vm_page_size=$(sysctl -n hw.pagesize)
        vm_pages_total=$(sysctl -n hw.memsize)
        vm_pages_free=$(vm_stat | awk '/Pages free/ {print $3}' | sed 's/\.//')
        local free_mem_bytes=$(( vm_pages_free * vm_page_size ))
        mem_usage_percent=$(( 100 * (vm_pages_total - free_mem_bytes) / vm_pages_total ))
        echo "Dung lượng RAM đang sử dụng (macOS): ${mem_usage_percent}%" | tee -a "$LOG_FILE"
    fi

    # 1.3 Ngưỡng cảnh báo (Thresholds)
    local disk_threshold=85
    local mem_threshold=90

    if [ "$disk_usage" -gt "$disk_threshold" ]; then
        send_alert "DUNG LƯỢNG ĐĨA CẢNH BÁO" "Ổ đĩa cứng chính đã đạt ${disk_usage}%, vượt ngưỡng cho phép ${disk_threshold}%."
    fi

    if [ "$mem_usage_percent" -gt "$mem_threshold" ]; then
        send_alert "DUNG LƯỢNG RAM CẢNH BÁO" "Bộ nhớ RAM đã sử dụng ${mem_usage_percent}%, vượt ngưỡng cảnh báo ${mem_threshold}%."
    fi
}

# ------------------------------------------------------------------------------
# 2. Gửi cảnh báo tự động qua Slack hoặc Telegram Webhook
# ------------------------------------------------------------------------------
send_alert() {
    local title="$1"
    local message="$2"
    
    echo "[ALERT] $title: $message" | tee -a "$LOG_FILE"
    
    # URL webhook mẫu (Hãy thay bằng webhook thực tế của bạn)
    local telegram_bot_token="${TELEGRAM_BOT_TOKEN:-''}"
    local telegram_chat_id="${TELEGRAM_CHAT_ID:-''}"
    
    if [ -n "$telegram_bot_token" ] && [ -n "$telegram_chat_id" ]; then
        echo "Đang gửi cảnh báo tới Telegram..."
        local text="⚠️ *${title}* ⚠️\n\n${message}\nHost: $(hostname)\nThời gian: $(date)"
        curl -s -X POST "https://api.telegram.org/bot${telegram_bot_token}/sendMessage" \
            -d "chat_id=${telegram_chat_id}" \
            -d "text=${text}" \
            -d "parse_mode=Markdown" > /dev/null
    else
        echo "[INFO] Chưa cấu hình Telegram token/chat_id. Bỏ qua gửi thông báo mạng."
    fi
}

# ------------------------------------------------------------------------------
# 3. Trình xoay vòng Log (Log Rotation Emulator) đơn giản tự chế
# ------------------------------------------------------------------------------
rotate_logs() {
    local max_size_bytes=$(( 1024 * 10 )) # 10 KB để dễ demo
    
    if [ -f "$LOG_FILE" ]; then
        local current_size
        current_size=$(wc -c < "$LOG_FILE")
        
        if [ "$current_size" -gt "$max_size_bytes" ]; then
            echo "[LOGROTATE] Log file vượt quá $max_size_bytes bytes ($current_size bytes). Tiến hành xoay vòng..."
            # Di chuyển thành file log.1
            mv "$LOG_FILE" "$LOG_FILE.1"
            # Tạo file log mới trống
            touch "$LOG_FILE"
            # Nén file log cũ bằng gzip
            gzip -f "$LOG_FILE.1"
            echo "[LOGROTATE] Đã nén log cũ thành $LOG_FILE.1.gz" >> "$LOG_FILE"
        fi
    fi
}

# Chạy giám sát tài nguyên
check_system_resources
# Thực hiện xoay vòng log bảo vệ đĩa cứng
rotate_logs
