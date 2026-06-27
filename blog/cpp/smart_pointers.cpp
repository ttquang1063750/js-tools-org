#include <iostream>
#include <memory>
#include <string>

class V8Context {
public:
    std::string name;
    V8Context(std::string n) : name(n) {
        std::cout << "[V8Context] Da khoi tao Context: " << name << std::endl;
    }
    ~V8Context() {
        std::cout << "[V8Context] Da giai phong Context: " << name << std::endl;
    }
    void runScript(std::string script) {
        std::cout << "[" << name << "] Chay script: " << script << std::endl;
    }
};

void demoUniquePtr() {
    std::cout << "\n--- Demo std::unique_ptr (So huu doc quyen) ---" << std::endl;
    // unique_ptr tu dong giai phong doi tuong khi bien di ra khoi scope
    std::unique_ptr<V8Context> ctx1 = std::make_unique<V8Context>("Isolated_Context_1");
    ctx1->runScript("let a = 10;");

    // Khong the copy unique_ptr (Dong nay se gay loi bien dich):
    // std::unique_ptr<V8Context> ctx2 = ctx1;

    // Chi co the chuyen quyen so huu (Move Ownership)
    std::unique_ptr<V8Context> ctx2 = std::move(ctx1);
    if (!ctx1) {
        std::cout << "ctx1 bay gio la nullptr (da chuyen quyen sang ctx2)." << std::endl;
    }
    ctx2->runScript("let b = 20;");
}

void demoSharedPtr() {
    std::cout << "\n--- Demo std::shared_ptr (Dong so huu) ---" << std::endl;
    std::shared_ptr<V8Context> sharedCtx1 = std::make_shared<V8Context>("Shared_Engine_Context");
    std::cout << "So luong nguoi so huu (Reference Count): " << sharedCtx1.use_count() << std::endl;

    {
        std::shared_ptr<V8Context> sharedCtx2 = sharedCtx1; // Copy duoc shared_ptr
        std::cout << "Copy thanh cong. So luong nguoi so huu: " << sharedCtx1.use_count() << std::endl;
        sharedCtx2->runScript("const pi = 3.14;");
        // Thoat khoi scope nay, sharedCtx2 bi huy nhung sharedCtx1 van giu doi tuong
    }
    
    std::cout << "Sau scope con. So luong nguoi so huu: " << sharedCtx1.use_count() << std::endl;
}

int main() {
    demoUniquePtr();
    demoSharedPtr();
    std::cout << "\n--- Ket thuc main (Cac Smart Pointer con lai tu dong thu hoi bo nho) ---" << std::endl;
    return 0;
}
