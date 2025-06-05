-- Alter the logo_url column in brands table from VARCHAR(500) to TEXT
ALTER TABLE brands 
ALTER COLUMN logo_url TYPE TEXT;
