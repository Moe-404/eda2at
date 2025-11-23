const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all consultations (admin only)
router.get('/', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM consultations ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching consultations:', error);
        res.status(500).json({ error: 'Failed to fetch consultations' });
    }
});

// Submit consultation (public)
router.post('/',
    [
        body('type').isIn(['family', 'medical']).withMessage('Type must be family or medical'),
        body('name').optional(),
        body('email').isEmail().withMessage('Valid email is required'),
        body('subject').trim().notEmpty().withMessage('Subject is required'),
        body('details').trim().notEmpty().withMessage('Details are required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { type, name, email, subject, details } = req.body;

        try {
            const result = await pool.query(
                `INSERT INTO consultations (type, name, email, subject, details) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                [type, name, email, subject, details]
            );

            res.status(201).json({
                message: 'Consultation submitted successfully',
                id: result.rows[0].id
            });
        } catch (error) {
            console.error('Error submitting consultation:', error);
            res.status(500).json({ error: 'Failed to submit consultation' });
        }
    }
);

// Update consultation status (admin only)
router.patch('/:id/status',
    authenticateToken,
    requireAdmin,
    [
        body('status').isIn(['pending', 'reviewed', 'replied']).withMessage('Invalid status'),
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
                'UPDATE consultations SET status = $1 WHERE id = $2 RETURNING *',
                [status, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Consultation not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating consultation:', error);
            res.status(500).json({ error: 'Failed to update consultation' });
        }
    }
);

// Delete consultation (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM consultations WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Consultation not found' });
        }

        res.json({ message: 'Consultation deleted successfully' });
    } catch (error) {
        console.error('Error deleting consultation:', error);
        res.status(500).json({ error: 'Failed to delete consultation' });
    }
});

module.exports = router;
