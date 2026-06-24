#include <stdio.h>
#include <stdlib.h>

int main() {
    int n = 5;
    // Cap phat mang dong co n phan tu int
    int *arr = (int*) malloc(n * sizeof(int));

    // Kiem tra NULL truoc khi su dung
    if (arr == NULL) {
        printf("Cap phat bo nho that bai!\n");
        return 1;
    }

    // Gan gia tri va in ra
    for (int i = 0; i < n; i++) {
        arr[i] = i * 10;
        printf("arr[%d] = %d\n", i, arr[i]);
    }

    // Giai phong bo nho sau khi dung
    free(arr);
    arr = NULL;

    return 0;
}
