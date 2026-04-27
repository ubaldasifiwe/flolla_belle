-- App uses: pending, awaiting_payment, payment_requested, paid, failed, etc.
-- ENUM columns reject values like 'awaiting_payment' unless listed.

ALTER TABLE orders MODIFY COLUMN payment_status VARCHAR(64) NOT NULL DEFAULT 'pending';
