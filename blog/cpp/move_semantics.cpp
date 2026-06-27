/**
 * C++ Move Semantics and RValue References Demo
 * File: move_semantics.cpp
 * 
 * Mã nguồn minh họa chi tiết về RValue References, Move Constructor, Move Assignment và tối ưu hóa RVO.
 * Biên dịch: `g++ -std=c++17 -fno-elide-constructors move_semantics.cpp -o move_demo`
 * (Sử dụng cờ -fno-elide-constructors để tắt cơ chế tối ưu RVO của Compiler giúp quan sát rõ Move Constructor)
 */

#include <iostream>
#include <utility>
#include <cstring>

class DynamicBuffer {
private:
    size_t size;
    char* data;
public:
    DynamicBuffer(size_t s) : size(s) {
        data = new char[size];
        std::strcpy(data, "Sample Data");
        std::cout << "[Constructor] Da phan bo bo nho o Heap." << std::endl;
    }

    ~DynamicBuffer() {
        delete[] data;
        std::cout << "[Destructor] Da giai phong bo nho o Heap." << std::endl;
    }

    // Copy Constructor (Sao chép sâu - Deep Copy)
    DynamicBuffer(const DynamicBuffer& other) : size(other.size) {
        data = new char[size];
        std::strcpy(data, other.data);
        std::cout << "[Copy Constructor] Deep Copy hoan tat." << std::endl;
    }

    // Move Constructor (Chuyển quyền sở hữu con trỏ - Resource Stealing)
    // Noexcept cực kỳ quan trọng để STL vector sử dụng nó khi reallocate!
    DynamicBuffer(DynamicBuffer&& other) noexcept : size(other.size), data(other.data) {
        other.size = 0;
        other.data = nullptr; // Đánh dấu null để destructor của đối tượng tạm không giải phóng vùng nhớ
        std::cout << "[Move Constructor] Cuop quyen so huu con tro o Heap (O(1))." << std::endl;
    }

    // Move Assignment Operator
    DynamicBuffer& operator=(DynamicBuffer&& other) noexcept {
        std::cout << "[Move Assignment] Cuop quyen tu assignment." << std::endl;
        if (this != &other) {
            delete[] data; // Giải phóng bộ nhớ hiện tại
            
            data = other.data; // Cướp địa chỉ con trỏ
            size = other.size;
            
            other.data = nullptr; // Reset đối tượng cũ
            other.size = 0;
        }
        return *this;
    }
};

DynamicBuffer createBuffer() {
    DynamicBuffer temp(100);
    return temp; // Kích hoạt Return Value Optimization (RVO) hoặc Move Constructor
}

int main() {
    std::cout << "=== 1. DEMO COPY VS MOVE CONSTRUCTOR ===" << std::endl;
    DynamicBuffer buf1(50);
    
    std::cout << "\nThực thi Copy (Sao chép sâu):" << std::endl;
    DynamicBuffer buf2 = buf1; // Kích hoạt Copy Constructor

    std::cout << "\nThực thi Move (Chuyển con trỏ) qua std::move:" << std::endl;
    // std::move ép kiểu buf1 từ Lvalue sang Rvalue reference để gọi Move Constructor
    DynamicBuffer buf3 = std::move(buf1); 

    std::cout << "\n=== 2. DEMO HÀM TRẢ VỀ ĐỐI TƯỢNG ===" << std::endl;
    DynamicBuffer buf4 = createBuffer();

    std::cout << "\n=== 3. CHƯƠNG TRÌNH KẾT THÚC ===" << std::endl;
    return 0;
}
