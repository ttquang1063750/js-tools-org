#include <stdio.h>
#include <stdint.h>

// 1. Kiem tra Endianness cua he thong tai thoi diem chay
void check_endianness() {
    uint32_t num = 0x01020304;
    uint8_t *ptr = (uint8_t*)&num;
    
    printf("--- Kiem tra Endianness ---\n");
    printf("Gia tri 32-bit: 0x01020304\n");
    printf("Dia chi bat dau: %p\n", (void*)ptr);
    printf("Lay theo tung byte tren RAM:\n");
    for (int i = 0; i < 4; i++) {
        printf("  Byte tai offset +%d (dia chi %p): 0x%02x\n", i, (void*)(ptr + i), ptr[i]);
    }
    
    if (ptr[0] == 0x04) {
        printf("Ket qua: He thong la Little Endian (Byte thap luu truoc)\n\n");
    } else if (ptr[0] == 0x01) {
        printf("Ket qua: He thong la Big Endian (Byte cao luu truoc)\n\n");
    } else {
        printf("Ket qua: Endianness khong xac dinh\n\n");
    }
}

// 2. Kiem tra so chan le (Parity check) dung bitwise
void check_parity(int n) {
    if ((n & 1) == 0) {
        printf("So %d la so CHAN (bit cuoi cung bang 0)\n", n);
    } else {
        printf("So %d la so LE (bit cuoi cung bang 1)\n", n);
    }
}

// 3. Xoa bit 1 cuoi cung (Clear lowest set bit)
int clear_lowest_set_bit(int x) {
    return x & (x - 1);
}

int main() {
    // 1. Kiem tra kien truc CPU Endianness
    check_endianness();
    
    // 2. Kiem tra chan le nhanh
    check_parity(75);
    check_parity(102);
    
    // 3. Xoa bit 1 cuoi cung (Ung dung trong thuat toan Brian Kernighan)
    int val = 12; // Nhi phan: 1100
    printf("\nGia tri ban dau: %d (nhi phan: 1100)\n", val);
    printf("Gia tri sau khi xoa bit 1 thap nhat (x & (x-1)): %d (nhi phan: 1000)\n", clear_lowest_set_bit(val));
    
    // 4. Nhan/chia nhanh bang dich bit
    int x = 10;
    printf("\nDich trai nhanh (x << 1): %d (tuong duong 10 * 2)\n", x << 1);
    printf("Dich phai nhanh (x >> 1): %d (tuong duong 10 / 2)\n", x >> 1);
    
    return 0;
}
