#include <stdio.h>
#include <math.h>

int main() {
    int n;
    printf("Nhap vao mot so nguyen: ");
    scanf("%d", &n);

    if (n < 2) {
        printf("%d khong phai la so nguyen to\n", n);
        return 0;
    }

    int isPrime = 1; // 1 nghia la dung, 0 nghia la sai
    
    // Lap tu 2 den can bac hai cua n de kiem tra chia het
    for (int i = 2; i <= sqrt(n); i++) {
        if (n % i == 0) {
            isPrime = 0; // Co uoc so khac -> khong phai so nguyen to
            break;       // Ngat luong lap
        }
    }

    if (isPrime == 1) {
        printf("%d la so nguyen to\n", n);
    } else {
        printf("%d khong phai la so nguyen to\n", n);
    }

    return 0;
}
