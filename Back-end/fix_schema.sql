-- Fix inconsistencies in column names (user_id vs userid)
-- Make sure all tables have consistent column naming

-- Fix produit table
ALTER TABLE produit RENAME COLUMN user_id TO userid;

-- Make sure all tables have the userid column
ALTER TABLE produit ADD COLUMN IF NOT EXISTS userid INTEGER;
ALTER TABLE fournisseur ADD COLUMN IF NOT EXISTS userid INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS userid INTEGER;
ALTER TABLE commande ADD COLUMN IF NOT EXISTS userid INTEGER;
ALTER TABLE facture ADD COLUMN IF NOT EXISTS user_id INTEGER;
ALTER TABLE supplier_order ADD COLUMN IF NOT EXISTS userid INTEGER;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS user_id INTEGER;

-- Set a default user ID (1) for existing records to make them visible
UPDATE produit SET userid = 1 WHERE userid IS NULL;
UPDATE fournisseur SET userid = 1 WHERE userid IS NULL;
UPDATE clients SET userid = 1 WHERE userid IS NULL;
UPDATE commande SET userid = 1 WHERE userid IS NULL;
UPDATE facture SET user_id = 1 WHERE user_id IS NULL;
UPDATE supplier_order SET userid = 1 WHERE userid IS NULL;
UPDATE categories SET user_id = 1 WHERE user_id IS NULL;

-- Make sure the status column exists in commande table
ALTER TABLE commande ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'Pending';

-- Make sure payment_method, reference, and notes columns exist in commande table
ALTER TABLE commande ADD COLUMN IF NOT EXISTS payment_method VARCHAR(50);
ALTER TABLE commande ADD COLUMN IF NOT EXISTS reference VARCHAR(100);
ALTER TABLE commande ADD COLUMN IF NOT EXISTS notes TEXT;

-- Make sure parent_order_id and is_parent columns exist in commande table
ALTER TABLE commande ADD COLUMN IF NOT EXISTS parent_order_id INTEGER;
ALTER TABLE commande ADD COLUMN IF NOT EXISTS is_parent BOOLEAN DEFAULT false;

-- Make sure unit_price and total_amount columns exist in commande table
ALTER TABLE commande ADD COLUMN IF NOT EXISTS unit_price NUMERIC(10, 2) DEFAULT 0;
ALTER TABLE commande ADD COLUMN IF NOT EXISTS total_amount NUMERIC(10, 2) DEFAULT 0;
