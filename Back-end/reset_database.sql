-- Reset database script
-- This script will drop all tables EXCEPT users and recreate them with empty data

-- Disable foreign key checks temporarily (for PostgreSQL)
SET session_replication_role = 'replica';

-- Drop all tables in reverse order of dependencies
DROP TABLE IF EXISTS facture_items CASCADE;
DROP TABLE IF EXISTS facture CASCADE;
DROP TABLE IF EXISTS supplier_order_items CASCADE;
DROP TABLE IF EXISTS supplier_orders CASCADE;
DROP TABLE IF EXISTS multi_client_order_items CASCADE;
DROP TABLE IF EXISTS multi_client_orders CASCADE;
DROP TABLE IF EXISTS commande CASCADE;
DROP TABLE IF EXISTS produit CASCADE;
DROP TABLE IF EXISTS categories CASCADE;
DROP TABLE IF EXISTS clients CASCADE;
DROP TABLE IF EXISTS fournisseur CASCADE;

-- Skip users table - we're preserving it

-- Check if users table exists, if not create it
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    last_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) DEFAULT 'user',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create categories table
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    color VARCHAR(20) DEFAULT '#3498db',
    icon VARCHAR(50),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create products table
CREATE TABLE produit (
    id SERIAL PRIMARY KEY,
    nom_produit VARCHAR(255) NOT NULL,
    description TEXT,
    prix DECIMAL(10, 2) NOT NULL,
    quantite INTEGER NOT NULL,
    total INTEGER,
    image_url TEXT,
    serial_number VARCHAR(100),
    category_id INTEGER REFERENCES categories(id),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create clients table
CREATE TABLE clients (
    id SERIAL PRIMARY KEY,
    nom VARCHAR(255) NOT NULL,
    prenom VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    tel VARCHAR(20),
    adresse TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create suppliers table
CREATE TABLE fournisseur (
    id SERIAL PRIMARY KEY,
    nom_entreprise VARCHAR(255) NOT NULL,
    num_registre VARCHAR(100),
    email VARCHAR(255),
    tel VARCHAR(20),
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create orders table
CREATE TABLE commande (
    id SERIAL PRIMARY KEY,
    produit_id INTEGER REFERENCES produit(id),
    nom_produit VARCHAR(255),
    quantite INTEGER NOT NULL,
    date_commande TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    customer_name VARCHAR(255),
    userId INTEGER REFERENCES users(id),
    status VARCHAR(50) DEFAULT 'Pending',
    unit_price DECIMAL(10, 2),
    total_amount DECIMAL(10, 2),
    parent_order_id INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create multi-client orders table
CREATE TABLE multi_client_orders (
    id SERIAL PRIMARY KEY,
    order_number VARCHAR(50),
    total_amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create multi-client order items table
CREATE TABLE multi_client_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES multi_client_orders(id) ON DELETE CASCADE,
    client_id INTEGER REFERENCES clients(id),
    product_id INTEGER REFERENCES produit(id),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2),
    amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create supplier orders table
CREATE TABLE supplier_orders (
    id SERIAL PRIMARY KEY,
    supplier_id INTEGER REFERENCES fournisseur(id),
    order_number VARCHAR(50),
    order_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    delivery_date TIMESTAMP,
    total_amount DECIMAL(10, 2),
    status VARCHAR(50) DEFAULT 'Pending',
    notes TEXT,
    user_id INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create supplier order items table
CREATE TABLE supplier_order_items (
    id SERIAL PRIMARY KEY,
    order_id INTEGER REFERENCES supplier_orders(id) ON DELETE CASCADE,
    product_id INTEGER REFERENCES produit(id),
    product_name VARCHAR(255),
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2),
    amount DECIMAL(10, 2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoices table
CREATE TABLE facture (
    id SERIAL PRIMARY KEY,
    invoice_number VARCHAR(50) UNIQUE NOT NULL,
    customer_name VARCHAR(255) NOT NULL,
    client_id INTEGER REFERENCES clients(id),
    date TIMESTAMP NOT NULL,
    due_date TIMESTAMP,
    status VARCHAR(50) DEFAULT 'Draft',
    notes TEXT,
    total_amount DECIMAL(10, 2) NOT NULL,
    user_id INTEGER REFERENCES users(id) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create invoice items table
CREATE TABLE facture_items (
    id SERIAL PRIMARY KEY,
    facture_id INTEGER REFERENCES facture(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    amount DECIMAL(10, 2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Re-enable foreign key checks
SET session_replication_role = 'origin';

-- No need to create admin user since we're preserving the users table
