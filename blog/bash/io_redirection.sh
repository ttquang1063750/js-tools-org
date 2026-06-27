#!/bin/bash
# ==============================================================================
# Script thực hành: Điều hướng I/O & File Descriptors nâng cao
# Series: Lập trình Bash & Shell Scripting từ Cơ bản đến Nâng cao (Bài 9)
# Link bài học: https://js-tools.org/blog/bash/bash-io-redirection
# ==============================================================================

# ------------------------------------------------------------------------------
# 1. Quản lý File Descriptors cơ bản (Stdout & Stderr)
# ------------------------------------------------------------------------------
demo_standard_redirection() {
    echo "=== 1. ĐIỀU HƯỚNG TIÊU CHUẨN ==="
    # Xuất ra stdout (FD 1) và stderr (FD 2)
    echo "Đây là thông điệp stdout thông thường." >&1
    echo "Đây là thông báo lỗi stderr!" >&2

    # Chạy lệnh và chuyển hướng stdout, stderr riêng biệt
    ls /thumuc/khong/ton/tai > stdout.log 2> stderr.log
    echo "Đã ghi lỗi của lệnh ls vào stderr.log (kích thước: $(wc -c < stderr.log) bytes)"

    # Gộp stdout và stderr làm một
    ping -c 1 google.com > network.log 2>&1
    # Cách viết hiện đại: ping -c 1 google.com &> network.log
    echo "Đã lưu toàn bộ output của lệnh ping vào network.log"
}

# ------------------------------------------------------------------------------
# 2. Sử dụng 'exec' để mở/đóng File Descriptor tùy biến
# ------------------------------------------------------------------------------
demo_custom_fds() {
    echo "=== 2. MỞ FILE DESCRIPTOR TÙY BIẾN ==="
    local temp_file="data_sample.txt"
    echo -e "Dòng thứ nhất\nDòng thứ hai\nDòng thứ ba" > "$temp_file"

    # Mở File Descriptor 3 để đọc từ temp_file
    exec 3< "$temp_file"

    # Đọc dòng đầu tiên từ FD 3
    read -u 3 line1
    echo "Đọc dòng 1 từ FD 3: $line1"

    # Đọc dòng tiếp theo
    read -u 3 line2
    echo "Đọc dòng 2 từ FD 3: $line2"

    # Đóng File Descriptor 3
    exec 3<&-
    echo "Đã đóng File Descriptor 3."

    # Mở File Descriptor 4 để ghi (chế độ append)
    exec 4>> log_output.txt
    echo "[$(date)] Log event ghi qua FD 4" >&4
    echo "[$(date)] Log event tiếp theo qua FD 4" >&4
    
    # Đóng File Descriptor 4
    exec 4>&-
    echo "Đã đóng File Descriptor 4. Nội dung log_output.txt:"
    cat log_output.txt

    # Dọn dẹp
    rm -f "$temp_file" log_output.txt stdout.log stderr.log network.log
}

# ------------------------------------------------------------------------------
# 3. Sử dụng Named Pipes (FIFOs) để giao tiếp giữa các tiến trình
# ------------------------------------------------------------------------------
demo_named_pipes() {
    echo "=== 3. GIAO TIẾP QUA NAMED PIPE (FIFO) ==="
    local pipe_path="my_temp_pipe"

    # Tạo named pipe
    if [ ! -p "$pipe_path" ]; then
        mkfifo "$pipe_path"
        echo "Đã tạo Named Pipe: $pipe_path"
    fi

    # Chạy một tiến trình chạy ngầm (Reader) để đọc từ pipe
    (
        echo "  [Reader Node] Đang chờ dữ liệu từ Pipe..."
        while read line; do
            echo "  [Reader Node] Đã nhận: '$line' vào lúc $(date +%H:%M:%S)"
        done < "$pipe_path"
        echo "  [Reader Node] Pipe đã đóng. Kết thúc."
    ) &
    local reader_pid=$!

    # Ghi dữ liệu vào pipe từ tiến trình cha (Writer)
    sleep 1
    echo "Dữ liệu gói 1" > "$pipe_path"
    sleep 1
    echo "Dữ liệu gói 2" > "$pipe_path"
    sleep 1
    echo "Dữ liệu gói 3" > "$pipe_path"

    # Gửi tín hiệu đóng pipe (Reader sẽ dừng)
    wait $reader_pid
    rm -f "$pipe_path"
    echo "Đã dọn dẹp Pipe."
}

# ------------------------------------------------------------------------------
# 4. Socket Scripting sử dụng /dev/tcp (Không cần nc hay telnet)
# ------------------------------------------------------------------------------
demo_socket_scripting() {
    echo "=== 4. SOCKET SCRIPTING VỚI /dev/tcp ==="
    
    # Kiểm tra cổng 80 (HTTP) của google.com có mở không
    local host="google.com"
    local port=80

    echo "Đang kiểm tra kết nối tới $host:$port..."
    # Mở kết nối đọc-ghi trên FD 5 trỏ tới socket /dev/tcp
    if exec 5<>"/dev/tcp/$host/$port"; then
        echo "Kết nối thành công! Socket mở trên FD 5."
        
        # Gửi request HTTP cơ bản
        echo -e "GET / HTTP/1.1\r\nHost: $host\r\nConnection: close\r\n\r\n" >&5
        
        # Đọc 3 dòng đầu tiên của HTTP response từ socket
        echo "Đầu ra response từ google.com:"
        read -u 5 response_line1
        read -u 5 response_line2
        read -u 5 response_line3
        echo "  $response_line1"
        echo "  $response_line2"
        echo "  $response_line3"
        
        # Đóng FD 5
        exec 5>&-
        exec 5<&-
    else
        echo "Kết nối tới $host:$port thất bại."
    fi
}

# Chạy demo
demo_standard_redirection
echo ""
demo_custom_fds
echo ""
demo_named_pipes
echo ""
demo_socket_scripting
