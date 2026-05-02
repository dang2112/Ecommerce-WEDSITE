CREATE DATABASE IF NOT EXISTS ecommerce_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE ecommerce_db;

-- 1. Bảng USER
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    phone_number VARCHAR(20) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    date_of_birth DATE,
    gender ENUM('Male', 'Female', 'Other'),
    role ENUM('Customer', 'Admin') DEFAULT 'Customer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Bảng ADDRESS (1 User có nhiều Address)
CREATE TABLE addresses (
    address_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    province VARCHAR(100) NOT NULL,
    ward VARCHAR(100) NOT NULL,
    detail_address TEXT NOT NULL,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 3. Bảng PRODUCT
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    brand VARCHAR(100),
    category VARCHAR(100),
    image_url VARCHAR(255) NOT NULL,
    base_price DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Bảng PRODUCT_VARIANT (1 Product có nhiều Variant)
CREATE TABLE product_variants (
    variant_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    size VARCHAR(50),
    stock_quantity INT NOT NULL DEFAULT 0,
    price DECIMAL(10, 2) NOT NULL,
    image_url VARCHAR(255),
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- 5. Bảng COUPON
CREATE TABLE coupons (
    code VARCHAR(50) PRIMARY KEY,
    start_date DATETIME NOT NULL,
    end_date DATETIME NOT NULL,
    minimum_order_value DECIMAL(10, 2) DEFAULT 0,
    maximum_discount DECIMAL(10, 2),
    discount_value DECIMAL(10, 2) NOT NULL
);

-- 6. Bảng ORDER
CREATE TABLE orders (
    order_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    coupon_code VARCHAR(50) NULL,
    order_number VARCHAR(50) NOT NULL UNIQUE,
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Pending', 'Processing', 'Shipped', 'Delivered', 'Cancelled') DEFAULT 'Pending',
    sub_total DECIMAL(10, 2) NOT NULL,
    discount_amount DECIMAL(10, 2) DEFAULT 0,
    shipping_fee DECIMAL(10, 2) DEFAULT 0,
    total_amount DECIMAL(10, 2) GENERATED ALWAYS AS (sub_total + shipping_fee - discount_amount) STORED,
    FOREIGN KEY (user_id) REFERENCES users(user_id),
    FOREIGN KEY (coupon_code) REFERENCES coupons(code) ON DELETE SET NULL
);

-- 7. Bảng ORDER_ITEM (Chi tiết đơn hàng)
CREATE TABLE order_items (
    order_item_id INT AUTO_INCREMENT PRIMARY KEY,
    order_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    sub_total DECIMAL(10, 2) GENERATED ALWAYS AS (quantity * unit_price) STORED,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id)
);

-- 8. Bảng PAYMENT (1 Order có 1 Payment)
CREATE TABLE payments (
    transaction_id VARCHAR(100) PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    payment_method VARCHAR(50) NOT NULL,
    status ENUM('Pending', 'Completed', 'Failed', 'Refunded') DEFAULT 'Pending',
    payment_date DATETIME,
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- 9. Bảng SHIPMENT (1 Order có 1 Shipment)
CREATE TABLE shipments (
    tracking_number VARCHAR(100) PRIMARY KEY,
    order_id INT NOT NULL UNIQUE,
    carrier VARCHAR(100) NOT NULL,
    shipping_method VARCHAR(50),
    shipping_status ENUM('Preparing', 'In Transit', 'Out for Delivery', 'Delivered') DEFAULT 'Preparing',
    FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

-- 10. Bảng CART (1 User chỉ có 1 Cart)
CREATE TABLE carts (
    cart_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL UNIQUE,
    create_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE
);

-- 11. Bảng CART_ITEM
CREATE TABLE cart_items (
    cart_item_id INT AUTO_INCREMENT PRIMARY KEY,
    cart_id INT NOT NULL,
    variant_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE,
    FOREIGN KEY (variant_id) REFERENCES product_variants(variant_id) ON DELETE CASCADE
);

-- 12. Bảng REVIEW 
CREATE TABLE reviews (
    review_id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);

-- =============================================
-- Admin login: 0 / admin123
-- =============================================

INSERT INTO users (user_id, phone_number, password, full_name, date_of_birth, gender, role)
VALUES
    (1, '0', '$2a$10$Do1g7e8KWEGVAhLKwom9du7WkwLhSv0iWDTclHBBUDlzQIJHzjzuS', 'System Admin', '1995-01-15', 'Male', 'Admin');

-- Sample products for testing
INSERT INTO products (name, description, brand, category, image_url, base_price) VALUES
('T-Shirt', 'Comfortable cotton t-shirt', 'BrandA', 'Clothing', 'https://images.pexels.com/photos/20458071/pexels-photo-20458071.jpeg', 20.00),
('Jeans', 'Blue denim jeans', 'BrandB', 'Clothing', 'https://images.pexels.com/photos/7764611/pexels-photo-7764611.jpeg', 50.00),
('Sneakers', 'Stylish running sneakers', 'BrandC', 'Shoes', 'https://images.pexels.com/photos/7782677/pexels-photo-7782677.jpeg', 80.00),
('Headphones', 'Wireless noise-cancelling headphones', 'BrandE', 'Electronics', 'https://images.pexels.com/photos/5269759/pexels-photo-5269759.jpeg', 150.00),
('Watch', 'Elegant wristwatch', 'BrandF', 'Accessories', 'https://images.pexels.com/photos/29639117/pexels-photo-29639117.jpeg', 200.00),
('Backpack', 'Durable hiking backpack', 'BrandG', 'Accessories', 'https://images.pexels.com/photos/14430348/pexels-photo-14430348.jpeg', 60.00),
('Sunglasses', 'UV-protective sunglasses', 'BrandH', 'Accessories', 'https://images.pexels.com/photos/31259705/pexels-photo-31259705.jpeg', 40.00),
('Dress', 'Elegant evening dress', 'BrandI', 'Clothing', 'https://images.pexels.com/photos/17471951/pexels-photo-17471951.jpeg', 100.00);

INSERT INTO product_variants (product_id, size, stock_quantity, price, image_url) VALUES
(1, 'S', 10, 20.00, 'https://images.pexels.com/photos/31842962/pexels-photo-31842962.jpeg'),
(1, 'M', 15, 20.00, 'https://images.pexels.com/photos/2249248/pexels-photo-2249248.jpeg'),
(1, 'L', 12, 20.00, 'https://images.pexels.com/photos/11100267/pexels-photo-11100267.jpeg'),
(2, 'M', 5, 50.00, 'https://images.pexels.com/photos/17720471/pexels-photo-17720471.jpeg'),
(2, 'L', 8, 50.00, 'https://images.pexels.com/photos/7764611/pexels-photo-7764611.jpeg'),
(2, 'S', 6, 50.00, 'https://images.pexels.com/photos/24513229/pexels-photo-24513229.jpeg'),
(3, 'S', 20, 80.00, 'https://images.pexels.com/photos/4901935/pexels-photo-4901935.jpeg'),
(3, 'M', 18, 80.00, 'https://images.pexels.com/photos/7782677/pexels-photo-7782677.jpeg'),
(3, 'L', 15, 80.00, 'https://images.pexels.com/photos/5037306/pexels-photo-5037306.jpeg'),
(4, 'S', 10, 150.00, 'https://images.pexels.com/photos/20385205/pexels-photo-20385205.jpeg'),
(4, 'M', 12, 150.00, 'https://images.pexels.com/photos/7054718/pexels-photo-7054718.jpeg'),
(5, 'S', 8, 200.00, 'https://images.pexels.com/photos/29639117/pexels-photo-29639117.jpeg'),
(5, 'M', 6, 180.00, 'https://images.pexels.com/photos/13185833/pexels-photo-13185833.jpeg'),
(6, 'S', 15, 60.00, 'https://images.pexels.com/photos/2905238/pexels-photo-2905238.jpeg'),
(6, 'M', 10, 70.00, 'https://images.pexels.com/photos/5065154/pexels-photo-5065154.jpeg'),
(7, 'S', 20, 40.00, 'https://images.pexels.com/photos/31259705/pexels-photo-31259705.jpeg'),
(7, 'M', 15, 45.00, 'https://images.pexels.com/photos/27353347/pexels-photo-27353347.jpeg'),
(8, 'S', 10, 100.00, 'https://images.pexels.com/photos/17471951/pexels-photo-17471951.jpeg'),
(8, 'M', 12, 100.00, 'https://images.pexels.com/photos/17471732/pexels-photo-17471732.jpeg');

-- Demo data to showcase database relationships
-- Add a customer user
INSERT INTO users (user_id, phone_number, password, full_name, date_of_birth, gender, role)
VALUES
    (2, '1234567890', '$2a$10$examplehashedpassword', 'John Doe', '1990-01-01', 'Male', 'Customer');

-- Add address for the customer
INSERT INTO addresses (user_id, province, ward, detail_address)
VALUES (2, 'California', 'Los Angeles', '123 Main Street, Apt 4B');

-- Add a coupon
INSERT INTO coupons (code, start_date, end_date, minimum_order_value, maximum_discount, discount_value)
VALUES ('SAVE10', '2023-01-01 00:00:00', '2023-12-31 23:59:59', 50.00, 10.00, 10.00);

-- Create an order for the customer (using coupon, with multiple items)
INSERT INTO orders (user_id, coupon_code, order_number, sub_total, discount_amount, shipping_fee)
VALUES (2, 'SAVE10', 'ORD-2023-001', 1240.00, 10.00, 15.00);

-- Add order items (t-shirt and laptop)
INSERT INTO order_items (order_id, variant_id, quantity, unit_price)
VALUES (1, 1, 2, 20.00), (1, 4, 1, 1200.00);

-- Add payment for the order
INSERT INTO payments (transaction_id, order_id, payment_method, status, payment_date)
VALUES ('TXN-ORD-2023-001', 1, 'Credit Card', 'Completed', NOW());

-- Add shipment for the order
INSERT INTO shipments (tracking_number, order_id, carrier, shipping_method, shipping_status)
VALUES ('TRACK-ORD-2023-001', 1, 'UPS', 'Express', 'Shipped');

-- Create a cart for the customer
INSERT INTO carts (user_id)
VALUES (2);

-- Add items to the cart (jeans and sneakers)
INSERT INTO cart_items (cart_id, variant_id, quantity)
VALUES (1, 2, 1), (1, 3, 1);