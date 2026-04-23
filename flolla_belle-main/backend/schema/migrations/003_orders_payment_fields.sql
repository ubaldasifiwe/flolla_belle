-- Mobile money payment tracking + VARCHAR payment_status (Rwanda MoMo / Airtel).
-- Run: mysql -u ... -p floral_shop < backend/schema/migrations/003_orders_payment_fields.sql
-- If "Duplicate column", skip that ADD line.

ALTER TABLE orders ADD COLUMN payment_reference VARCHAR(128) NULL;
ALTER TABLE orders ADD COLUMN payment_external_id VARCHAR(128) NULL;
ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(48) NOT NULL DEFAULT 'pending';
