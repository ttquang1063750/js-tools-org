/**
 * C Functions and Recursion Demo
 * File: functions_recursion.c
 * 
 * Mã nguồn minh họa chi tiết về Call by Value vs Call by Reference và đệ quy Call Stack.
 * Biên dịch: `gcc functions_recursion.c -o functions_demo`
 */

#include <stdio.h>

// 1. Call by Value vs Call by Reference (Pointers)
void swapByValue(int a, int b) {
    int temp = a;
    a = b;
    b = temp;
    // a và b ở đây là hai bản sao trên stack frame của hàm, biến gốc ở main không đổi
}

void swapByReference(int* a, int* b) {
    int temp = *a;
    *a = *b;
    *b = temp;
    // Giải tham chiếu để thay đổi trực tiếp vùng nhớ của biến gốc ở main
}

void demoSwap() {
    printf("=== 1. CALL BY VALUE VS CALL BY REFERENCE ===\n");
    int x = 10;
    int y = 20;

    printf("Gia tri ban dau: x = %d, y = %d\n", x, y);

    // Thử swap by value
    swapByValue(x, y);
    printf("Sau khi swapByValue (copy): x = %d, y = %d\n", x, y);

    // Thử swap by reference (truyền địa chỉ)
    swapByReference(&x, &y);
    printf("Sau khi swapByReference (pointers): x = %d, y = %d\n", x, y);
}

// 2. Đệ quy có theo dõi chiều sâu của ngăn xếp cuộc gọi (Call Stack Depth)
int factorial(int n, int depth) {
    // In ra khoảng trắng thụt lề để trực quan hóa Call Stack
    for (int i = 0; i < depth; i++) {
        printf("  ");
    }
    printf("-> Gọi factorial(%d) tại Call Stack Depth: %d\n", n, depth);

    // Điều kiện dừng (Base Case)
    if (n <= 1) {
        for (int i = 0; i < depth; i++) {
            printf("  ");
        }
        printf("<- Trả về 1 (Base Case reached)\n");
        return 1;
    }

    // Bước đệ quy (Recursive Case)
    int result = n * factorial(n - 1, depth + 1);

    for (int i = 0; i < depth; i++) {
        printf("  ");
    }
    printf("<- Giải phóng Stack frame, trả về %d * factorial(%d) = %d\n", n, n - 1, result);

    return result;
}

void demoRecursion() {
    printf("\n=== 2. TRỰC QUAN HÓA HOẠT ĐỘNG CỦA ĐỆ QUY (CALL STACK) ===\n");
    int n = 4;
    printf("Bắt đầu tính giai thừa của %d:\n", n);
    int res = factorial(n, 0);
    printf("Kết quả giai thừa: %d! = %d\n", n, res);
}

int main() {
    demoSwap();
    demoRecursion();
    return 0;
}
