#include <iostream>
#include <string>

// Lớp giả lập một tài nguyên kết nối (Database/File) để minh họa cơ chế RAII
class ResourceConnection {
private:
    std::string resourceName;

public:
    // Constructor (Hàm khởi tạo) sử dụng Initializer List
    ResourceConnection(std::string name) : resourceName(name) {
        std::cout << "[Constructor] Da mo va cap phat tai nguyen: " << resourceName << std::endl;
    }

    // Destructor (Hàm hủy) - Tự động được gọi khi đối tượng ra khỏi scope
    ~ResourceConnection() {
        std::cout << "[Destructor] Tu dong giai phong tai nguyen: " << resourceName << std::endl;
    }

    void executeQuery(std::string query) {
        std::cout << "Dang thuc thi truy van tren [" << resourceName << "]: " << query << std::endl;
    }
};

int main() {
    std::cout << "--- Bat dau phan main ---" << std::endl;

    {
        // Khoi tao doi tuong trong mot khoi scope gioi han
        std::cout << "\nBuoc vao scope con:" << std::endl;
        ResourceConnection conn("V8_Memory_Pool");
        conn.executeQuery("SELECT * FROM JavaScript_AST");
        std::cout << "Chuan bi thoat khoi scope con..." << std::endl;
        // conn se tu dong bi huy tai day va destructor duoc goi giai phong bo nho/tai nguyen
    }

    std::cout << "\nDa thoat khoi scope con." << std::endl;
    std::cout << "--- Ket thuc phan main ---" << std::endl;
    return 0;
}
