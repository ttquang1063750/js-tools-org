/**
 * C++ Exception Handling & RAII Exception Safety Demo
 * File: exception_handling.cpp
 * 
 * Mã nguồn minh họa chi tiết về ném/bắt ngoại lệ, cấu trúc Exception và an toàn bộ nhớ RAII.
 * Biên dịch: `g++ -std=c++17 exception_handling.cpp -o exception_demo`
 */

#include <iostream>
#include <string>
#include <exception>

// 1. Định nghĩa Ngoại lệ tùy biến kế thừa std::exception chuẩn
class OutOfMemoryException : public std::exception {
private:
    std::string message;
public:
    OutOfMemoryException(const std::string& msg) : message(msg) {}

    // Ghi đè hàm virtual const char* what() của lớp base std::exception
    virtual const char* what() const noexcept override {
        return message.c_str();
    }
};

// Lớp giả lập tài nguyên để kiểm chứng cơ chế giải phóng tự động (Stack Unwinding)
class FileHandler {
private:
    std::string filename;
public:
    FileHandler(std::string fn) : filename(fn) {
        std::cout << "[FileHandler] Da mo file: " << filename << std::endl;
    }
    ~FileHandler() {
        std::cout << "[FileHandler] Da tu dong dong file giai phong bo nho: " << filename << std::endl;
    }
};

void processData(int size) {
    FileHandler fh("app_data.log");

    if (size > 1000) {
        // Ném ngoại lệ tùy biến
        throw OutOfMemoryException("Yeu cau kich thuoc phan bo qua tai gioi han: " + std::to_string(size));
    }
    std::cout << "Xu ly thanh cong luong data kich thuoc: " << size << std::endl;
}

int main() {
    std::cout << "=== BẮT ĐẦU CHƯƠNG TRÌNH DEMO EXCEPTION ===" << std::endl;

    try {
        std::cout << "\n--- Test Case 1: Chạy bình thường ---" << std::endl;
        processData(500);

        std::cout << "\n--- Test Case 2: Kích hoạt Exception ---" << std::endl;
        processData(2000);
    } 
    catch (const OutOfMemoryException& e) {
        // Bắt ngoại lệ cụ thể
        std::cerr << "[Catch OutOfMemoryException] Loi: " << e.what() << std::endl;
    } 
    catch (const std::exception& e) {
        // Bắt các ngoại lệ chuẩn khác
        std::cerr << "[Catch Standard Exception] Loi: " << e.what() << std::endl;
    } 
    catch (...) {
        // Khối bắt tất cả các ngoại lệ còn lại (Catch-All)
        std::cerr << "[Catch-All] Bắt được ngoại lệ không xác định!" << std::endl;
    }

    std::cout << "\n=== CHƯƠNG TRÌNH KẾT THÚC AN TOÀN ===" << std::endl;
    return 0;
}
