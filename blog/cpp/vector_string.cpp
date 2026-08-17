#include <iostream>
#include <string>
#include <vector>

int main() {
    // ===== std::string =====
    std::string siteName = "js-tools.org";
    std::string message = "Hoc C++ hien dai tai " + siteName;

    message.append(" - series hoan toan mien phi!");
    std::cout << message << std::endl;
    std::cout << "Length: " << message.length() << std::endl;

    // ===== std::vector with reserve() =====
    std::vector<std::string> tools;
    tools.reserve(5);  // Allocate up front: no reallocation, no invalidated pointers

    tools.push_back("Image Optimizer");
    tools.push_back("SnapCast");
    tools.push_back("ColorQuarium");

    std::cout << "\nTool list:" << std::endl;
    for (const auto& tool : tools) {
        std::cout << "- " << tool << std::endl;
    }

    // ===== insert() =====
    tools.insert(tools.begin() + 1, "QR Generator");

    std::cout << "\nAfter insert (size/capacity): "
              << tools.size() << "/" << tools.capacity() << std::endl;

    // ===== Move semantics =====
    std::vector<std::string> tools2 = std::move(tools);
    std::cout << "tools  size after move: " << tools.size() << std::endl;
    std::cout << "tools2 size after move: " << tools2.size() << std::endl;

    return 0;
}
