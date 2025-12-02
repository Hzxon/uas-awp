-- Schema untuk aplikasi WashFast
-- Jalankan dengan: mysql -u <user> -p < backend/db/schema.sql

CREATE DATABASE IF NOT EXISTS washfast CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE washfast;

CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('customer', 'admin') NOT NULL DEFAULT 'customer',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(150) NOT NULL,
  type ENUM('Layanan', 'Produk') NOT NULL,
  price INT NOT NULL,
  unit VARCHAR(30) NOT NULL,
  description TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS orders (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  subtotal INT NOT NULL,
  tax_amount INT NOT NULL,
  delivery_fee INT NOT NULL,
  total INT NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS order_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  order_id INT NOT NULL,
  item_code VARCHAR(64),
  name VARCHAR(150) NOT NULL,
  type VARCHAR(50) NOT NULL,
  unit VARCHAR(30),
  price INT NOT NULL,
  quantity INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Seed admin & contoh item (sesuaikan password hash dengan hasil bcrypt)
INSERT IGNORE INTO users (id, nama, email, password, role) VALUES
  (1, 'Admin WashFast', 'admin@washfast.local', '$2b$10$abcdefghijklmnopqrstuv', 'admin');

INSERT INTO items (name, type, price, unit, description) VALUES
  ('Cuci Kiloan Reguler', 'Layanan', 8000, 'kg', 'Cuci, setrika, lipat, selesai 3 hari'),
  ('Laundry Kilat 24 Jam', 'Layanan', 15000, 'kg', 'Prioritas selesai 24 jam'),
  ('Deterjen Konsentrat 1L', 'Produk', 45000, 'pcs', 'Deterjen konsentrat wangi'),
  ('Pelembut Premium', 'Produk', 32000, 'pcs', 'Pelembut pakaian premium');
