-- Create brands table
CREATE TABLE IF NOT EXISTS brands (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    logo_url TEXT,
    website VARCHAR(500),
    color VARCHAR(50) DEFAULT '#3B82F6',
    founded_year INTEGER,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add brand_id column to products table if it doesn't exist AND if products table exists
DO $$
BEGIN
    -- First check if produit table exists
    IF EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
        AND table_name = 'produit'
    ) THEN
        -- Then check if brand_id column exists
        IF NOT EXISTS (
            SELECT 1
            FROM information_schema.columns
            WHERE table_name = 'produit' AND column_name = 'brand_id'
        ) THEN
            ALTER TABLE produit
            ADD COLUMN brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL;
        END IF;
    END IF;
END $$;
