-- payment_method was ENUM(momo, airtel, cod) — 'card' (Stripe) was rejected.
-- Widen to VARCHAR so new methods don't need enum migrations.

ALTER TABLE orders MODIFY COLUMN payment_method VARCHAR(32) NOT NULL;
