/**
 * C Multifile Compilation & Preprocessor Demo
 * File: multifile_demo.c
 * 
 * Mã nguồn tự chứa (Self-contained) giải thích chi tiết cấu trúc Dự án nhiều file nguồn (Multifile)
 * và cơ chế hoạt động của Bộ tiền xử lý (Preprocessor) trong C.
 * Biên dịch: `gcc multifile_demo.c -o multifile_demo`
 */

#include <stdio.h>

// ==========================================
// 1. GIAI ĐOẠN TIỀN XỬ LÝ (PREPROCESSOR DIRETIVES)
// ==========================================

// Định nghĩa macro hằng số
#define MAX_BUFFER_SIZE 1024

// Định nghĩa macro hàm (inline macro)
#define SQUARE(x) ((x) * (x))

// Sử dụng cờ biên dịch có điều kiện (Conditional Compilation)
#define DEBUG_MODE 1

void demoPreprocessor() {
    printf("=== 1. KIỂM TRÌNH BỘ TIỀN XỬ LÝ (PREPROCESSOR) ===\n");
    printf("Kích thước Buffer tối đa: %d\n", MAX_BUFFER_SIZE);
    
    int val = 9;
    printf("Bình phương của %d sử dụng macro: SQUARE(%d) = %d\n", val, val, SQUARE(val));

#if DEBUG_MODE
    printf("[DEBUG] Log này chỉ được in ra khi DEBUG_MODE = 1\n");
#endif
}

// ==========================================
// 2. GIẢ LẬP DỰ ÁN NHIỀU FILE NGUỒN (MULTIFILE STRUCTURE)
// ==========================================

/* 
 * Trong thực tế, dự án lớn sẽ được chia nhỏ:
 * 
 * --- FILE: math_utils.h ---
 * #ifndef MATH_UTILS_H    // Header Guards ngăn ngừa lỗi nạp trùng lặp thư viện
 * #define MATH_UTILS_H
 * 
 * int add(int a, int b);  // Chỉ chứa khai báo nguyên mẫu hàm (Prototype Declaration)
 * 
 * #endif
 * 
 * --- FILE: math_utils.c ---
 * #include "math_utils.h"
 * int add(int a, int b) { // Định nghĩa chi tiết hàm (Function Definition)
 *     return a + b;
 * }
 * 
 * --- FILE: main.c ---
 * #include <stdio.h>
 * #include "math_utils.h" // Nhập khai báo của các hàm dùng chung
 * int main() {
 *     printf("Sum: %d", add(5, 7));
 * }
 * 
 * Biên dịch đa file: `gcc main.c math_utils.c -o main_app`
 */

// Định nghĩa trực tiếp trong file demo này để người dùng có thể chạy được ngay
int add(int a, int b) {
    return a + b;
}

void demoMultifileConcept() {
    printf("\n=== 2. MÔ PHỎNG DỰ ÁN NHIỀU FILE (MULTIFILE PROJECT) ===\n");
    printf("Kêu gọi hàm add(15, 25) giả lập định nghĩa từ math_utils.c: %d\n", add(15, 25));
    printf("Cách biên dịch dự án đa file: `gcc main.c math_utils.c -o app`\n");
}

int main() {
    demoPreprocessor();
    demoMultifileConcept();
    return 0;
}
