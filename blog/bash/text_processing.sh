#!/bin/bash
# ============================================================
# Text Processing trong Bash — Tổng hợp ví dụ thực hành
# Bài 5: Pipeline, grep, sed, awk & Redirection
# Chạy: chmod +x text_processing.sh && ./text_processing.sh
# ============================================================

echo "=========================================="
echo "  BÀI 5: XỬ LÝ TEXT TRONG BASH"
echo "=========================================="

# Setup: tạo file demo
TMPDIR=$(mktemp -d)
trap 'rm -rf "$TMPDIR"' EXIT

cat > "$TMPDIR/employees.csv" <<'EOF'
id,name,department,salary
1,Alice,Engineering,95000
2,Bob,Marketing,72000
3,Charlie,Engineering,105000
4,Diana,Marketing,68000
5,Eve,Engineering,115000
6,Frank,Sales,78000
7,Grace,Sales,82000
8,Hank,Engineering,98000
EOF

cat > "$TMPDIR/app.log" <<'EOF'
2026-06-24 10:23:01 INFO  Server started on port 8080
2026-06-24 10:23:05 INFO  Database connected
2026-06-24 10:24:12 WARN  Slow query detected (2.3s)
2026-06-24 10:25:00 ERROR Connection timeout to redis
2026-06-24 10:25:01 INFO  Retrying connection...
2026-06-24 10:25:03 ERROR Redis connection failed
2026-06-24 10:26:00 INFO  Health check OK
EOF

# ----------------------------------------------------------
# 1. REDIRECTION — stdin, stdout, stderr
# ----------------------------------------------------------
echo -e "\n--- 1. REDIRECTION ---"

# stdout redirect
echo "Ghi đè file (>):"
echo "stdout to file"   > "$TMPDIR/output.txt"
echo "append to file"  >> "$TMPDIR/output.txt"
cat "$TMPDIR/output.txt"

# stderr redirect
echo -e "\nstderr redirect (2>):"
ls /nonexistent 2> "$TMPDIR/errors.txt" || true
echo "stderr captured: $(cat "$TMPDIR/errors.txt")"

# Combine stdout + stderr
echo -e "\nCombine stdout + stderr (2>&1):"
ls /tmp /nonexistent > "$TMPDIR/all.txt" 2>&1 || true
echo "Combined output: $(wc -l < "$TMPDIR/all.txt") dòng"

# /dev/null
echo -e "\n/dev/null — bỏ qua output:"
ls /tmp > /dev/null 2>&1 && echo "  Lệnh thành công (output bị bỏ qua)"

# Here Document
echo -e "\nHere Document (<<EOF):"
cat > "$TMPDIR/config.ini" <<EOF
[database]
host=localhost
port=5432
name=myapp
EOF
cat "$TMPDIR/config.ini"

# Here String
echo -e "\nHere String (<<<):"
IFS=',' read -r name age city <<< "Quang,25,HCM"
echo "  Tên: $name, Tuổi: $age, TP: $city"

wc -w <<< "Bash là ngôn ngữ shell scripting"

# ----------------------------------------------------------
# 2. PIPELINE — Kết nối stdout → stdin
# ----------------------------------------------------------
echo -e "\n--- 2. PIPELINE ---"

echo "Departments (sorted with count):"
tail -n +2 "$TMPDIR/employees.csv" | cut -d',' -f3 | sort | uniq -c | sort -rn

echo -e "\nTop earners (salary > 90000):"
tail -n +2 "$TMPDIR/employees.csv" | awk -F',' '$4 > 90000 {print $2, "$"$4}' | sort -t'$' -k2 -rn

echo -e "\ntee — vừa hiển thị vừa lưu file:"
echo "Hello from tee" | tee "$TMPDIR/tee_output.txt"
echo "  (Đã lưu vào file, nội dung: $(cat "$TMPDIR/tee_output.txt"))"

# ----------------------------------------------------------
# 3. GREP — Tìm kiếm pattern
# ----------------------------------------------------------
echo -e "\n--- 3. GREP ---"

echo "grep cơ bản — tìm ERROR:"
grep "ERROR" "$TMPDIR/app.log"

echo -e "\ngrep -i (case insensitive) — đếm 'error':"
echo "  Số dòng: $(grep -ic 'error' "$TMPDIR/app.log")"

echo -e "\ngrep -n (line numbers) — tìm Engineering:"
grep -n 'Engineering' "$TMPDIR/employees.csv"

echo -e "\ngrep -v (invert) — dòng KHÔNG phải INFO:"
grep -v 'INFO' "$TMPDIR/app.log"

echo -e "\ngrep -E (extended regex) — WARN hoặc ERROR:"
grep -E '(WARN|ERROR)' "$TMPDIR/app.log"

echo -e "\ngrep -o (only matching) — trích xuất số:"
echo "Giá: 150000 VND và 89000 VND" | grep -oE '[0-9]+'

echo -e "\ngrep -A 1 (after context) — 1 dòng sau ERROR:"
grep -A 1 "ERROR" "$TMPDIR/app.log"

# ----------------------------------------------------------
# 4. SED — Stream Editor
# ----------------------------------------------------------
echo -e "\n--- 4. SED ---"

echo "sed substitute (s/old/new/):"
echo "Hello World" | sed 's/World/Vietnam/'

echo -e "\nsed global replace (s///g):"
echo "foo bar foo baz foo" | sed 's/foo/XXX/g'

echo -e "\nsed delete comments and empty lines:"
cat <<DEMO | sed '/^#/d; /^$/d'
# Đây là comment
host=localhost

port=8080
# Comment khác
debug=true
DEMO

echo -e "\nsed in-place (-i) demo:"
cp "$TMPDIR/config.ini" "$TMPDIR/config_edit.ini"
sed -i.bak 's/localhost/127.0.0.1/' "$TMPDIR/config_edit.ini"
echo "After sed -i:"
cat "$TMPDIR/config_edit.ini"

echo -e "\nsed print range (dòng 2-4):"
sed -n '2,4p' "$TMPDIR/employees.csv"

echo -e "\nsed capture groups — đổi format ngày:"
echo "2026-06-24" | sed 's/\([0-9]*\)-\([0-9]*\)-\([0-9]*\)/\3\/\2\/\1/'

echo -e "\nsed change delimiter (hữu ích khi pattern chứa /):"
echo "/usr/local/bin/python" | sed 's|/usr/local|/opt|'

echo -e "\nsed address range — chỉ thay thế trong dòng 2-5:"
sed '2,5s/Engineering/Kỹ thuật/' "$TMPDIR/employees.csv" | head -6

# ----------------------------------------------------------
# 5. AWK — Field Processing
# ----------------------------------------------------------
echo -e "\n--- 5. AWK ---"

echo "awk field extraction (name, salary):"
awk -F',' 'NR > 1 { printf "  %-10s $%s\n", $2, $4 }' "$TMPDIR/employees.csv"

echo -e "\nawk filter (salary > 90000):"
awk -F',' 'NR > 1 && $4 > 90000 { print "  " $2, "$"$4 }' "$TMPDIR/employees.csv"

echo -e "\nawk BEGIN/END (tính tổng và trung bình lương):"
awk -F',' '
    NR > 1 { total += $4; count++ }
    END { printf "  Total: $%d | Avg: $%d | Count: %d\n", total, total/count, count }
' "$TMPDIR/employees.csv"

echo -e "\nawk per-department summary:"
awk -F',' '
    NR > 1 { dept[$3] += $4; cnt[$3]++ }
    END {
        for (d in dept)
            printf "  %-15s total=$%-8d avg=$%d (%d người)\n", d, dept[d], dept[d]/cnt[d], cnt[d]
    }
' "$TMPDIR/employees.csv"

echo -e "\nawk format bảng đẹp (printf):"
awk -F',' '
    BEGIN { printf "  %-4s %-10s %-15s %10s\n", "ID", "TÊN", "PHÒNG BAN", "LƯƠNG"
            printf "  %-4s %-10s %-15s %10s\n", "---", "---", "---", "---" }
    NR > 1 { printf "  %-4s %-10s %-15s %10d\n", $1, $2, $3, $4 }
' "$TMPDIR/employees.csv"

echo -e "\nawk associative array — xếp hạng lương:"
awk -F',' '
    NR > 1 {
        if ($4 >= 100000) grade="A"
        else if ($4 >= 80000) grade="B"
        else grade="C"
        print "  " $2 ": grade " grade " ($" $4 ")"
    }
' "$TMPDIR/employees.csv"

# ----------------------------------------------------------
# 6. CÁC CÔNG CỤ BỔ SUNG
# ----------------------------------------------------------
echo -e "\n--- 6. CÁC CÔNG CỤ BỔ SUNG ---"

echo "cut — lấy field cụ thể:"
tail -n +2 "$TMPDIR/employees.csv" | cut -d',' -f2 | tr '\n' ' '
echo ""

echo -e "\nsort — sắp xếp theo lương (cột 4, giảm dần):"
tail -n +2 "$TMPDIR/employees.csv" | sort -t',' -k4 -rn | head -5

echo -e "\nuniq -c — đếm occurrences (sau sort):"
tail -n +2 "$TMPDIR/employees.csv" | cut -d',' -f3 | sort | uniq -c

echo -e "\ntr — chuyển chữ thường → HOA:"
echo "hello bash world" | tr '[:lower:]' '[:upper:]'

echo -e "\ntr -s — squeeze khoảng trắng:"
echo "hello    world     bash" | tr -s ' '

echo -e "\ntr -d — xóa ký tự số:"
echo "abc123def456" | tr -d '0-9'

echo -e "\nwc — đếm dòng, từ, byte:"
wc "$TMPDIR/employees.csv"

echo -e "\nxargs — tạo file từ danh sách:"
echo "a.txt b.txt c.txt" | xargs -I{} touch "$TMPDIR/{}"
ls "$TMPDIR/"*.txt 2>/dev/null | xargs -I{} basename "{}" | tr '\n' ' '
echo ""

echo -e "\nxargs -n — chia thành nhóm:"
echo "1 2 3 4 5 6" | xargs -n 2 echo "  Nhóm:"

echo -e "\n=========================================="
echo "  HOÀN THÀNH BÀI 5!"
echo "=========================================="
echo "Temp files cleaned up by trap EXIT"
