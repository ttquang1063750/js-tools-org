#include "student.h"
#include <string.h>

// Internal helper - only used inside this file
static void capitalize(char* str) {
    if (str[0] >= 'a' && str[0] <= 'z') {
        str[0] -= 32;
    }
}

Student createStudent(const char* name, int age, float gpa) {
    Student s;
    strncpy(s.name, name, 49);
    s.name[49] = '\0';
    capitalize(s.name);
    s.age = age;
    s.gpa = gpa;
    return s;
}

void printStudent(Student s) {
    printf("Name: %s | Age: %d | GPA: %.2f\n", s.name, s.age, s.gpa);
}
