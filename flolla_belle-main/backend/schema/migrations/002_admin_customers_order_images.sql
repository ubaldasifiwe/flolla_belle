
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(64) NULL,
  first_order_at DATETIME NULL,
  last_order_at DATETIME NULL,
  order_count INT NOT NULL DEFAULT 0,
  total_spent DECIMAL(12, 2) NOT NULL DEFAULT 0,
  UNIQUE KEY uq_customers_email (email)
);

ALTER TABLE order_items ADD COLUMN image_url VARCHAR(512) NULL;

ALTER TABLE products ADD COLUMN stock_quantity INT NOT NULL DEFAULT 0;

UPDATE products SET stock_quantity = CASE WHEN in_stock > 0 THEN 50 ELSE 0 END;
