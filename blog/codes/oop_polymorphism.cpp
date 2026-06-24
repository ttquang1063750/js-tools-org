#include <iostream>
#include <vector>
#include <string>

// Lớp trừu tượng (Abstract Class) đóng vai trò là Interface
class JSCommand {
public:
    // Virtual destructor rất quan trọng khi su dung da hinh de huy dung doi tuong con
    virtual ~JSCommand() = default;

    // Pure virtual function (ham thuan ao)
    virtual void execute() = 0; 
};

// Lop ke thua 1
class ParseHTMLCommand : public JSCommand {
private:
    std::string filePath;
public:
    ParseHTMLCommand(std::string path) : filePath(path) {}

    // Su dung tu khoa override de trinh bien dich kiem tra tinh chinh xac
    void execute() override {
        std::cout << "[V8 Parser] Dang phan tich HTML file: " << filePath << std::endl;
    }
};

// Lop ke thua 2
class CompileJSCommand : public JSCommand {
private:
    std::string scriptSource;
public:
    CompileJSCommand(std::string src) : scriptSource(src) {}

    void execute() override {
        std::cout << "[V8 Compiler] Dang bien dich JS source (JIT): " << scriptSource << std::endl;
    }
};

int main() {
    // Tao danh sach cac con tro lop cha, tro den doi tuong lop con (Da hinh dong)
    std::vector<JSCommand*> pipeline;
    
    pipeline.push_back(new ParseHTMLCommand("index.html"));
    pipeline.push_back(new CompileJSCommand("console.log('Hello V8')"));

    std::cout << "--- Bat dau chay V8 Pipeline ---" << std::endl;
    for (auto* cmd : pipeline) {
        cmd->execute(); // Tinh da hinh thuc thi dung phuong thuc o lop con tai runtime
    }

    // Giai phong bo nho cap phat bang new
    for (auto* cmd : pipeline) {
        delete cmd;
    }
    pipeline.clear();

    return 0;
}
