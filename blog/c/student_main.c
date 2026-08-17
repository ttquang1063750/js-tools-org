#include <stdio.h>
#include "student.h"

int main() {
    Student s = createStudent("nguyen van a", 20, 8.5);
    printStudent(s);
    return 0;
}
