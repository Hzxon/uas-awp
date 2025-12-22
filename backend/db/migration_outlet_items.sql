-- Migration: Create outlet_items table for per-outlet services and products
-- Each outlet can have its own set of items managed by the outlet admin

CREATE TABLE IF NOT EXISTS outlet_items (
  id INT AUTO_INCREMENT PRIMARY KEY,
  outlet_id INT NOT NULL,
  name VARCHAR(150) NOT NULL,
  type ENUM('Layanan', 'Produk') NOT NULL,
  price INT NOT NULL,
  unit VARCHAR(30) NOT NULL DEFAULT 'kg',
  description TEXT,
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (outlet_id) REFERENCES outlets(id) ON DELETE CASCADE,
  INDEX idx_outlet_items_outlet (outlet_id),
  INDEX idx_outlet_items_type (type)
);

-- Optional: Seed some example items for existing outlets
-- INSERT INTO outlet_items (outlet_id, name, type, price, unit, description) VALUES
--   (1, 'Cuci Kiloan Reguler', 'Layanan', 8000, 'kg', 'Cuci + setrika, selesai 3 hari'),
--   (1, 'Cuci Express 1 Hari', 'Layanan', 15000, 'kg', 'Cuci + setrika, selesai 1 hari'),
--   (1, 'Deterjen Premium', 'Produk', 25000, 'pcs', 'Deterjen konsentrat 500ml');
