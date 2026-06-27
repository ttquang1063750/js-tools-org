/**
 * C Arrays and Strings Demo
 * File: arrays_strings.c
 * 
 * Mã nguồn minh họa chi tiết về mảng, số học con trỏ, chuỗi và các hàm xử lý an toàn.
 * Biên dịch: `gcc arrays_strings.c -o arrays_demo`
 */

#include <stdio.h>
#include <string.h>

void demoPointerArithmetic() {
    printf("=== 1. SỐ HỌC CON TRỎ TRÊN MẢNG (POINTER ARITHMETIC) ===\n");
    int arr[5] = {10, 20, 30, 40, 50};
    
    // Tên mảng bản chất là con trỏ hằng trỏ tới phần tử đầu tiên
    int* ptr = arr; 

    printf("Địa chỉ arr[0]: %p, Giá trị: %d\n", (void*)ptr, *ptr);
    
    // Tăng con trỏ lên 1 đơn vị thực chất là tăng địa chỉ thêm sizeof(int) = 4 bytes!
    ptr++;
    printf("Địa chỉ arr[1] (sau ptr++): %p, Giá trị: %d\n", (void*)ptr, *ptr);

    // Truy cập phần tử qua toán tử con trỏ: *(arr + i) tương đương arr[i]
    for (int i = 0; i < 5; i++) {
        printf("Phần tử thứ %d: arr[%d] = %d, *(arr + %d) = %d\n", i, i, arr[i], i, *(arr + i));
    }
}

void demoStringNullTerminator() {
    printf("\n=== 2. CHUỖI & KÝ TỰ KẾT THÚC RỖNG (NULL TERMINATOR '\\0') ===\n");

    // Chuỗi trong C là mảng ký tự kết thúc bằng '\0'
    char myStr[] = "Hello"; // Tự động thêm '\0' ở cuối, độ dài mảng là 6

    printf("Độ dài mảng myStr: %zu (bytes)\n", sizeof(myStr));
    printf("Độ dài thực tế của chuỗi (strlen): %zu\n", strlen(myStr));

    // Sức mạnh của '\0': Nếu ta cố tình chèn '\0' vào giữa chuỗi
    myStr[2] = '\0';
    printf("Chuỗi sau khi chèn '\\0' vào vị trí index 2: \"%s\"\n", myStr);
    printf("strlen mới: %zu\n", strlen(myStr));
}

void demoSafeStringOperations() {
    printf("\n=== 3. XỬ LÝ CHUỖI AN TOÀN TRONG C ===\n");
    char dest[20] = "Base-";
    char src[] = "DataInputOverflowAlert";

    // Nguy hiểm (Gây lỗi Buffer Overflow vì src dài hơn vùng chứa dest):
    // strcpy(dest, src);

    // Giải pháp phòng thủ: Sử dụng strncpy chỉ định kích thước buffer tối đa
    // Trừ đi 1 để luôn chừa chỗ cho ký tự kết thúc '\0'
    strncpy(dest, src, sizeof(dest) - 1);
    dest[sizeof(dest) - 1] = '\0'; // Ép buộc có ký tự kết thúc đề phòng buffer bị tràn đầy

    printf("Chuỗi đích sau khi strncpy an toàn: \"%s\" (Kích thước mảng: %zu)\n", dest, sizeof(dest));
}

int main() {
    demoPointerArithmetic();
    demoStringNullTerminator();
    demoSafeStringOperations();
    return 0;
}
