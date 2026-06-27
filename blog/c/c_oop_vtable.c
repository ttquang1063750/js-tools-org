#include <stdio.h>

// 1. Dinh nghia vtable chua cac con tro ham (cac phuong thuc ao)
struct Shape;
struct ShapeVTable {
    void (*draw)(struct Shape *self);
    double (*area)(struct Shape *self);
};

// 2. Struct "Base class" Shape
struct Shape {
    struct ShapeVTable *vtable; // Con tro den bang vtable
};

// 3. Struct "Derived class" Circle ke thua Shape
struct Circle {
    struct Shape base; // Thuoc tinh base phai nam o dau tien de de dang ep kieu
    double radius;
};

// Trien khai cac phuong thuc thuc te cho Circle
void draw_circle(struct Shape *self) {
    // Upcast nguoc lai tu Shape* ve Circle*
    struct Circle *c = (struct Circle*)self;
    printf("Ve hinh tron voi ban kinh: %.2f\n", c->radius);
}

double area_circle(struct Shape *self) {
    struct Circle *c = (struct Circle*)self;
    return 3.14159265 * c->radius * c->radius;
}

// Khai bao bang vtable tinh cho Circle
struct ShapeVTable circle_vtable = {
    .draw = draw_circle,
    .area = area_circle
};

// Ham khoi tao doi tuong Circle
void init_circle(struct Circle *c, double r) {
    c->base.vtable = &circle_vtable; // Tro toi bang phuong thuc ao cua Circle
    c->radius = r;
}

int main() {
    struct Circle my_circle;
    init_circle(&my_circle, 5.0);

    // Dynamic Dispatch: Goi phuong thuc draw thong qua vtable
    struct Shape *shape_ptr = (struct Shape*)&my_circle;
    
    // Day chinh la cach compiler C++ goi phuong thuc ao tu bien con tro lop cha!
    shape_ptr->vtable->draw(shape_ptr); 
    printf("Dien tich: %.2f\n", shape_ptr->vtable->area(shape_ptr));

    return 0;
}
