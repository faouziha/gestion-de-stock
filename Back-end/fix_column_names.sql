-- Fix inconsistencies in column names (user_id vs userid)
-- Copy values from user_id to userid where needed

-- For produit table
UPDATE produit SET userid = user_id WHERE user_id IS NOT NULL AND userid IS NULL;

-- For categories table (if it exists)
UPDATE categories SET userid = user_id WHERE user_id IS NOT NULL AND userid IS NULL;

-- For facture table (if it exists)
UPDATE facture SET userid = user_id WHERE user_id IS NOT NULL AND userid IS NULL;

-- Make sure all queries in the application use the correct column name
-- This is a reminder to check Server.js for any queries using the wrong column name
