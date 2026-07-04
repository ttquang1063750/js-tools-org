-- TechMart cho PostgreSQL (Docker lab) — cùng dữ liệu với sql-techmart-seed.sql
-- (bản SQLite dùng trong workbench trình duyệt), nhưng khai báo kiểu đúng chuẩn
-- PostgreSQL: SERIAL thay INTEGER PRIMARY KEY, BOOLEAN thật thay INTEGER 0/1,
-- DATE thật thay TEXT ISO-8601. Dùng cho lab Docker ở Bài 9, 11, 15, 16.
--
-- Chạy: psql -h localhost -U postgres -f sql-techmart-postgres-seed.sql

DROP TABLE IF EXISTS order_items;
DROP TABLE IF EXISTS orders;
DROP TABLE IF EXISTS products;
DROP TABLE IF EXISTS customers;

CREATE TABLE customers (
  customer_id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT,
  country TEXT,
  signup_date DATE,
  is_active BOOLEAN
);

CREATE TABLE products (
  product_id SERIAL PRIMARY KEY,
  product_name TEXT NOT NULL,
  category TEXT,
  unit_price NUMERIC(10, 2),
  stock_quantity INTEGER
);

CREATE TABLE orders (
  order_id SERIAL PRIMARY KEY,
  customer_id INTEGER REFERENCES customers (customer_id),
  order_date DATE,
  status TEXT,
  total_amount NUMERIC(10, 2)
);

CREATE TABLE order_items (
  order_item_id SERIAL PRIMARY KEY,
  order_id INTEGER REFERENCES orders (order_id),
  product_id INTEGER REFERENCES products (product_id),
  quantity INTEGER,
  unit_price NUMERIC(10, 2)
);

INSERT INTO
  customers (
    customer_id,
    full_name,
    email,
    country,
    signup_date,
    is_active
  )
VALUES
  (
    1,
    'Nguyễn Minh Anh',
    'minhanh.nguyen@gmail.com',
    'Vietnam',
    '2025-11-02',
    TRUE
  ),
  (
    2,
    'Trần Bảo Long',
    'longtb@yahoo.com',
    'Vietnam',
    '2025-11-15',
    TRUE
  ),
  (
    3,
    'Lê Thị Hương',
    'huong.le88@gmail.com',
    'Vietnam',
    '2025-12-01',
    TRUE
  ),
  (
    4,
    'Phạm Quốc Việt',
    'quocviet.pham@outlook.com',
    'Vietnam',
    '2025-12-10',
    FALSE
  ),
  (
    5,
    'Sarah Johnson',
    'sarah.j@gmail.com',
    'United States',
    '2026-01-05',
    TRUE
  ),
  (
    6,
    'Michael Chen',
    'mchen@company.com',
    'Singapore',
    '2026-01-12',
    TRUE
  ),
  (
    7,
    'Hoàng Thị Lan',
    'lanht@gmail.com',
    'Vietnam',
    '2026-01-20',
    TRUE
  ),
  (
    8,
    'David Kim',
    'dkim@sample.com',
    'South Korea',
    '2026-02-01',
    TRUE
  ),
  (
    9,
    'Vũ Đức Thắng',
    'thangvd@gmail.com',
    'Vietnam',
    '2026-02-14',
    FALSE
  ),
  (
    10,
    'Emma Wilson',
    'emma.wilson@gmail.com',
    'United Kingdom',
    '2026-02-20',
    TRUE
  ),
  (
    11,
    'Đặng Thu Trang',
    'trangdt@gmail.com',
    'Vietnam',
    '2026-03-01',
    TRUE
  ),
  (
    12,
    'James Anderson',
    'j.anderson@gmail.com',
    'Australia',
    '2026-03-10',
    TRUE
  );

INSERT INTO
  products (
    product_id,
    product_name,
    category,
    unit_price,
    stock_quantity
  )
VALUES
  (1, 'Wireless Mouse', 'Accessories', 15.99, 150),
  (2, 'Mechanical Keyboard', 'Accessories', 79.99, 60),
  (3, 'USB-C Hub', 'Accessories', 24.99, 200),
  (4, 'Laptop Stand', 'Accessories', 34.99, 90),
  (5, '27-inch Monitor', 'Electronics', 249.99, 40),
  (6, 'Webcam HD', 'Electronics', 45.99, 75),
  (
    7,
    'Noise Cancelling Headphones',
    'Electronics',
    129.99,
    55
  ),
  (8, 'Portable SSD 1TB', 'Electronics', 89.99, 100),
  (9, 'Desk Lamp LED', 'Home Appliances', 22.50, 120),
  (10, 'Air Purifier Mini', 'Home Appliances', 59.99, 30),
  (11, 'Electric Kettle', 'Home Appliances', 27.99, 80),
  (12, 'Office Chair Ergonomic', 'Office', 189.99, 25),
  (13, 'Standing Desk', 'Office', 349.99, 15),
  (14, 'Whiteboard Small', 'Office', 18.99, 45);

INSERT INTO
  orders (
    order_id,
    customer_id,
    order_date,
    status,
    total_amount
  )
VALUES
  (1, 1, '2025-11-05', 'delivered', 56.97),
  (2, 2, '2025-11-18', 'delivered', 249.99),
  (3, 1, '2025-12-02', 'delivered', 219.98),
  (4, 3, '2025-12-05', 'shipped', 79.99),
  (5, NULL, '2025-12-08', 'delivered', 45.00),
  (6, 4, '2025-12-12', 'cancelled', 189.99),
  (7, 5, '2026-01-06', 'delivered', 80.98),
  (8, 6, '2026-01-14', 'delivered', 349.99),
  (9, 2, '2026-01-15', 'refunded', 59.99),
  (10, 7, '2026-01-22', 'delivered', 47.97),
  (11, NULL, '2026-01-25', 'delivered', 49.98),
  (12, 8, '2026-02-02', 'processing', 295.98),
  (13, 1, '2026-02-04', 'delivered', 27.99),
  (14, 9, '2026-02-15', 'cancelled', 37.98),
  (15, 10, '2026-02-21', 'delivered', 259.98),
  (16, 3, '2026-02-22', 'delivered', 95.98),
  (17, NULL, '2026-02-25', 'pending', 22.50),
  (18, 11, '2026-03-02', 'delivered', 349.99),
  (19, 5, '2026-03-03', 'delivered', 69.98),
  (20, 12, '2026-03-11', 'shipped', 89.99),
  (21, 6, '2026-03-12', 'delivered', 91.98),
  (22, 7, '2026-03-15', 'delivered', 189.99),
  (23, 2, '2026-03-16', 'pending', 24.99),
  (24, 10, '2026-03-18', 'delivered', 95.98),
  (25, NULL, '2026-03-20', 'delivered', 59.99),
  (26, 1, '2026-03-22', 'delivered', 249.99),
  (27, 12, '2026-03-25', 'refunded', 129.99),
  (28, 8, '2026-03-28', 'delivered', 67.50);

INSERT INTO
  order_items (
    order_item_id,
    order_id,
    product_id,
    quantity,
    unit_price
  )
VALUES
  (1, 1, 1, 2, 15.99),
  (2, 1, 3, 1, 24.99),
  (3, 2, 5, 1, 249.99),
  (4, 3, 7, 1, 129.99),
  (5, 3, 8, 1, 89.99),
  (6, 4, 2, 1, 79.99),
  (7, 5, 9, 2, 22.50),
  (8, 6, 12, 1, 189.99),
  (9, 7, 6, 1, 45.99),
  (10, 7, 4, 1, 34.99),
  (11, 8, 13, 1, 349.99),
  (12, 9, 10, 1, 59.99),
  (13, 10, 1, 3, 15.99),
  (14, 11, 3, 2, 24.99),
  (15, 12, 5, 1, 249.99),
  (16, 12, 6, 1, 45.99),
  (17, 13, 11, 1, 27.99),
  (18, 14, 14, 2, 18.99),
  (19, 15, 7, 2, 129.99),
  (20, 16, 2, 1, 79.99),
  (21, 16, 1, 1, 15.99),
  (22, 17, 9, 1, 22.50),
  (23, 18, 13, 1, 349.99),
  (24, 19, 4, 2, 34.99),
  (25, 20, 8, 1, 89.99),
  (26, 21, 6, 2, 45.99),
  (27, 22, 12, 1, 189.99),
  (28, 23, 3, 1, 24.99),
  (29, 24, 1, 1, 15.99),
  (30, 24, 2, 1, 79.99),
  (31, 25, 10, 1, 59.99),
  (32, 26, 5, 1, 249.99),
  (33, 27, 7, 1, 129.99),
  (34, 28, 9, 3, 22.50);

-- Đồng bộ lại sequence sau khi INSERT với ID cố định tay (SERIAL không tự biết
-- ID lớn nhất đã dùng nếu insert thủ công), tránh lỗi trùng khoá cho lần INSERT tiếp theo.
SELECT setval('customers_customer_id_seq', (SELECT MAX(customer_id) FROM customers));
SELECT setval('products_product_id_seq', (SELECT MAX(product_id) FROM products));
SELECT setval('orders_order_id_seq', (SELECT MAX(order_id) FROM orders));
SELECT setval(
    'order_items_order_item_id_seq',
    (SELECT MAX(order_item_id) FROM order_items)
  );
