#include <iostream>
#include <vector>
#include <string>
#include <algorithm>
#include <utility>

// 1. Class minh họa Move Semantics (Resource Stealing)
class DynamicBuffer {
private:
    size_t size;
    int* data;

public:
    // Constructor
    DynamicBuffer(size_t s) : size(s), data(new int[s]) {
        std::cout << "[Constructor] Cấp phát Heap tại " << data << " (" << size * sizeof(int) << " bytes)" << std::endl;
    }

    // Destructor
    ~DynamicBuffer() {
        if (data != nullptr) {
            std::cout << "[Destructor] Giải phóng Heap tại " << data << std::endl;
            delete[] data;
        } else {
            std::cout << "[Destructor] Bỏ qua (con trỏ nullptr - đã bị Move)" << std::endl;
        }
    }

    // Copy Constructor (Deep Copy)
    DynamicBuffer(const DynamicBuffer& other) : size(other.size), data(new int[other.size]) {
        std::copy(other.data, other.data + size, data);
        std::cout << "[Copy Constructor] Deep Copy Heap sang " << data << std::endl;
    }

    // Move Constructor (Shallow Copy & Steal)
    DynamicBuffer(DynamicBuffer&& other) noexcept : size(other.size), data(other.data) {
        other.data = nullptr; // Cướp quyền sở hữu con trỏ và triệt tiêu nguồn cũ
        other.size = 0;
        std::cout << "[Move Constructor] Cướp tài nguyên Heap từ " << data << std::endl;
    }
};

struct ToolConfig {
    std::string name;
    int latencyMs;
};

int main() {
    std::cout << "=== 1. TEST MOVE SEMANTICS ===" << std::endl;
    DynamicBuffer buf1(100);
    
    // Gọi Copy Constructor (Cấp phát thêm vùng nhớ mới)
    DynamicBuffer buf2 = buf1; 
    
    // Gọi Move Constructor (Không cấp phát mới, chuyển nhượng con trỏ cũ)
    DynamicBuffer buf3 = std::move(buf1); 

    std::cout << "\n=== 2. TEST LAMBDA UNDER THE HOOD ===" << std::endl;
    int valCounter = 10;
    int refCounter = 10;
    
    // Capture valCounter bằng sao chép (copy) và refCounter bằng tham chiếu (reference)
    // Dùng mutable để cho phép thay đổi bản copy valCounter bên trong Lambda object
    auto lambdaDemo = [valCounter, &refCounter](int increment) mutable {
        valCounter += increment;        // Chỉ thay đổi bản copy của closure object
        refCounter += increment;        // Thay đổi biến gốc bên ngoài qua tham chiếu
        std::cout << "[Inside Lambda] valCounter: " << valCounter << " | refCounter: " << refCounter << std::endl;
    };

    lambdaDemo(5);
    std::cout << "[Outside Lambda] valCounter gốc: " << valCounter << " (Không đổi) | refCounter gốc: " << refCounter << " (Đã đổi)" << std::endl;

    std::cout << "\n=== 3. TEST STRUCTURED BINDING (C++17) ===" << std::endl;
    std::vector<ToolConfig> tools = {
        {"Image Optimizer", 2},
        {"SnapCast", 15},
        {"Remove BG", 45}
    };

    // Unpack trực tiếp Struct bằng Structured Binding
    for (const auto& [name, latency] : tools) {
        std::cout << "- " << name << " phản hồi trong " << latency << " ms." << std::endl;
    }

    return 0;
}
