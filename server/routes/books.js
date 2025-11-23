const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all books (public)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM books ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

// Get single book (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM books WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching book:', error);
        res.status(500).json({ error: 'Failed to fetch book' });
    }
});

// Create new book (admin only)
router.post('/',
    authenticateToken,
    requireAdmin,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('author').trim().notEmpty().withMessage('Author is required'),
        body('description').optional(),
        body('cover_url').optional().isURL().withMessage('Invalid cover URL'),
        body('pdf_url').optional().isURL().withMessage('Invalid PDF URL'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, author, description, cover_url, pdf_url } = req.body;

        try {
            const result = await pool.query(
                `INSERT INTO books (title, author, description, cover_url, pdf_url) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                [title, author, description, cover_url, pdf_url]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating book:', error);
            res.status(500).json({ error: 'Failed to create book' });
        }
    }
);

// Update book (admin only)
router.put('/:id',
    authenticateToken,
    requireAdmin,
    [
        body('title').optional().trim().notEmpty(),
        body('author').optional().trim().notEmpty(),
        body('description').optional(),
        body('cover_url').optional().isURL(),
        body('pdf_url').optional().isURL(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { title, author, description, cover_url, pdf_url } = req.body;

        try {
            const result = await pool.query(
                `UPDATE books 
         SET title = COALESCE($1, title),
             author = COALESCE($2, author),
             description = COALESCE($3, description),
             cover_url = COALESCE($4, cover_url),
             pdf_url = COALESCE($5, pdf_url),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
                [title, author, description, cover_url, pdf_url, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Book not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating book:', error);
            res.status(500).json({ error: 'Failed to update book' });
        }
    }
);

// Delete book (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

module.exports = router;
