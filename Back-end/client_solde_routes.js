// Client Solde (Balance) Routes
const express = require('express');
const router = express.Router();

// Get database connection from PostgreSQL pool
const pg = require('pg');
const pool = new pg.Pool({
    user: process.env.USER_NAME,
    host: process.env.DATABASE_HOST,
    database: process.env.DATABASE_NAME,
    password: process.env.USER_PASSWORD,
    port: process.env.DATABASE_PORT,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Helper function to execute queries
const executeQuery = async (query, params = []) => {
    const client = await pool.connect();
    try {
        const result = await client.query(query, params);
        return result;
    } finally {
        client.release();
    }
};

// Get client balance by client ID
router.get('/clients/:clientId/solde', async (req, res) => {
    try {
        const { clientId } = req.params;
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Check if client exists and belongs to user
        const clientCheck = await executeQuery(
            "SELECT * FROM clients WHERE id = $1 AND userid = $2",
            [clientId, userId]
        );

        if (clientCheck.rows.length === 0) {
            return res.status(404).json({ error: "Client not found or you don't have permission to view this client" });
        }

        // Get client balance
        const soldeQuery = `
            SELECT cs.*, c.nom, c.prenom
            FROM client_solde cs
            JOIN clients c ON cs.client_id = c.id
            WHERE cs.client_id = $1 AND cs.userid = $2
        `;

        const soldeResult = await executeQuery(soldeQuery, [clientId, userId]);

        // If no balance record exists, create one with zero balance
        if (soldeResult.rows.length === 0) {
            const createSoldeQuery = `
                INSERT INTO client_solde (client_id, total_solde, userid)
                VALUES ($1, 0, $2)
                RETURNING *, 
                (SELECT nom FROM clients WHERE id = $1) as nom,
                (SELECT prenom FROM clients WHERE id = $1) as prenom
            `;
            
            const newSoldeResult = await executeQuery(createSoldeQuery, [clientId, userId]);
            
            return res.json({
                ...newSoldeResult.rows[0],
                client_name: `${newSoldeResult.rows[0].prenom || ''} ${newSoldeResult.rows[0].nom || ''}`.trim(),
                history: []
            });
        }

        // Get transaction history
        const historyQuery = `
            SELECT *
            FROM client_solde_details
            WHERE client_id = $1 AND userid = $2
            ORDER BY transaction_date DESC
        `;

        const historyResult = await executeQuery(historyQuery, [clientId, userId]);

        res.json({
            ...soldeResult.rows[0],
            client_name: `${soldeResult.rows[0].prenom || ''} ${soldeResult.rows[0].nom || ''}`.trim(),
            history: historyResult.rows
        });
    } catch (error) {
        console.error("Error fetching client balance:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Get all clients with their balances
router.get('/clients/soldes/all', async (req, res) => {
    try {
        const userId = req.query.userId;

        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }

        // Get all clients with their balances
        const query = `
            SELECT c.id, c.nom, c.prenom, c.telephone, c.email,
                   COALESCE(cs.total_solde, 0) as total_solde,
                   COALESCE(cs.last_updated, c.date_creation) as last_updated
            FROM clients c
            LEFT JOIN client_solde cs ON c.id = cs.client_id
            WHERE c.userid = $1
            ORDER BY c.nom
        `;

        const result = await executeQuery(query, [userId]);

        res.json(result.rows.map(client => ({
            ...client,
            client_name: `${client.prenom || ''} ${client.nom || ''}`.trim()
        })));
    } catch (error) {
        console.error("Error fetching client balances:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    }
});

// Add deposit or update client balance
router.post('/clients/:clientId/solde', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { clientId } = req.params;
        const { amount, operation_type, reference, notes, userId } = req.body;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        if (!amount || isNaN(parseFloat(amount))) {
            return res.status(400).json({ error: "Valid amount is required" });
        }
        
        if (!['deposit', 'withdrawal', 'payment', 'refund'].includes(operation_type)) {
            return res.status(400).json({ error: "Valid operation type is required (deposit, withdrawal, payment, refund)" });
        }
        
        // Check if client exists and belongs to user
        const clientCheck = await client.query(
            "SELECT * FROM clients WHERE id = $1 AND userid = $2",
            [clientId, userId]
        );
        
        if (clientCheck.rows.length === 0) {
            return res.status(404).json({ error: "Client not found or you don't have permission to update this client" });
        }
        
        // Calculate the amount to add to the balance based on operation type
        let balanceChange = parseFloat(amount);
        if (['withdrawal', 'payment'].includes(operation_type)) {
            balanceChange = -balanceChange;
        }
        
        // Add transaction to history
        const addTransactionQuery = `
            INSERT INTO client_solde_details 
            (client_id, amount, operation_type, reference, notes, userid)
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *
        `;
        
        const transactionResult = await client.query(
            addTransactionQuery, 
            [clientId, Math.abs(parseFloat(amount)), operation_type, reference || '', notes || '', userId]
        );
        
        // Update or create client balance
        const updateBalanceQuery = `
            INSERT INTO client_solde (client_id, total_solde, userid)
            VALUES ($1, $2, $3)
            ON CONFLICT (client_id) DO UPDATE
            SET total_solde = client_solde.total_solde + $2,
                last_updated = CURRENT_TIMESTAMP
            RETURNING *
        `;
        
        const balanceResult = await client.query(
            updateBalanceQuery,
            [clientId, balanceChange, userId]
        );
        
        await client.query('COMMIT');
        
        res.status(201).json({
            transaction: transactionResult.rows[0],
            updated_balance: balanceResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error updating client balance:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        client.release();
    }
});

// Delete a transaction and update balance
router.delete('/clients/solde/transactions/:transactionId', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { transactionId } = req.params;
        const userId = req.query.userId;
        
        if (!userId) {
            return res.status(400).json({ error: "User ID is required" });
        }
        
        // Get transaction details
        const transactionQuery = `
            SELECT * FROM client_solde_details
            WHERE id = $1 AND userid = $2
        `;
        
        const transactionResult = await client.query(transactionQuery, [transactionId, userId]);
        
        if (transactionResult.rows.length === 0) {
            return res.status(404).json({ error: "Transaction not found or you don't have permission to delete it" });
        }
        
        const transaction = transactionResult.rows[0];
        
        // Calculate the amount to remove from the balance based on operation type
        let balanceChange = parseFloat(transaction.amount);
        if (['deposit', 'refund'].includes(transaction.operation_type)) {
            balanceChange = -balanceChange;
        } else {
            balanceChange = balanceChange;
        }
        
        // Update client balance
        const updateBalanceQuery = `
            UPDATE client_solde
            SET total_solde = total_solde + $2,
                last_updated = CURRENT_TIMESTAMP
            WHERE client_id = $1 AND userid = $3
            RETURNING *
        `;
        
        await client.query(
            updateBalanceQuery,
            [transaction.client_id, balanceChange, userId]
        );
        
        // Delete the transaction
        const deleteTransactionQuery = `
            DELETE FROM client_solde_details
            WHERE id = $1 AND userid = $2
            RETURNING *
        `;
        
        const deleteResult = await client.query(deleteTransactionQuery, [transactionId, userId]);
        
        await client.query('COMMIT');
        
        res.json({
            message: "Transaction deleted successfully",
            deleted_transaction: deleteResult.rows[0]
        });
    } catch (error) {
        await client.query('ROLLBACK');
        console.error("Error deleting transaction:", error);
        res.status(500).json({ error: "Internal Server Error", details: error.message });
    } finally {
        client.release();
    }
});

module.exports = router;
