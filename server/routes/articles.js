const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all articles (public)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM articles ORDER BY published_date DESC, created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching articles:', error);
        res.status(500).json({ error: 'Failed to fetch articles' });
    }
});

// Get single article (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM articles WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching article:', error);
        res.status(500).json({ error: 'Failed to fetch article' });
    }
});

// Create new article (admin only)
router.post('/',
    authenticateToken,
    requireAdmin,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('excerpt').optional(),
        body('content').trim().notEmpty().withMessage('Content is required'),
        body('author').optional(),
        body('published_date').optional().isDate(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, excerpt, content, author, published_date } = req.body;

        try {
            const result = await pool.query(
                `INSERT INTO articles (title, excerpt, content, author, published_date) 
         VALUES ($1, $2, $3, $4, $5) 
         RETURNING *`,
                [title, excerpt, content, author, published_date]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating article:', error);
            res.status(500).json({ error: 'Failed to create article' });
        }
    }
);

// Update article (admin only)
router.put('/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        const { id } = req.params;
        const { title, excerpt, content, author, published_date } = req.body;

        try {
            const result = await pool.query(
                `UPDATE articles 
         SET title = COALESCE($1, title),
             excerpt = COALESCE($2, excerpt),
             content = COALESCE($3, content),
             author = COALESCE($4, author),
             published_date = COALESCE($5, published_date),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $6
         RETURNING *`,
                [title, excerpt, content, author, published_date, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Article not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating article:', error);
            res.status(500).json({ error: 'Failed to update article' });
        }
    }
);

// Delete article (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Article not found' });
        }

        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

module.exports = router;
