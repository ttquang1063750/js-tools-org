/**
 * C++ STL Containers Comparative Demo
 * File: containers_demo.cpp
 * 
 * Mã nguồn minh họa chi tiết cách sử dụng và so sánh hiệu năng các loại Containers trong STL.
 * Biên dịch: `g++ -std=c++17 containers_demo.cpp -o containers_demo`
 */

#include <iostream>
#include <vector>
#include <deque>
#include <list>
#include <map>
#include <unordered_map>
#include <chrono>

void demoSequenceContainers() {
    std::cout << "=== 1. SEQUENCE CONTAINERS (DÃY TUẦN TỰ) ===" << std::endl;

    // 1. std::vector: Phân bố liên tục trên RAM, tốt nhất cho đọc chỉ số ngẫu nhiên O(1)
    std::vector<int> vec = {10, 20, 30};
    vec.push_back(40); // O(1) trung bình
    std::cout << "Vector element index 2: " << vec[2] << std::endl;

    // 2. std::deque: Phân bố theo các block nhớ, chèn hai đầu (front/back) cực nhanh O(1)
    std::deque<int> deq = {20, 30};
    deq.push_front(10); // O(1)
    deq.push_back(40);  // O(1)
    std::cout << "Deque front: " << deq.front() << ", back: " << deq.back() << std::endl;

    // 3. std::list: Danh sách liên kết đôi (Doubly Linked List), chèn/xóa ở bất kỳ vị trí nào cực nhanh O(1)
    // khi đã có con trỏ, không hỗ trợ truy cập ngẫu nhiên index [i].
    std::list<int> lst = {10, 20, 30};
    auto it = lst.begin();
    std::advance(it, 1); // Trỏ tới phần tử thứ 2
    lst.insert(it, 15);  // O(1) chèn số 15
    std::cout << "List elements: ";
    for (int n : lst) std::cout << n << " ";
    std::cout << std::endl;
}

void demoAssociativeContainers() {
    std::cout << "\n=== 2. ASSOCIATIVE CONTAINERS (ÁNH XẠ & TÌM KIẾM) ===" << std::endl;

    // 1. std::map: Cấu trúc cây đỏ đen (Red-Black Tree), các khóa luôn tự động được sắp xếp, tìm kiếm O(log N)
    std::map<std::string, int> ageMap;
    ageMap["Quang"] = 28;
    ageMap["Alex"] = 25;
    ageMap["Sophia"] = 30;

    std::cout << "std::map (Tự động sắp xếp khóa theo bảng chữ cái):" << std::endl;
    for (const auto& pair : ageMap) {
        std::cout << "- " << pair.first << ": " << pair.second << " tuoi" << std::endl;
    }

    // 2. std::unordered_map: Bảng băm (Hash Table), tìm kiếm cực nhanh O(1) trung bình, không sắp xếp
    std::unordered_map<std::string, int> ageHashMap;
    ageHashMap["Quang"] = 28;
    ageHashMap["Alex"] = 25;
    ageHashMap["Sophia"] = 30;

    std::cout << "\nstd::unordered_map (Không sắp xếp, tối ưu tốc độ tìm kiếm):" << std::endl;
    for (const auto& pair : ageHashMap) {
        std::cout << "- " << pair.first << ": " << pair.second << " tuoi" << std::endl;
    }
}

int main() {
    demoSequenceContainers();
    demoAssociativeContainers();
    return 0;
}
