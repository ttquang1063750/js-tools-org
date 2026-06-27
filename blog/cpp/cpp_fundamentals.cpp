/**
 * Modern C++ Fundamentals Demo
 * File: cpp_fundamentals.cpp
 * 
 * Mã nguồn minh họa chi tiết về References vs Pointers, Namespaces, và const correctness.
 * Biên dịch: `g++ -std=c++17 cpp_fundamentals.cpp -o cpp_fundamentals`
 */

#include <iostream>
#include <string>

// 1. Khai báo Namespaces để tránh xung đột tên ký hiệu
namespace EngineV8 {
    void printVersion() {
        std::cout << "[EngineV8] Phân hiệu V8: Phiên bản v12.4.2" << std::endl;
    }
}

namespace EngineSpidermonkey {
    void printVersion() {
        std::cout << "[EngineSpidermonkey] Phân hiệu SpiderMonkey: Phiên bản v115.0" << std::endl;
    }
}

// 2. Demo Pointers (*) vs References (&)
void modifyByPointer(int* ptr) {
    if (ptr != nullptr) {
        *ptr = *ptr * 2; // Cần giải tham chiếu (dereference) để sửa giá trị
    }
}

void modifyByReference(int& ref) {
    ref = ref * 2; // Thao tác trực tiếp như biến thường, an toàn vì không thể null
}

void demoPointersAndReferences() {
    std::cout << "\n=== 2. POINTERS (*) VS REFERENCES (&) ===" << std::endl;
    
    int val = 50;

    // Sử dụng Pointer
    modifyByPointer(&val);
    std::cout << "Gia tri sau khi modifyByPointer: " << val << std::endl;

    // Sử dụng Reference
    modifyByReference(val);
    std::cout << "Gia tri sau khi modifyByReference: " << val << std::endl;
}

// 3. Demo Const Correctness
void demoConstCorrectness() {
    std::cout << "\n=== 3. CONST CORRECTNESS (QUY CHẾ HẰNG SỐ) ===" << std::endl;

    int x = 10;
    int y = 20;

    // A. Con trỏ trỏ tới hằng số (Pointer to Const - Giá trị hằng, địa chỉ đổi được)
    const int* ptrToConst = &x;
    // *ptrToConst = 15; // Lỗi biên dịch: Không được sửa giá trị tại ô nhớ hằng!
    ptrToConst = &y;     // Hợp lệ: Được phép chuyển hướng trỏ sang địa chỉ khác.
    std::cout << "ptrToConst dang tro toi y, gia tri: " << *ptrToConst << std::endl;

    // B. Hằng con trỏ (Const Pointer - Địa chỉ hằng, giá trị đổi được)
    int* const constPtr = &x;
    *constPtr = 15;    // Hợp lệ: Được phép sửa giá trị tại ô nhớ trỏ tới.
    // constPtr = &y;  // Lỗi biên dịch: Không được phép thay đổi địa chỉ trỏ tới!
    std::cout << "constPtr dang tro toi x, gia tri x moi: " << x << std::endl;
}

int main() {
    std::cout << "=== 1. DEMO NAMESPACES ===" << std::endl;
    EngineV8::printVersion();
    EngineSpidermonkey::printVersion();

    demoPointersAndReferences();
    demoConstCorrectness();

    return 0;
}
