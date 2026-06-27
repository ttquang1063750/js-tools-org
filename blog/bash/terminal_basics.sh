#!/bin/bash
# Bài 1: Làm Quen Terminal — Filesystem, Lệnh Cơ Bản & Permissions
# Chạy: chmod +x terminal_basics.sh && ./terminal_basics.sh

echo "=== Bài 1: Terminal Basics ==="

# --- Điều hướng Filesystem ---
echo -e "\n📁 Thư mục hiện tại:"
pwd

echo -e "\n📁 Nội dung thư mục:"
ls -la

# Tạo cấu trúc thư mục demo
echo -e "\n📁 Tạo cấu trúc thư mục demo..."
mkdir -p demo_project/{src,docs,tests}
touch demo_project/src/main.sh
touch demo_project/docs/README.md
touch demo_project/tests/test_main.sh

echo "Cấu trúc đã tạo:"
ls -R demo_project/

# --- Quản lý file ---
echo -e "\n📄 Copy & Move demo:"
cp demo_project/docs/README.md demo_project/docs/README_backup.md
mv demo_project/docs/README_backup.md demo_project/docs/CHANGELOG.md
ls demo_project/docs/

# --- Permissions ---
echo -e "\n🔒 Permissions demo:"
echo '#!/bin/bash' > demo_project/src/main.sh
echo 'echo "Hello from main.sh"' >> demo_project/src/main.sh

echo "Trước chmod:"
ls -l demo_project/src/main.sh

chmod 755 demo_project/src/main.sh
echo "Sau chmod 755:"
ls -l demo_project/src/main.sh

# Chạy script
./demo_project/src/main.sh

# Symlink demo
ln -sf demo_project/src/main.sh demo_project/run.sh
echo -e "\n🔗 Symlink:"
ls -l demo_project/run.sh

# Cleanup
rm -rf demo_project
echo -e "\n✅ Demo hoàn tất! (đã dọn dẹp demo_project/)"
