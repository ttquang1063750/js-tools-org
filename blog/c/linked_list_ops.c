/**
 * The three operations the in-browser visualiser animates, written out in C:
 * insert at head, insert at tail, delete at head.
 * Build: `gcc -Wall -std=c11 linked_list_ops.c -o linked_list_ops`
 */

#include <stdio.h>
#include <stdlib.h>

typedef struct Node {
    int data;
    struct Node *next;
} Node;

static Node* createNode(int value) {
    Node *newNode = (Node*) malloc(sizeof(Node));
    if (newNode == NULL) {
        fprintf(stderr, "Out of memory\n");
        exit(1);
    }
    newNode->data = value;
    newNode->next = NULL;
    return newNode;
}

// Insert Head: O(1) - no traversal, only two pointer assignments
void insertAtHead(Node **head, int value) {
    Node *newNode = createNode(value);
    newNode->next = *head;   // The new node points at the old first node
    *head = newNode;         // head now points at the new node
}

// Insert Tail: O(N) - the whole list has to be walked to find the last node
void insertAtTail(Node **head, int value) {
    Node *newNode = createNode(value);
    if (*head == NULL) {     // An empty list: the new node becomes the head
        *head = newNode;
        return;
    }
    Node *cur = *head;
    while (cur->next != NULL) {  // Walk until the node whose next is NULL
        cur = cur->next;
    }
    cur->next = newNode;
}

// Delete Head: O(1) - keep the old head in temp so it can still be freed
void deleteHead(Node **head) {
    if (*head == NULL) {
        printf("The list is empty, nothing to delete\n");
        return;
    }
    Node *temp = *head;      // Remember the address before losing it
    *head = (*head)->next;   // Move head one node forward
    free(temp);              // Only now is it safe to release the old node
}

void printList(Node *head) {
    for (Node *cur = head; cur != NULL; cur = cur->next) {
        printf("%d -> ", cur->data);
    }
    printf("NULL\n");
}

void freeList(Node **head) {
    while (*head != NULL) {
        deleteHead(head);
    }
}

int main() {
    Node *head = NULL;

    insertAtHead(&head, 20);
    insertAtHead(&head, 10);
    printList(head);          // 10 -> 20 -> NULL

    insertAtTail(&head, 30);
    printList(head);          // 10 -> 20 -> 30 -> NULL

    deleteHead(&head);
    printList(head);          // 20 -> 30 -> NULL

    freeList(&head);
    printList(head);          // NULL

    return 0;
}
