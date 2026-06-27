/**
 * C++ Iterators categories, Adapter, and Invalidation Demo
 * File: iterators_demo.cpp
 * 
 * Mã nguồn minh họa chi tiết cách hoạt động và cạm bẫy khi sử dụng Iterators trong C++.
 * Biên dịch: `g++ -std=c++17 iterators_demo.cpp -o iterators_demo`
 */

#include <iostream>
#include <vector>
#include <list>
#include <algorithm>

void demoIteratorTraversal() {
    std::cout << "=== 1. DUYỆT CONTAINER BẰNG ITERATORS ===" << std::endl;
    
    std::list<int> numbers = {10, 20, 30, 40};
    
    // Khai báo iterator kiểu ghi đè và đọc
    std::list<int>::iterator it;
    std::cout << "Duyệt xuôi bằng Iterator: ";
    for (it = numbers.begin(); it != numbers.end(); ++it) {
        *it += 5; // Có thể thay đổi giá trị
        std::cout << *it << " ";
    }
    std::cout << std::endl;

    // Duyệt ngược bằng Reverse Iterator
    std::cout << "Duyệt ngược bằng Reverse Iterator: ";
    for (auto rit = numbers.rbegin(); rit != numbers.rend(); ++rit) {
        std::cout << *rit << " ";
    }
    std::cout << std::endl;
}

void demoIteratorInvalidation() {
    std::cout << "\n=== 2. HIỆN TƯỢNG VÔ HIỆU HÓA ITERATOR (INVALIDATION) ===" << std::endl;

    std::vector<int> vec = {1, 2, 3, 4};
    auto it = vec.begin() + 2; // Trỏ tới số 3
    std::cout << "Gia tri truoc khi chen: " << *it << std::endl;

    // Chèn phần tử mới vào vector
    // Việc chèn này có thể kích hoạt cấp phát lại bộ nhớ (reallocation) ở Heap của vector,
    // làm vô hiệu hóa (invalidate) toàn bộ các iterators và con trỏ đang trỏ vào vector cũ!
    vec.push_back(5);
    
    std::cout << "Cảnh báo: Truy cập iterator sau khi push_back có thể gây lỗi Undefined Behavior!" << std::endl;
    // std::cout << *it << std::endl; // Nguy hiểm!
}

// 3. Tự định nghĩa một Iterator đơn giản (Custom Iterator)
class SimpleRange {
private:
    int start;
    int end;
public:
    SimpleRange(int s, int e) : start(s), end(e) {}

    // Lớp Iterator cục bộ
    class Iterator {
    private:
        int current_val;
    public:
        Iterator(int val) : current_val(val) {}
        
        int operator*() const { return current_val; }
        
        Iterator& operator++() {
            current_val++;
            return *this;
        }
        
        bool operator!=(const Iterator& other) const {
            return current_val != other.current_val;
        }
    };

    Iterator begin() { return Iterator(start); }
    Iterator end() { return Iterator(end + 1); }
};

void demoCustomIterator() {
    std::cout << "\n=== 3. TỰ ĐỊNH NGHĨA CUSTOM ITERATOR ===" << std::endl;
    SimpleRange range(1, 5);
    
    std::cout << "Duyệt qua SimpleRange: ";
    // Trình biên dịch sẽ tự dịch vòng lặp range-based for này thành cuộc gọi tới .begin() và .end() của custom class!
    for (int val : range) {
        std::cout << val << " ";
    }
    std::cout << std::endl;
}

int main() {
    demoIteratorTraversal();
    demoIteratorInvalidation();
    demoCustomIterator();
    return 0;
}
