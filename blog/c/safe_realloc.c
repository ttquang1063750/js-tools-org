#include <stdio.h>
#include <stdlib.h>

int main() {
    int *arr = (int*) malloc(2 * sizeof(int));
    if (arr == NULL) {
        printf("Cap phat ban dau that bai!\n");
        return 1;
    }
    arr[0] = 10;
    arr[1] = 20;

    printf("Mang ban dau: arr[0]=%d, arr[1]=%d\n", arr[0], arr[1]);

    // Yeu cau thay doi kich thuoc an toan qua con tro tam 'temp'
    int *temp = (int*) realloc(arr, 1000 * sizeof(int));
    
    if (temp == NULL) {
        // realloc that bai! Nhung vung nho cu cua 'arr' van an toan.
        printf("Khong the mo rong bo nho! Giai phong mang cu va thoat.\n");
        free(arr);
        return 1;
    }
    
    // Neu thanh cong, moi gan lai dia chi cho arr
    arr = temp;
    arr[999] = 9990;
    
    printf("Mo rong mang thanh cong, arr[999] = %d\n", arr[999]);
    
    // Thu don bo nho
    free(arr);
    arr = NULL;
    
    return 0;
}
