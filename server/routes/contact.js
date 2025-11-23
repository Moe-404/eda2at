const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all contact messages (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM contacts ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching contacts:', error);
        res.status(500).json({ error: 'Failed to fetch contacts' });
    }
});

// Submit contact form (public)
router.post('/',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().withMessage('Valid email is required'),
        body('message').trim().notEmpty().withMessage('Message is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { name, email, message } = req.body;

        try {
            const result = await pool.query(
                `INSERT INTO contacts (name, email, message) 
         VALUES ($1, $2, $3) 
         RETURNING *`,
                [name, email, message]
            );

            res.status(201).json({
                message: 'Message sent successfully',
                id: result.rows[0].id
            });
        } catch (error) {
            console.error('Error submitting contact:', error);
            res.status(500).json({ error: 'Failed to send message' });
        }
    }
);

// Update contact status (admin only)
router.patch('/:id/status',
    authenticateToken,
    requireAdmin,
    [
        body('status').isIn(['new', 'read', 'replied']).withMessage('Invalid status'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { status } = req.body;

        try {
            const result = await pool.query(
                'UPDATE contacts SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Contact not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating contact:', error);
            res.status(500).json({ error: 'Failed to update contact' });
        }
    }
);

// Delete contact (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM contacts WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Contact not found' });
        }

        res.json({ message: 'Contact deleted successfully' });
    } catch (error) {
        console.error('Error deleting contact:', error);
        res.status(500).json({ error: 'Failed to delete contact' });
    }
});

module.exports = router;
