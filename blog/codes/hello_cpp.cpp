#include <iostream>
#include <string>

// Ví dụ về namespace tự định nghĩa
namespace Engine {
    void printV8Info() {
        std::cout << "Google V8 JavaScript Engine được viết chủ yếu bằng C++ để biên dịch và chạy JS cực nhanh!" << std::endl;
    }
}

int main() {
    // std::cout nằm trong namespace std để ghi dữ liệu ra terminal
    std::cout << "Chào mừng bạn đến với chuỗi học lập trình C++ từ js-tools.org!" << std::endl;
    
    // Gọi hàm từ namespace Engine
    Engine::printV8Info();
    
    return 0;
}
