-- SQL code to modify client order structure to support multiple products
-- Using the existing commande table with a parent-child relationship

-- Add parent_order_id column to commande table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'commande' AND column_name = 'parent_order_id'
    ) THEN
        ALTER TABLE public.commande ADD COLUMN parent_order_id integer;
        
        -- Add foreign key constraint
        ALTER TABLE public.commande 
        ADD CONSTRAINT commande_parent_order_id_fkey 
        FOREIGN KEY (parent_order_id) 
        REFERENCES public.commande (id) 
        ON DELETE CASCADE;
        
        -- Add index for better performance
        CREATE INDEX idx_commande_parent_order_id ON public.commande(parent_order_id);
    END IF;
END $$;

-- Add is_parent flag to identify parent orders
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'commande' AND column_name = 'is_parent'
    ) THEN
        ALTER TABLE public.commande ADD COLUMN is_parent boolean DEFAULT false;
    END IF;
END $$;

-- Add total_amount column to commande table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'commande' AND column_name = 'total_amount'
    ) THEN
        ALTER TABLE public.commande ADD COLUMN total_amount numeric(10, 2) DEFAULT 0;
    END IF;
END $$;
