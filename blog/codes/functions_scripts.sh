#!/bin/bash
# Bài 4: Hàm & Cấu Trúc Script — Functions & Script Structure
# Chạy: chmod +x functions_scripts.sh && ./functions_scripts.sh

set -euo pipefail

echo "=== Bài 4: Functions & Script Structure ==="

# --- Function cơ bản ---
echo -e "\n--- Function cơ bản ---"
greet() {
    echo "Xin chào, $1! Bạn đang học Bash."
}
greet "Quang"
greet "World"

# --- local Variables ---
echo -e "\n--- local Variables ---"
outer_var="global"

demo_scope() {
    local outer_var="local inside function"
    local inner_var="only here"
    echo "  Inside function: outer_var=$outer_var"
    echo "  Inside function: inner_var=$inner_var"
}

demo_scope
echo "  Outside function: outer_var=$outer_var"
echo "  Outside function: inner_var is ${inner_var:-not defined}"

# --- return vs exit ---
echo -e "\n--- return vs exit ---"
is_even() {
    if (( $1 % 2 == 0 )); then
        return 0  # success = true
    else
        return 1  # failure = false
    fi
}

for n in 3 4 7 10; do
    if is_even "$n"; then
        echo "  $n is even"
    else
        echo "  $n is odd"
    fi
done

# --- $1, $@, $#, shift ---
echo -e "\n--- \$1, \$@, \$#, shift ---"
show_args() {
    echo "  Total args (\$#): $#"
    echo "  First arg (\$1):  ${1:-none}"
    echo "  All args (\$@):   $*"

    echo "  Shifting through args:"
    while [[ $# -gt 0 ]]; do
        echo "    -> $1"
        shift
    done
}
show_args "alpha" "beta" "gamma"

# --- getopts Parsing ---
echo -e "\n--- getopts Parsing ---"
process_opts() {
    local file=""
    local output=""
    local verbose=false
    local OPTIND=1

    while getopts "f:o:v" opt; do
        case "$opt" in
            f) file="$OPTARG" ;;
            o) output="$OPTARG" ;;
            v) verbose=true ;;
            *) echo "Usage: process_opts -f FILE [-o OUTPUT] [-v]"; return 1 ;;
        esac
    done
    shift $(( OPTIND - 1 ))

    echo "  file=$file"
    echo "  output=$output"
    echo "  verbose=$verbose"
    echo "  remaining args: $*"
}

process_opts -f input.txt -o result.csv -v extra1 extra2

# --- Template Script Structure ---
echo -e "\n--- Template Script Structure ---"
echo "(Mô phỏng cấu trúc script production-ready)"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPT_NAME="$(basename "$0")"
TMPDIR_CUSTOM=$(mktemp -d)

# Cleanup trap
cleanup() {
    echo "  [cleanup] Dọn dẹp temp dir: $TMPDIR_CUSTOM"
    rm -rf "$TMPDIR_CUSTOM"
}
trap cleanup EXIT

# Usage function
usage() {
    cat <<EOF
Usage: $SCRIPT_NAME [OPTIONS] <input>

Options:
  -f FILE    Input file
  -o FILE    Output file (default: stdout)
  -v         Verbose mode
  -h         Show this help

Example:
  $SCRIPT_NAME -f data.csv -o report.txt -v
EOF
}

echo "  Script dir:  $SCRIPT_DIR"
echo "  Script name: $SCRIPT_NAME"
echo "  Temp dir:    $TMPDIR_CUSTOM"

# Demo trap: tạo file tạm
echo "test data" > "$TMPDIR_CUSTOM/workfile.txt"
echo "  Created temp file: $TMPDIR_CUSTOM/workfile.txt"
echo "  (trap EXIT sẽ tự động cleanup khi script kết thúc)"

# --- set -euo pipefail explained ---
echo -e "\n--- set -euo pipefail ---"
echo "  set -e : exit ngay khi có lệnh thất bại"
echo "  set -u : exit khi dùng biến chưa khai báo"
echo "  set -o pipefail : pipeline fail nếu bất kỳ lệnh nào fail"

echo -e "\n✅ Demo hoàn tất! (trap sẽ cleanup temp dir)"
