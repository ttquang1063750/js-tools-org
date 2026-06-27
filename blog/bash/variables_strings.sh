#!/bin/bash
# Bài 2: Biến, Chuỗi & Mảng — Variables, Strings & Arrays
# Chạy: chmod +x variables_strings.sh && ./variables_strings.sh

echo "=== Bài 2: Variables, Strings & Arrays ==="

# --- Khai báo biến ---
echo -e "\n--- Khai báo biến ---"
name="Bash Learner"
readonly VERSION="1.0.0"
echo "name = $name"
echo "VERSION = $VERSION (readonly)"

# --- Single vs Double Quoting ---
echo -e "\n--- Single vs Double Quoting ---"
echo 'Single quotes: $name không được expand'
echo "Double quotes: $name được expand"
echo "Dùng escape: tên là \$name, giá trị là $name"

# --- Parameter Expansion ---
echo -e "\n--- Parameter Expansion ---"

# Default value
unset missing_var
echo "Default:    \${missing_var:-fallback} = ${missing_var:-fallback}"
echo "Assign:     \${missing_var:=assigned} = ${missing_var:=assigned}"
echo "Sau assign: missing_var = $missing_var"

# String length
greeting="Xin chào Bash!"
echo "Length:     \${#greeting} = ${#greeting}"

# Substring removal
filepath="/home/user/docs/report.tar.gz"
echo "Original:   $filepath"
echo "Remove prefix (shortest %%/):  ${filepath#*/}"
echo "Remove prefix (longest  ##*/): ${filepath##*/}"
echo "Remove suffix (shortest %%.):  ${filepath%.*}"
echo "Remove suffix (longest  ##.):  ${filepath%%.*}"

# Substitution
sentence="I love cats and cats love me"
echo "Replace first: ${sentence/cats/dogs}"
echo "Replace all:   ${sentence//cats/dogs}"

# Uppercase / lowercase (Bash 4+)
word="hElLo"
echo "Uppercase: ${word^^}"
echo "Lowercase: ${word,,}"
echo "Capitalize: ${word^}"

# --- Indexed Arrays ---
echo -e "\n--- Indexed Arrays ---"
fruits=("apple" "banana" "cherry" "date")
echo "All:     ${fruits[*]}"
echo "First:   ${fruits[0]}"
echo "Length:  ${#fruits[@]}"
echo "Slice:   ${fruits[*]:1:2}"

# Thêm phần tử
fruits+=("elderberry")
echo "After push: ${fruits[*]}"

# Lặp qua mảng
echo "Loop:"
for fruit in "${fruits[@]}"; do
    echo "  - $fruit"
done

# --- Associative Arrays ---
echo -e "\n--- Associative Arrays (declare -A) ---"
declare -A config
config[host]="localhost"
config[port]="5432"
config[db]="myapp"

echo "Host: ${config[host]}"
echo "Port: ${config[port]}"
echo "All keys:   ${!config[*]}"
echo "All values: ${config[*]}"

echo "Loop:"
for key in "${!config[@]}"; do
    echo "  $key = ${config[$key]}"
done

# --- Arithmetic ---
echo -e "\n--- Arithmetic \$(( )) ---"
a=15
b=4
echo "$a + $b = $(( a + b ))"
echo "$a - $b = $(( a - b ))"
echo "$a * $b = $(( a * b ))"
echo "$a / $b = $(( a / b ))  (integer division)"
echo "$a % $b = $(( a % b ))  (modulo)"
echo "$a ** 2 = $(( a ** 2 )) (exponent)"

# Increment
counter=0
(( counter++ ))
(( counter += 5 ))
echo "Counter after ++ and +=5: $counter"

# Ternary-style
max=$(( a > b ? a : b ))
echo "Max($a, $b) = $max"

echo -e "\n✅ Demo hoàn tất!"
