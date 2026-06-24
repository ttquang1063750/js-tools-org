#!/bin/bash
# Bài 3: Điều Kiện & Vòng Lặp — Control Flow
# Chạy: chmod +x control_flow.sh && ./control_flow.sh

echo "=== Bài 3: Control Flow ==="

# --- Exit Codes ---
echo -e "\n--- Exit Codes (\$?) ---"
ls /tmp > /dev/null 2>&1
echo "ls /tmp exit code: $?"
ls /nonexistent_path 2> /dev/null
echo "ls /nonexistent exit code: $?"

# --- if / elif / else ---
echo -e "\n--- if / elif / else ---"
score=75

if [[ "$score" -ge 90 ]]; then
    echo "Score $score: Xuất sắc (A)"
elif [[ "$score" -ge 70 ]]; then
    echo "Score $score: Khá (B)"
elif [[ "$score" -ge 50 ]]; then
    echo "Score $score: Trung bình (C)"
else
    echo "Score $score: Không đạt (F)"
fi

# --- String Comparisons ---
echo -e "\n--- String Comparisons ---"
str1="hello"
str2="world"
str3=""

[[ "$str1" == "hello" ]] && echo "'$str1' == 'hello': true"
[[ "$str1" != "$str2" ]] && echo "'$str1' != '$str2': true"
[[ "$str1" < "$str2" ]]  && echo "'$str1' < '$str2' (alphabetical): true"
[[ -z "$str3" ]]          && echo "str3 is empty (-z): true"
[[ -n "$str1" ]]          && echo "str1 is not empty (-n): true"

# Regex match
email="user@example.com"
if [[ "$email" =~ ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ ]]; then
    echo "'$email' is a valid email format"
fi

# --- File Comparisons ---
echo -e "\n--- File Comparisons ---"
tmpfile=$(mktemp)
echo "test" > "$tmpfile"

[[ -f "$tmpfile" ]] && echo "$tmpfile exists (-f): true"
[[ -s "$tmpfile" ]] && echo "$tmpfile is non-empty (-s): true"
[[ -r "$tmpfile" ]] && echo "$tmpfile is readable (-r): true"
[[ -d "/tmp" ]]     && echo "/tmp is a directory (-d): true"
rm -f "$tmpfile"

# --- case Statement ---
echo -e "\n--- case Statement ---"
fruit="banana"
case "$fruit" in
    apple)
        echo "$fruit -> Táo"
        ;;
    banana|chuối)
        echo "$fruit -> Chuối"
        ;;
    cherry)
        echo "$fruit -> Anh đào"
        ;;
    *)
        echo "$fruit -> Không biết"
        ;;
esac

# --- for Loop: List ---
echo -e "\n--- for Loop: List ---"
for color in red green blue; do
    echo "  Color: $color"
done

# --- for Loop: Range ---
echo -e "\n--- for Loop: Range {start..end..step} ---"
echo -n "  "
for i in {1..10..2}; do
    echo -n "$i "
done
echo ""

# --- for Loop: C-style ---
echo -e "\n--- for Loop: C-style ---"
echo -n "  "
for (( i = 0; i < 5; i++ )); do
    echo -n "$i "
done
echo ""

# --- while read line ---
echo -e "\n--- while read line ---"
csv_data="Alice,30,Engineer
Bob,25,Designer
Charlie,35,Manager"

echo "$csv_data" | while IFS=',' read -r name age role; do
    printf "  %-10s tuổi %-3s nghề %s\n" "$name" "$age" "$role"
done

# --- until Loop ---
echo -e "\n--- until Loop ---"
count=1
until [[ "$count" -gt 5 ]]; do
    echo -n "  $count"
    (( count++ ))
done
echo ""

# --- break / continue ---
echo -e "\n--- break / continue ---"
echo -n "  Skip even, stop at 9: "
for i in {1..20}; do
    [[ $(( i % 2 )) -eq 0 ]] && continue
    [[ "$i" -gt 9 ]] && break
    echo -n "$i "
done
echo ""

echo -e "\n✅ Demo hoàn tất!"
