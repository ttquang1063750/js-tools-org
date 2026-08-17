#ifndef STUDENT_H    // If STUDENT_H has not been defined yet...
#define STUDENT_H    // ...then define it right now

#include <stdio.h>

typedef struct {
    char name[50];
    int age;
    float gpa;
} Student;

// Function prototypes
void printStudent(Student s);
Student createStudent(const char* name, int age, float gpa);

#endif // STUDENT_H  // End of the guarded block
