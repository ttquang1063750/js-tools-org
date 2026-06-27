#!/bin/bash
# ============================================================
# Process & Signals trong Bash — Tổng hợp ví dụ thực hành
# Bài 6: Quản lý tiến trình, signals, trap, subshells
# Chạy: chmod +x process_signals.sh && ./process_signals.sh
# ============================================================

echo "=========================================="
echo "  BÀI 6: PROCESS & SIGNALS TRONG BASH"
echo "=========================================="

TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

# ----------------------------------------------------------
# 1. PROCESS BASICS — Thông tin tiến trình
# ----------------------------------------------------------
echo -e "\n--- 1. PROCESS BASICS ---"

echo "PID của script này (\$\$): $$"
echo "PPID (parent process): $PPID"
echo "User đang chạy: $(whoami)"

echo -e "\nSố process đang chạy trên hệ thống:"
ps aux 2>/dev/null | wc -l || ps -e | wc -l

echo -e "\nTìm process bash đang chạy:"
pgrep -l bash 2>/dev/null || ps aux | grep bash | grep -v grep

echo -e "\nProcess tree từ shell hiện tại:"
pstree -p $$ 2>/dev/null || echo "  (pstree không có sẵn trên hệ thống này)"

# Fork & Exec explanation
echo -e "\nFork & Exec:"
echo "  Khi chạy lệnh, shell thực hiện:"
echo "  1. fork() — tạo child process (bản sao của shell)"
echo "  2. exec() — thay thế child bằng chương trình mới"

# ----------------------------------------------------------
# 2. BACKGROUND JOBS — Foreground & Background
# ----------------------------------------------------------
echo -e "\n--- 2. BACKGROUND JOBS ---"

simulate_work() {
    local name="$1"
    local duration="$2"
    sleep "$duration"
    echo "  [$name] hoàn tất sau ${duration}s"
}

echo "Chạy 3 tasks song song ở background:"
simulate_work "Task A" 1 &
pid_a=$!
simulate_work "Task B" 2 &
pid_b=$!
simulate_work "Task C" 1 &
pid_c=$!

echo "  Task A PID: $pid_a"
echo "  Task B PID: $pid_b"
echo "  Task C PID: $pid_c"
echo "  PID background gần nhất (\$!): $!"

echo -e "\njobs hiện tại:"
jobs -l 2>/dev/null || echo "  (jobs command chỉ hoạt động trong interactive shell)"

echo -e "\nĐang chờ tất cả tasks (wait)..."
wait "$pid_a"
echo "  Task A exit code: $?"
wait "$pid_b"
echo "  Task B exit code: $?"
wait "$pid_c"
echo "  Task C exit code: $?"
echo "Tất cả tasks đã hoàn tất!"

# nohup & disown explanation
echo -e "\nnohup & disown:"
echo '  nohup long_task.sh &       # Immune với SIGHUP (đóng terminal)'
echo '  long_task & disown          # Bỏ khỏi job table'
echo '  wait $pid                   # Đợi process hoàn thành'

# ----------------------------------------------------------
# 3. SIGNALS — Gửi và nhận signal
# ----------------------------------------------------------
echo -e "\n--- 3. SIGNALS ---"

echo "Các signal quan trọng:"
echo "  SIGHUP  (1)  — Terminal đóng / reload config"
echo "  SIGINT  (2)  — Ctrl+C"
echo "  SIGQUIT (3)  — Ctrl+\\"
echo "  SIGKILL (9)  — Buộc dừng (KHÔNG THỂ bắt)"
echo "  SIGTERM (15) — Yêu cầu dừng lịch sự (mặc định của kill)"
echo "  SIGSTOP (19) — Tạm dừng (KHÔNG THỂ bắt)"
echo "  SIGCONT (18) — Tiếp tục sau khi bị stop"

# Demo kill
sleep 100 &
demo_pid=$!
echo -e "\nDemo gửi signal:"
echo "  Tạo process sleep (PID: $demo_pid)"
kill -0 $demo_pid 2>/dev/null && echo "  Process đang chạy: YES"
kill $demo_pid 2>/dev/null
wait $demo_pid 2>/dev/null
echo "  Đã gửi SIGTERM — process dừng"

# Kill variations
echo -e "\nCác cách gửi signal:"
echo '  kill 12345              # SIGTERM (mặc định)'
echo '  kill -9 12345           # SIGKILL (buộc dừng)'
echo '  kill -SIGHUP 12345     # Dùng tên signal'
echo '  killall nginx           # Kill theo tên process'
echo '  pkill -f "python.*srv"  # Kill theo pattern'

# ----------------------------------------------------------
# 4. TRAP — Bắt và xử lý signal
# ----------------------------------------------------------
echo -e "\n--- 4. TRAP ---"

# Demo trap EXIT trong subshell
echo "Demo trap EXIT:"
(
    cleanup_demo() {
        echo "  [trap EXIT] cleanup_demo() được gọi!"
    }
    trap cleanup_demo EXIT
    echo "  Đang chạy trong subshell..."
    echo "  Chuẩn bị thoát — trap sẽ tự động chạy cleanup"
)

# Demo trap ERR
echo -e "\nDemo trap ERR:"
(
    trap 'echo "  [trap ERR] Lỗi ở dòng $LINENO!"' ERR
    true   # Thành công — không trigger
    false  # Thất bại — trigger trap ERR
) 2>/dev/null || true

# Demo lockfile pattern
echo -e "\nDemo Lockfile Pattern:"
LOCKFILE="$TMPDIR/myapp.lock"

acquire_lock() {
    if [[ -f "$LOCKFILE" ]]; then
        local pid
        pid=$(cat "$LOCKFILE")
        echo "  Lock exists (PID $pid). Checking..."
        if kill -0 "$pid" 2>/dev/null; then
            echo "  Process $pid đang chạy. Abort."
            return 1
        else
            echo "  Stale lock (process $pid đã chết). Removing."
            rm -f "$LOCKFILE"
        fi
    fi
    echo $$ > "$LOCKFILE"
    echo "  Lock acquired by PID $$"
    return 0
}

release_lock() {
    rm -f "$LOCKFILE"
    echo "  Lock released."
}

acquire_lock
echo "  Đang làm exclusive work..."
release_lock

# Full trap pattern
echo -e "\nFull trap pattern cho production script:"
echo '  #!/bin/bash'
echo '  LOCKFILE="/tmp/deploy.lock"'
echo '  TMPDIR=$(mktemp -d)'
echo '  '
echo '  cleanup() {'
echo '      local exit_code=$?'
echo '      rm -f "$LOCKFILE"'
echo '      rm -rf "$TMPDIR"'
echo '      echo "Cleaned up (exit: $exit_code)"'
echo '  }'
echo '  trap cleanup EXIT'
echo '  trap "echo Interrupted!; exit 130" INT TERM'
echo '  '
echo '  echo $$ > "$LOCKFILE"'
echo '  # ... main logic ...'

# ----------------------------------------------------------
# 5. SUBSHELLS & BIẾN ĐẶC BIỆT
# ----------------------------------------------------------
echo -e "\n--- 5. SUBSHELLS & BIẾN ĐẶC BIỆT ---"

# Variable isolation
echo "Subshell variable isolation:"
parent_var="original"
(
    parent_var="modified in subshell"
    subshell_only="exists only here"
    echo "  Trong subshell: parent_var=$parent_var"
    echo "  Trong subshell: subshell_only=$subshell_only"
)
echo "  Ngoài subshell: parent_var=$parent_var (không đổi!)"
echo "  Ngoài subshell: subshell_only=${subshell_only:-KHÔNG TỒN TẠI}"

# $$ vs $BASHPID
echo -e "\n\$\$ vs \$BASHPID:"
echo "  Shell \$\$: $$"
echo "  Shell BASHPID: ${BASHPID:-N/A}"
(
    echo "  Subshell \$\$: $$ (giữ nguyên PID cha!)"
    echo "  Subshell BASHPID: ${BASHPID:-N/A} (PID thực)"
)

# PIPESTATUS
echo -e "\nPIPESTATUS — exit code từng lệnh trong pipeline:"
true | false | true
echo "  true | false | true → PIPESTATUS: ${PIPESTATUS[*]}"
echo "  (\$? chỉ cho exit code lệnh cuối = 0)"

echo -e "\n  set -o pipefail → pipeline fail khi BẤT KỲ lệnh nào fail"

# Process Substitution
echo -e "\nProcess Substitution <():"
echo "  So sánh 2 danh sách:"
diff <(echo -e "apple\nbanana\ncherry") <(echo -e "apple\nblueberry\ncherry") || true

echo -e "\nĐếm dòng đúng cách (tránh lỗi subshell với pipe):"
count=0
while IFS= read -r line; do
    ((count++))
done < <(echo -e "dòng 1\ndòng 2\ndòng 3\ndòng 4\ndòng 5")
echo "  Process substitution: count=$count (đúng!)"

count_pipe=0
echo -e "a\nb\nc" | while IFS= read -r line; do
    ((count_pipe++))
done
echo "  Pipe: count=$count_pipe (luôn 0 — biến mất trong subshell!)"

# ----------------------------------------------------------
# 6. VÍ DỤ TỔNG HỢP — Parallel tasks với trap
# ----------------------------------------------------------
echo -e "\n--- 6. VÍ DỤ TỔNG HỢP ---"
echo "Mô phỏng parallel deploy:"

deploy_simulation() {
    local deploy_tmp
    deploy_tmp=$(mktemp -d "$TMPDIR/deploy.XXXXXX")
    local start=$SECONDS

    echo "  Thư mục tạm: $deploy_tmp"

    # 3 bước song song
    (sleep 1 && echo "step1" > "$deploy_tmp/s1") &
    (sleep 1 && echo "step2" > "$deploy_tmp/s2") &
    (sleep 1 && echo "step3" > "$deploy_tmp/s3") &
    wait

    local ok=0
    for s in s1 s2 s3; do
        [[ -f "$deploy_tmp/$s" ]] && ((ok++))
    done

    echo "  Kết quả: $ok/3 bước OK ($((SECONDS - start))s)"
    rm -rf "$deploy_tmp"
}
deploy_simulation

echo -e "\n=========================================="
echo "  HOÀN THÀNH BÀI 6!"
echo "=========================================="
echo "Tips:"
echo "  kill -l          # Liệt kê tất cả signals"
echo "  trap -p          # Xem các trap đang active"
echo "  set -o pipefail  # Pipeline fail nếu bất kỳ lệnh fail"
