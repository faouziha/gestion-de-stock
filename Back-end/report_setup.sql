-- report_setup.sql - Setup script for report tables

-- Create report table (parent table)
CREATE TABLE IF NOT EXISTS report (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date_created TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date_range_start DATE NOT NULL,
    date_range_end DATE NOT NULL,
    user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
    status VARCHAR(50) DEFAULT 'Generated',
    total_revenue NUMERIC(12, 2) DEFAULT 0,
    total_products_sold INTEGER DEFAULT 0,
    total_orders INTEGER DEFAULT 0
);

-- Create report_details table (child table)
CREATE TABLE IF NOT EXISTS report_details (
    id SERIAL PRIMARY KEY,
    report_id INTEGER NOT NULL REFERENCES report(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES produit(id) ON DELETE SET NULL,
    product_name VARCHAR(255),
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    category_name VARCHAR(255),
    brand_id INTEGER REFERENCES brands(id) ON DELETE SET NULL,
    brand_name VARCHAR(255),
    quantity_sold INTEGER DEFAULT 0,
    revenue NUMERIC(12, 2) DEFAULT 0,
    order_count INTEGER DEFAULT 0,
    average_price NUMERIC(12, 2) DEFAULT 0
);
