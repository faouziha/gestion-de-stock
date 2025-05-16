-- SQL code to create supplier_order table
CREATE TABLE supplier_order (
    id SERIAL PRIMARY KEY,
    fournisseur_id INTEGER NOT NULL REFERENCES fournisseur(id),
    supplier_name VARCHAR(100) NOT NULL,
    produit_id INTEGER NOT NULL REFERENCES produit(id),
    product_name VARCHAR(100) NOT NULL,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    order_date DATE DEFAULT CURRENT_DATE,
    expected_delivery_date DATE,
    status VARCHAR(20) DEFAULT 'Pending',
    notes TEXT,
    userId INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add indexes for better performance
CREATE INDEX idx_supplier_order_fournisseur_id ON supplier_order(fournisseur_id);
CREATE INDEX idx_supplier_order_produit_id ON supplier_order(produit_id);
CREATE INDEX idx_supplier_order_userId ON supplier_order(userId);
