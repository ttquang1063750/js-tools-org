#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

Node* createNode(int value) {
    Node *newNode = (Node*) malloc(sizeof(Node));
    newNode->data = value;
    newNode->next = NULL;
    return newNode;
}

void insertAtHead(Node **head, int value) {
    Node *newNode = createNode(value);
    newNode->next = *head;
    *head = newNode;
}

void printList(Node *head) {
    Node *temp = head;
    while (temp != NULL) {
        printf("%d -> ", temp->data);
        temp = temp->next;
    }
    printf("NULL\n");
}

int main() {
    Node *head = NULL;

    insertAtHead(&head, 30);
    insertAtHead(&head, 20);
    insertAtHead(&head, 10);

    printf("Linked list: ");
    printList(head);

    Node *temp;
    while (head != NULL) {
        temp = head;
        head = head->next;
        free(temp);
    }

    return 0;
}
