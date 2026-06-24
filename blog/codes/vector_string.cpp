#include <iostream>
#include <vector>
#include <string>

int main() {
    // 1. Sử dụng std::string (SSO kích hoạt do siteName ngắn)
    std::string siteName = "js-tools.org";
    std::string message = "Học C++ hiện đại tại " + siteName;
    std::cout << message << " | Do dai chuoi: " << message.length() << std::endl;

    // 2. Sử dụng std::vector (mảng động tự co giãn)
    std::vector<std::string> tools;
    
    // Tối ưu hóa: đặt trước dung lượng để tránh Pointer Invalidation
    tools.reserve(5);
    
    // Thêm các phần tử vào cuối vector
    tools.push_back("Image Optimizer");
    tools.push_back("SnapCast");
    tools.push_back("ColorQuarium");

    std::cout << "\nDanh sach cong cu hien co tren he thong:" << std::endl;
    
    // 3. Duyệt mảng bằng Range-based for loop & từ khóa auto
    for (const auto& tool : tools) {
        std::cout << "- " << tool << std::endl;
    }

    // Kiểm tra kích thước và dung lượng thực tế
    std::cout << "Tong so phan tu (size): " << tools.size() << std::endl;
    std::cout << "Dung luong thuc te (capacity): " << tools.capacity() << std::endl;

    return 0;
}
