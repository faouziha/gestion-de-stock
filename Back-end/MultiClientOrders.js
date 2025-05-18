require('dotenv').config();
const express = require("express");
const router = express.Router();
const { pool } = require('./db');

// Use pool.query wrapper
const db = {
    query: (text, params, callback) => {
        return pool.query(text, params, callback);
    }
};

// Helper function to check available stock
const getAvailableStock = async (produit_id) => {
    // First get the total stock quantity
    const stockResult = await db.query(
        "SELECT quantite FROM produit WHERE id = $1",
        [produit_id]
    );
    
    if (stockResult.rows.length === 0) {
        throw new Error("Product not found");
    }
    
    const totalStock = parseInt(stockResult.rows[0].quantite);
    
    // Then get the sum of all quantities in pending orders for this product
    const ordersResult = await db.query(
        "SELECT COALESCE(SUM(quantite), 0) as ordered FROM commande WHERE produit_id = $1 AND status NOT IN ('Cancelled', 'Delivered')",
        [produit_id]
    );
    
    const orderedQuantity = parseInt(ordersResult.rows[0].ordered);
    
    // Return both values
    return {
        totalStock,
        orderedQuantity,
        availableStock: totalStock - orderedQuantity
    };
};

// Multi-client orders endpoint
router.post("/", async (req, res) => {
    try {
        const { 
            produit_id, 
            nom_produit, 
            quantite, 
            date_commande, 
            userId, 
            customer_name, 
            status, 
            is_parent, 
            parent_order_id,
            unit_price,
            total_amount
        } = req.body;
        
        console.log("Received multi-client order creation request:", { 
            is_parent, 
            parent_order_id, 
            produit_id, 
            customer_name 
        });
        
        console.log("Request body:", JSON.stringify(req.body, null, 2));
        
        // Check if this is a parent order (has no product, just groups child orders)
        if (is_parent === true) {
            // Create parent order without product-specific info
            let parentQuery = "INSERT INTO commande (";
            let parentFields = [];
            let parentValues = [];
            let parentPlaceholders = [];
            let parentIndex = 1;
            
            console.log("Creating parent order with is_parent =", is_parent);
            
            // Add fields that are present
            if (date_commande) {
                parentFields.push("date_commande");
                parentValues.push(date_commande);
                parentPlaceholders.push("$" + parentIndex++);
            }
            
            if (userId) {
                parentFields.push("userId");
                parentValues.push(userId);
                parentPlaceholders.push("$" + parentIndex++);
            }
            
            if (customer_name) {
                parentFields.push("customer_name");
                parentValues.push(customer_name);
                parentPlaceholders.push("$" + parentIndex++);
            }
            
            // Add status field
            parentFields.push("status");
            parentValues.push(status || "Pending");
            parentPlaceholders.push("$" + parentIndex++);
            
            // Add total_amount if provided
            if (total_amount !== undefined) {
                parentFields.push("total_amount");
                parentValues.push(total_amount);
                parentPlaceholders.push("$" + parentIndex++);
            }
            
            // Add is_parent flag
            parentFields.push("is_parent");
            parentValues.push(true);
            parentPlaceholders.push("$" + parentIndex++);
            
            // Complete the query
            parentQuery += parentFields.join(", ");
            parentQuery += ") VALUES (" + parentPlaceholders.join(", ") + ") RETURNING *";
            
            console.log("Creating parent order with query:", parentQuery);
            console.log("Values:", parentValues);
            console.log("SQL fields being inserted:", parentFields);
            
            const newParentOrder = await db.query(parentQuery, parentValues);
            
            res.status(201).json({
                message: "Parent order created successfully",
                commande: newParentOrder.rows[0]
            });
        } else {
            // Regular order or child order
            console.log("Creating child/regular order with product_id =", produit_id);
            console.log("Request data:", req.body);

            try {
                // Validate required fields for child orders
                if (!produit_id) {
                    console.warn("Warning: Creating a child order without product_id");
                }

                // Convert data types explicitly
                const prodIdNum = produit_id ? parseInt(produit_id) : null;
                const quantityNum = quantite ? parseInt(quantite) : null;
                
                // Check available stock before creating the order
                if (prodIdNum && quantityNum) {
                    try {
                        const stockInfo = await getAvailableStock(prodIdNum);
                        
                        // Verify if there's enough stock available
                        if (quantityNum > stockInfo.availableStock) {
                            return res.status(400).json({ 
                                error: "Insufficient stock", 
                                message: `Only ${stockInfo.availableStock} units available for this product.`,
                                availableStock: stockInfo.availableStock,
                                requestedQuantity: quantityNum
                            });
                        }
                    } catch (stockError) {
                        console.error("Error checking stock:", stockError);
                        // Continue with order creation even if stock check fails
                    }
                }
            } catch (validationError) {
                console.error("Validation error:", validationError);
                // Continue with order creation even if validation fails
            }
            
            // Create a basic query with required fields
            let childQuery = "INSERT INTO commande (";
            let childFields = [];
            let childValues = [];
            let childPlaceholders = [];
            let childIndex = 1;
            
            // Convert data types properly
            const prodIdNum = produit_id ? parseInt(produit_id) : null;
            const quantityNum = quantite ? parseInt(quantite) : null;
            const unitPriceNum = unit_price ? parseFloat(unit_price) : 0;
            const totalAmountNum = total_amount ? parseFloat(total_amount) : 0;
            const parentOrderIdNum = parent_order_id ? parseInt(parent_order_id) : null;
            
            // Add all fields that are present - with proper type conversion
            if (prodIdNum !== null) {
                childFields.push("produit_id");
                childValues.push(prodIdNum);
                childPlaceholders.push("$" + childIndex++);
            }
            
            if (nom_produit) {
                childFields.push("nom_produit");
                childValues.push(String(nom_produit));
                childPlaceholders.push("$" + childIndex++);
            }
            
            if (quantityNum !== null) {
                childFields.push("quantite");
                childValues.push(quantityNum);
                childPlaceholders.push("$" + childIndex++);
            }
            
            if (date_commande) {
                childFields.push("date_commande");
                childValues.push(date_commande);
                childPlaceholders.push("$" + childIndex++);
            }
            
            if (userId) {
                childFields.push("userId");
                childValues.push(userId);
                childPlaceholders.push("$" + childIndex++);
            }
            
            if (customer_name) {
                childFields.push("customer_name");
                childValues.push(String(customer_name));
                childPlaceholders.push("$" + childIndex++);
            }
            
            // Add status field
            childFields.push("status");
            childValues.push(status || "Pending");
            childPlaceholders.push("$" + childIndex++);
            
            // Add parent_order_id if provided
            if (parentOrderIdNum !== null) {
                childFields.push("parent_order_id");
                childValues.push(parentOrderIdNum);
                childPlaceholders.push("$" + childIndex++);
            }
            
            // Add is_parent flag (false for child orders)
            childFields.push("is_parent");
            childValues.push(false);
            childPlaceholders.push("$" + childIndex++);
            
            // Add unit_price
            childFields.push("unit_price");
            childValues.push(unitPriceNum);
            childPlaceholders.push("$" + childIndex++);
            
            // Add total_amount
            childFields.push("total_amount");
            childValues.push(totalAmountNum);
            childPlaceholders.push("$" + childIndex++);
            
            // Print data types for debugging
            console.log("Data types:", {
                produit_id: typeof prodIdNum,
                quantite: typeof quantityNum,
                unit_price: typeof unitPriceNum,
                total_amount: typeof totalAmountNum,
                parent_order_id: typeof parentOrderIdNum
            });
            
            // Complete the query
            childQuery += childFields.join(", ");
            childQuery += ") VALUES (" + childPlaceholders.join(", ") + ") RETURNING *";
            
            console.log("Creating child/regular order with query:", childQuery);
            console.log("Values:", childValues);
            
            const newChildOrder = await db.query(childQuery, childValues);
            
            const stockInfo = produit_id ? await getAvailableStock(produit_id) : null;
            
            res.status(201).json({
                message: "Order created successfully",
                commande: newChildOrder.rows[0],
                stockInfo: produit_id ? {
                    previouslyAvailable: stockInfo.availableStock,
                    remainingAfterOrder: stockInfo.availableStock - quantite
                } : null
            });
        }
    } catch (err) {
        console.error("Error creating multi-client order: ", err);
        console.error("Error details:", err.message);
        if (err.stack) console.error("Stack trace:", err.stack);
        if (err.code) console.error("Error code:", err.code);
        
        res.status(500).json({ error: "Internal Server Error", details: err.message });
    }
});

module.exports = router;
