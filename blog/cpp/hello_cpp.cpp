#include <iostream>
#include <string>

// A namespace of our own
namespace Engine {
    void printV8Info() {
        // std::string is a safe, self-managing string type - unlike a raw C char array
        std::string engine = "Google V8";
        std::cout << engine << " is written mostly in C++, which is why it can run JS this fast!" << std::endl;
    }
}

int main() {
    // std::cout lives in namespace std, and writes to the terminal
    std::cout << "Welcome to the C++ series on js-tools.org!" << std::endl;

    // Call the function from namespace Engine
    Engine::printV8Info();

    return 0;
}
