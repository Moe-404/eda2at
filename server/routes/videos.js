const express = require('express');
const { body, validationResult } = require('express-validator');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

// Get all videos (public)
router.get('/', async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT * FROM videos ORDER BY created_at DESC'
        );
        res.json(result.rows);
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

// Get single video (public)
router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM videos WHERE id = $1', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

// Create new video (admin only)
router.post('/',
    authenticateToken,
    requireAdmin,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('youtube_id').trim().notEmpty().withMessage('YouTube ID is required'),
        body('thumbnail_url').optional().isURL(),
        body('duration').optional(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { title, youtube_id, thumbnail_url, duration } = req.body;

        try {
            const result = await pool.query(
                `INSERT INTO videos (title, youtube_id, thumbnail_url, duration) 
         VALUES ($1, $2, $3, $4) 
         RETURNING *`,
                [title, youtube_id, thumbnail_url, duration]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating video:', error);
            res.status(500).json({ error: 'Failed to create video' });
        }
    }
);

// Update video (admin only)
router.put('/:id',
    authenticateToken,
    requireAdmin,
    async (req, res) => {
        const { id } = req.params;
        const { title, youtube_id, thumbnail_url, duration } = req.body;

        try {
            const result = await pool.query(
                `UPDATE videos 
         SET title = COALESCE($1, title),
             youtube_id = COALESCE($2, youtube_id),
             thumbnail_url = COALESCE($3, thumbnail_url),
             duration = COALESCE($4, duration),
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $5
         RETURNING *`,
                [title, youtube_id, thumbnail_url, duration, id]
            );

            if (result.rows.length === 0) {
                return res.status(404).json({ error: 'Video not found' });
            }

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating video:', error);
            res.status(500).json({ error: 'Failed to update video' });
        }
    }
);

// Delete video (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM videos WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Video not found' });
        }

        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

module.exports = router;
