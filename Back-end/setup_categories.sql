-- First check if the categories table exists
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'categories') THEN
        -- Create the categories table
        CREATE TABLE categories (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            description TEXT,
            color VARCHAR(50) DEFAULT '#3B82F6',
            icon VARCHAR(50) DEFAULT 'tag',
            user_id INTEGER NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        
        -- Add some sample categories (replace user_id with actual user ID)
        INSERT INTO categories (name, description, color, icon, user_id)
        VALUES 
        ('Electronics', 'Electronic devices and components', '#EF4444', 'laptop', 7),
        ('Office Supplies', 'Office materials and stationery', '#10B981', 'pencil', 7),
        ('Furniture', 'Office and home furniture', '#F59E0B', 'chair', 7),
        ('Books', 'Books and reference materials', '#8B5CF6', 'book', 7);
    END IF;
END $$;

-- Check if the category_id column exists in the produit table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'produit' AND column_name = 'category_id'
    ) THEN
        -- Add category_id column to produit table
        ALTER TABLE produit ADD COLUMN category_id INTEGER;
        
        -- Add foreign key constraint
        ALTER TABLE produit 
        ADD CONSTRAINT fk_produit_category 
        FOREIGN KEY (category_id) REFERENCES categories(id) 
        ON DELETE SET NULL;
    END IF;
END $$;

-- Use this command to rerun the server after executing this SQL
-- node Server.js
