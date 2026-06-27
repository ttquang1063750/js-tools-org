/**
 * C++ STL Algorithms and Functional Programming Demo
 * File: stl_algorithms_demo.cpp
 * 
 * Mã nguồn minh họa chi tiết cách sử dụng các thuật toán STL phổ biến trong C++.
 * Biên dịch: `g++ -std=c++17 stl_algorithms_demo.cpp -o stl_demo`
 */

#include <iostream>
#include <vector>
#include <algorithm>
#include <numeric>
#include <string>

struct Developer {
    std::string name;
    int experienceYears;
    std::string mainLanguage;
};

void demoSortingAndSearching() {
    std::cout << "=== 1. THUẬT TOÁN SẮP XẾP & TÌM KIẾM ===" << std::endl;
    
    std::vector<Developer> devs = {
        {"Quang", 5, "JS"},
        {"Alex", 3, "C++"},
        {"Sophia", 7, "Python"},
        {"Ben", 2, "Go"}
    };

    // 1. std::sort với lambda expression so sánh tùy biến
    std::sort(devs.begin(), devs.end(), [](const Developer& a, const Developer& b) {
        return a.experienceYears > b.experienceYears; // Sắp xếp giảm dần theo số năm kinh nghiệm
    });

    std::cout << "Danh sách sau khi sắp xếp kinh nghiệm (giảm dần):" << std::endl;
    for (const auto& dev : devs) {
        std::cout << "- " << dev.name << " (" << dev.experienceYears << " nam, " << dev.mainLanguage << ")" << std::endl;
    }

    // 2. std::find_if để tìm kiếm phần tử thỏa mãn điều kiện logic
    auto it = std::find_if(devs.begin(), devs.end(), [](const Developer& dev) {
        return dev.mainLanguage == "C++";
    });

    if (it != devs.end()) {
        std::cout << "\nTim thay lap trinh vien C++: " << it->name << std::endl;
    }
}

void demoTransformAndAccumulate() {
    std::cout << "\n=== 2. BIẾN ĐỔI DỮ LIỆU & TÍNH TỔNG TÍCH LŨY ===" << std::endl;

    std::vector<int> numbers = {1, 2, 3, 4, 5};

    // 1. std::transform (Biến đổi từng phần tử trong vector)
    std::vector<int> squares(numbers.size());
    std::transform(numbers.begin(), numbers.end(), squares.begin(), [](int n) {
        return n * n;
    });

    std::cout << "Bình phương các số: ";
    for (int sq : squares) {
        std::cout << sq << " ";
    }
    std::cout << std::endl;

    // 2. std::accumulate (Tính tổng tích lũy hoặc reduce)
    int sum = std::accumulate(numbers.begin(), numbers.end(), 0);
    int product = std::accumulate(numbers.begin(), numbers.end(), 1, std::multiplies<int>());

    std::cout << "Tong cac so: " << sum << std::endl;
    std::cout << "Tich cac so: " << product << std::endl;
}

int main() {
    demoSortingAndSearching();
    demoTransformAndAccumulate();
    return 0;
}
