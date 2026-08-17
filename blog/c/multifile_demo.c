/**
 * C Multifile Compilation & Preprocessor Demo
 * File: multifile_demo.c
 *
 * A self-contained program showing what the preprocessor does and how a
 * multi-file project is structured. Everything lives in one file so it runs
 * straight away; the real three-file version is student.h / student.c /
 * student_main.c, downloadable from the same lesson.
 * Build: `gcc multifile_demo.c -o multifile_demo`
 */

#include <stdio.h>

// ==========================================
// 1. THE PREPROCESSOR STAGE (DIRECTIVES)
// ==========================================

// An object-like macro (a named constant)
#define MAX_BUFFER_SIZE 1024

// A function-like macro
#define SQUARE(x) ((x) * (x))

// A flag used for conditional compilation
#define DEBUG_MODE 1

void demoPreprocessor() {
    printf("=== 1. WHAT THE PREPROCESSOR DOES ===\n");
    printf("Maximum buffer size: %d\n", MAX_BUFFER_SIZE);

    int val = 9;
    printf("Square of %d through the macro: SQUARE(%d) = %d\n", val, val, SQUARE(val));

#if DEBUG_MODE
    printf("[DEBUG] This line is only compiled in when DEBUG_MODE = 1\n");
#endif
}

// ==========================================
// 2. SIMULATING A MULTI-FILE PROJECT
// ==========================================

/*
 * In a real project the code would be split up like this:
 *
 * --- FILE: math_utils.h ---
 * #ifndef MATH_UTILS_H    // Header guard: stops the file being loaded twice
 * #define MATH_UTILS_H
 *
 * int add(int a, int b);  // Prototype declaration only
 *
 * #endif
 *
 * --- FILE: math_utils.c ---
 * #include "math_utils.h"
 * int add(int a, int b) { // The actual function definition
 *     return a + b;
 * }
 *
 * --- FILE: main.c ---
 * #include <stdio.h>
 * #include "math_utils.h" // Pulls in the declarations, not the code
 * int main() {
 *     printf("Sum: %d", add(5, 7));
 * }
 *
 * Building it: `gcc main.c math_utils.c -o main_app`
 */

// Defined here directly so this demo file runs on its own
int add(int a, int b) {
    return a + b;
}

void demoMultifileConcept() {
    printf("\n=== 2. SIMULATING A MULTI-FILE PROJECT ===\n");
    printf("Calling add(15, 25), which would live in math_utils.c: %d\n", add(15, 25));
    printf("Building a multi-file project: `gcc main.c math_utils.c -o app`\n");
}

int main() {
    demoPreprocessor();
    demoMultifileConcept();
    return 0;
}
