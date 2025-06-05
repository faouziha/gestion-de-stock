-- Add userId column to all necessary tables
ALTER TABLE produit ADD COLUMN IF NOT EXISTS userId INTEGER;
ALTER TABLE fournisseur ADD COLUMN IF NOT EXISTS userId INTEGER;
ALTER TABLE clients ADD COLUMN IF NOT EXISTS userId INTEGER;
ALTER TABLE commande ADD COLUMN IF NOT EXISTS userId INTEGER;
ALTER TABLE facture ADD COLUMN IF NOT EXISTS userId INTEGER;
ALTER TABLE supplier_order ADD COLUMN IF NOT EXISTS userId INTEGER;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS userId INTEGER;

-- Set a default userId for existing records (using 1 as an example)
UPDATE produit SET userId = 1 WHERE userId IS NULL;
UPDATE fournisseur SET userId = 1 WHERE userId IS NULL;
UPDATE clients SET userId = 1 WHERE userId IS NULL;
UPDATE commande SET userId = 1 WHERE userId IS NULL;
UPDATE facture SET userId = 1 WHERE userId IS NULL;
UPDATE supplier_order SET userId = 1 WHERE userId IS NULL;
UPDATE categories SET userId = 1 WHERE userId IS NULL;
