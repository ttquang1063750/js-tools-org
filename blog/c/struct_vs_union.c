#include <stdio.h>

// 1. Struct co Memory Padding (Tu dong dem do kieu du lieu lon nhat la double)
typedef struct {
    char a;      // 1 byte
    // padding 7 bytes
    double b;    // 8 bytes
    int c;       // 4 bytes
    // padding 4 bytes
} PaddedStruct;  // Tong: 24 bytes

// 2. Struct duoc toi uu bang cach sap xep thu tu giam dan cua kich thuoc thanh vien
typedef struct {
    double b;    // 8 bytes
    int c;       // 4 bytes
    char a;      // 1 byte
    // padding 3 bytes
} OptimizedStruct; // Tong: 16 bytes

// 3. Struct su dung #pragma pack(1) de tat hoan toan memory padding
#pragma pack(push, 1)
typedef struct {
    char a;      // 1 byte
    double b;    // 8 bytes
    int c;       // 4 bytes
} PackedStruct;   // Tong: 13 bytes
#pragma pack(pop)

// 4. Struct su dung Bit-fields de tiet kiem bo nho o cap do bit
typedef struct {
    unsigned int read : 1;    // 1 bit
    unsigned int write : 1;   // 1 bit
    unsigned int execute : 1; // 1 bit
    unsigned int type : 4;    // 4 bits (max value = 15)
} FilePermissions;            // Duoc compiler map vao block unsigned int (4 bytes)

int main() {
    printf("--- Kiem tra Kich thuoc Struct tren RAM ---\n");
    printf("Kich thuoc PaddedStruct: %lu bytes (co dem)\n", sizeof(PaddedStruct));
    printf("Kich thuoc OptimizedStruct (da sap xep lai): %lu bytes (tiet kiem 8 bytes)\n", sizeof(OptimizedStruct));
    printf("Kich thuoc PackedStruct (dung #pragma pack(1)): %lu bytes (dung 13 bytes thuc te)\n\n", sizeof(PackedStruct));
    
    // Kiem tra Bit-fields
    FilePermissions perm;
    perm.read = 1;
    perm.write = 0;
    perm.execute = 1;
    perm.type = 7;
    
    printf("Kich thuoc Struct su dung Bit-fields: %lu bytes\n", sizeof(perm));
    printf("Gia tri permissions: Read=%u, Write=%u, Execute=%u, Type=%u\n", 
           perm.read, perm.write, perm.execute, perm.type);
           
    return 0;
}
