const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const videosDir = path.join(__dirname, '..', 'uploads', 'videos');
if (!fs.existsSync(videosDir)) fs.mkdirSync(videosDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, videosDir),
    filename: (req, file, cb) => {
        const ext = (path.extname(file.originalname) || '.bin').toLowerCase();
        const prefix = file.fieldname === 'video' ? 'vid' : 'thumb';
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${prefix}-${unique}${ext}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB for videos
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'thumbnail') {
            if (!file.mimetype.startsWith('image/')) {
                return cb(new Error('يجب أن تكون الصورة المصغّرة صورة صالحة'));
            }
        }
        if (file.fieldname === 'video') {
            const isVideo = file.mimetype.startsWith('video/')
                || ['.mp4', '.webm', '.ogg', '.mov'].includes(
                    path.extname(file.originalname).toLowerCase()
                );
            if (!isVideo) return cb(new Error('يجب أن يكون الملف فيديو صالحاً'));
        }
        cb(null, true);
    },
});

const handleUpload = (req, res, next) => {
    upload.fields([
        { name: 'thumbnail', maxCount: 1 },
        { name: 'video', maxCount: 1 },
    ])(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
};

const buildUrl = (req, filename) => {
    const host = `${req.protocol}://${req.get('host')}`;
    return `${host}/uploads/videos/${filename}`;
};

const deleteLocalFile = (url) => {
    if (!url) return;
    const marker = '/uploads/videos/';
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const filename = url.substring(idx + marker.length);
    const filePath = path.join(videosDir, filename);
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
    }
};

const cleanupFiles = (files) => {
    if (!files) return;
    Object.values(files).flat().forEach((f) => {
        try { fs.unlinkSync(f.path); } catch (_) {}
    });
};

// Get all videos (public) - supports search, category, pagination
router.get('/', async (req, res) => {
    try {
        const { search = '', category = '', page = 1, limit = 12 } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
        const offset = (pageNum - 1) * lim;

        const conditions = [];
        const params = [];

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`title ILIKE $${params.length}`);
        }
        if (category) {
            params.push(category);
            conditions.push(`category = $${params.length}`);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM videos ${where}`, params);
        const total = countResult.rows[0].total;

        params.push(lim, offset);
        const result = await pool.query(
            `SELECT * FROM videos ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
            params
        );

        res.json({
            data: result.rows,
            pagination: {
                page: pageNum,
                limit: lim,
                total,
                totalPages: Math.ceil(total / lim),
            },
        });
    } catch (error) {
        console.error('Error fetching videos:', error);
        res.status(500).json({ error: 'Failed to fetch videos' });
    }
});

router.get('/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query('SELECT * FROM videos WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error fetching video:', error);
        res.status(500).json({ error: 'Failed to fetch video' });
    }
});

router.post('/',
    authenticateToken,
    requireAdmin,
    handleUpload,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('youtube_id').optional({ checkFalsy: true }),
        body('duration').optional({ checkFalsy: true }),
        body('category').optional({ checkFalsy: true }),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            cleanupFiles(req.files);
            return res.status(400).json({ errors: errors.array() });
        }

        const thumbFile = req.files?.['thumbnail']?.[0];
        const videoFile = req.files?.['video']?.[0];
        const { title, youtube_id, duration, category } = req.body;

        if (!youtube_id?.trim() && !videoFile) {
            cleanupFiles(req.files);
            return res.status(400).json({ error: 'يجب إدخال معرف YouTube أو رفع ملف فيديو' });
        }

        const thumbnailUrl = thumbFile ? buildUrl(req, thumbFile.filename) : null;
        const videoUrl = videoFile ? buildUrl(req, videoFile.filename) : null;

        try {
            const result = await pool.query(
                `INSERT INTO videos (title, youtube_id, thumbnail_url, video_url, duration, category)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING *`,
                [title, youtube_id || null, thumbnailUrl, videoUrl, duration || null, category || null]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating video:', error);
            cleanupFiles(req.files);
            res.status(500).json({ error: 'Failed to create video' });
        }
    }
);

router.put('/:id',
    authenticateToken,
    requireAdmin,
    handleUpload,
    async (req, res) => {
        const { id } = req.params;
        const thumbFile = req.files?.['thumbnail']?.[0];
        const videoFile = req.files?.['video']?.[0];
        const { title, youtube_id, duration, category } = req.body;
        const newThumb = thumbFile ? buildUrl(req, thumbFile.filename) : null;
        const newVideoUrl = videoFile ? buildUrl(req, videoFile.filename) : null;

        try {
            const existing = await pool.query('SELECT thumbnail_url, video_url FROM videos WHERE id = $1', [id]);
            if (existing.rows.length === 0) {
                cleanupFiles(req.files);
                return res.status(404).json({ error: 'Video not found' });
            }

            const result = await pool.query(
                `UPDATE videos
                 SET title = COALESCE($1, title),
                     youtube_id = COALESCE($2, youtube_id),
                     thumbnail_url = COALESCE($3, thumbnail_url),
                     video_url = COALESCE($4, video_url),
                     duration = COALESCE($5, duration),
                     category = COALESCE($6, category),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $7
                 RETURNING *`,
                [title || null, youtube_id || null, newThumb, newVideoUrl, duration || null, category || null, id]
            );

            if (newThumb) deleteLocalFile(existing.rows[0].thumbnail_url);
            if (newVideoUrl) deleteLocalFile(existing.rows[0].video_url);

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating video:', error);
            cleanupFiles(req.files);
            res.status(500).json({ error: 'Failed to update video' });
        }
    }
);

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM videos WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Video not found' });
        deleteLocalFile(result.rows[0].thumbnail_url);
        deleteLocalFile(result.rows[0].video_url);
        res.json({ message: 'Video deleted successfully' });
    } catch (error) {
        console.error('Error deleting video:', error);
        res.status(500).json({ error: 'Failed to delete video' });
    }
});

module.exports = router;
