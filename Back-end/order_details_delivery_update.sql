-- SQL code to add delivery tracking fields to order_details table
-- Adding delivered_quantity and remaining_quantity columns to track partial deliveries

-- Add delivered_quantity column to order_details table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_details' AND column_name = 'delivered_quantity'
    ) THEN
        ALTER TABLE public.order_details ADD COLUMN delivered_quantity integer DEFAULT 0;
        COMMENT ON COLUMN public.order_details.delivered_quantity IS 'Quantity already delivered to the customer';
    END IF;
END $$;

-- Add remaining_quantity column to order_details table
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'order_details' AND column_name = 'remaining_quantity'
    ) THEN
        ALTER TABLE public.order_details ADD COLUMN remaining_quantity integer DEFAULT 0;
        COMMENT ON COLUMN public.order_details.remaining_quantity IS 'Quantity still to be delivered to the customer';
    END IF;
END $$;

-- Update existing order details to set delivered_quantity equal to quantity (assuming all were delivered)
-- and remaining_quantity to 0
UPDATE public.order_details
SET delivered_quantity = quantity, remaining_quantity = 0
WHERE delivered_quantity IS NULL AND quantity IS NOT NULL;
