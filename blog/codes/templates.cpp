#include <iostream>
#include <string>
#include <unordered_map>

// 1. Function Template (Ham tong quat hoa)
template <typename T>
T findMax(T a, T b) {
    return (a > b) ? a : b;
}

// 2. Class Template (Lop tong quat hoa)
template <typename K, typename V>
class SimpleCache {
private:
    std::unordered_map<K, V> cacheMap;
public:
    void put(K key, V val) {
        cacheMap[key] = val;
    }

    V get(K key) {
        if (cacheMap.find(key) != cacheMap.end()) {
            return cacheMap[key];
        }
        return V(); // Tra ve gia tri mac dinh cua kieu V
    }

    bool exists(K key) {
        return cacheMap.find(key) != cacheMap.end();
    }
};

int main() {
    // Test Function Template
    std::cout << "--- Demo Function Template ---" << std::endl;
    std::cout << "So lon hon giua 5 va 10: " << findMax(5, 10) << std::endl;
    std::cout << "So lon hon giua 3.14 va 2.71: " << findMax(3.14, 2.71) << std::endl;
    std::cout << "Chuoi lon hon: " << findMax(std::string("V8"), std::string("SpiderMonkey")) << std::endl;

    // Test Class Template
    std::cout << "\n--- Demo Class Template (Cache System) ---" << std::endl;
    SimpleCache<std::string, std::string> dnsCache;
    dnsCache.put("js-tools.org", "104.21.43.120");
    dnsCache.put("google.com", "142.250.190.46");

    std::string domain = "js-tools.org";
    if (dnsCache.exists(domain)) {
        std::cout << "IP cua " << domain << " la: " << dnsCache.get(domain) << std::endl;
    }

    return 0;
}
