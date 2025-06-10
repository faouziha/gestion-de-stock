-- SQL code to add delivery tracking fields to client order line items
-- Adding delivered_quantity and remaining_quantity columns to track partial deliveries

-- First, we need to identify the order items table 
-- For client orders, we use the commande table with parent-child relationship
-- Child records represent individual order line items

-- Add delivered_quantity column to commande table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'commande' AND column_name = 'delivered_quantity'
    ) THEN
        ALTER TABLE public.commande ADD COLUMN delivered_quantity integer DEFAULT 0;
        COMMENT ON COLUMN public.commande.delivered_quantity IS 'Quantity already delivered to the customer';
    END IF;
END $$;

-- Add remaining_quantity column to commande table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'commande' AND column_name = 'remaining_quantity'
    ) THEN
        ALTER TABLE public.commande ADD COLUMN remaining_quantity integer DEFAULT 0;
        COMMENT ON COLUMN public.commande.remaining_quantity IS 'Quantity still to be delivered to the customer';
    END IF;
END $$;

-- Update existing orders to set delivered_quantity equal to quantite (assuming all were delivered)
-- and remaining_quantity to 0
UPDATE public.commande
SET delivered_quantity = quantite, remaining_quantity = 0
WHERE delivered_quantity IS NULL AND quantite IS NOT NULL AND parent_order_id IS NOT NULL;
