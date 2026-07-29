const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

const router = express.Router();

const booksUploadsDir = path.join(__dirname, '..', 'uploads', 'books');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, booksUploadsDir),
    filename: (req, file, cb) => {
        const ext = path.extname(file.originalname) || '.pdf';
        const safeBase = path
            .basename(file.originalname, ext)
            .replace(/[^\p{L}\p{N}._-]+/gu, '_')
            .slice(0, 60) || 'book';
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${safeBase}-${unique}${ext.toLowerCase()}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const isPdf =
            file.mimetype === 'application/pdf' ||
            path.extname(file.originalname).toLowerCase() === '.pdf';
        if (!isPdf) return cb(new Error('يجب أن يكون الملف بصيغة PDF'));
        cb(null, true);
    },
});

const buildPublicPdfUrl = (req, filename) => {
    const host = `${req.protocol}://${req.get('host')}`;
    return `${host}/uploads/books/${filename}`;
};

const deleteFileIfLocal = (pdfUrl) => {
    if (!pdfUrl) return;
    const marker = '/uploads/books/';
    const idx = pdfUrl.indexOf(marker);
    if (idx === -1) return;
    const filename = pdfUrl.substring(idx + marker.length);
    const filePath = path.join(booksUploadsDir, filename);
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
    }
};

const handleMulter = (req, res, next) => {
    upload.single('pdf')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message || 'فشل رفع الملف' });
        next();
    });
};

// Get all books (public) - supports search, category, pagination
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
            conditions.push(`(title ILIKE $${params.length} OR author ILIKE $${params.length} OR description ILIKE $${params.length})`);
        }
        if (category) {
            params.push(category);
            conditions.push(`category = $${params.length}`);
        }
        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM books ${where}`, params);
        const total = countResult.rows[0].total;

        params.push(lim, offset);
        const result = await pool.query(
            `SELECT * FROM books ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
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
        console.error('Error fetching books:', error);
        res.status(500).json({ error: 'Failed to fetch books' });
    }
});

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

router.post('/',
    authenticateToken,
    requireAdmin,
    handleMulter,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('author').trim().notEmpty().withMessage('Author is required'),
        body('description').optional({ checkFalsy: true }),
        body('category').optional({ checkFalsy: true }),
        body('pages').optional({ checkFalsy: true }).isInt({ min: 0 }).toInt(),
        body('publisher').optional().trim(),
        body('language').optional().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'يجب رفع ملف PDF للكتاب' });
        }

        const { title, author, description, category, pages, publisher, language } = req.body;
        const pdfUrl = buildPublicPdfUrl(req, req.file.filename);

        try {
            const result = await pool.query(
                `INSERT INTO books (title, author, description, pdf_url, category, pages, publisher, language)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
                 RETURNING *`,
                [
                    title,
                    author,
                    description || null,
                    pdfUrl,
                    category || null,
                    pages ? parseInt(pages, 10) : 0,
                    publisher || 'دار نشر سبيل الإضاءات',
                    language || 'العربية'
                ]
            );

            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating book:', error);
            try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
            res.status(500).json({ error: 'Failed to create book' });
        }
    }
);

router.put('/:id',
    authenticateToken,
    requireAdmin,
    handleMulter,
    [
        body('title').optional().trim().notEmpty(),
        body('author').optional().trim().notEmpty(),
        body('description').optional({ checkFalsy: true }),
        body('category').optional({ checkFalsy: true }),
        body('pages').optional({ checkFalsy: true }).isInt({ min: 0 }).toInt(),
        body('publisher').optional().trim(),
        body('language').optional().trim(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { title, author, description, category, pages, publisher, language } = req.body;
        const newPdfUrl = req.file ? buildPublicPdfUrl(req, req.file.filename) : null;

        try {
            const existing = await pool.query('SELECT pdf_url FROM books WHERE id = $1', [id]);
            if (existing.rows.length === 0) {
                if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
                return res.status(404).json({ error: 'Book not found' });
            }

            const result = await pool.query(
                `UPDATE books
                 SET title = COALESCE($1, title),
                     author = COALESCE($2, author),
                     description = COALESCE($3, description),
                     category = COALESCE($4, category),
                     pdf_url = COALESCE($5, pdf_url),
                     pages = COALESCE($6, pages),
                     publisher = COALESCE($7, publisher),
                     language = COALESCE($8, language),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $9
                 RETURNING *`,
                [
                    title || null,
                    author || null,
                    description || null,
                    category || null,
                    newPdfUrl,
                    pages !== undefined ? parseInt(pages, 10) : null,
                    publisher !== undefined ? publisher : null,
                    language !== undefined ? language : null,
                    id
                ]
            );

            if (newPdfUrl) deleteFileIfLocal(existing.rows[0].pdf_url);

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating book:', error);
            if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) { /* ignore */ }
            res.status(500).json({ error: 'Failed to update book' });
        }
    }
);

router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;

    try {
        const result = await pool.query('DELETE FROM books WHERE id = $1 RETURNING *', [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }

        deleteFileIfLocal(result.rows[0].pdf_url);

        res.json({ message: 'Book deleted successfully' });
    } catch (error) {
        console.error('Error deleting book:', error);
        res.status(500).json({ error: 'Failed to delete book' });
    }
});

// Increment download count
router.post('/:id/download', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE books SET download_count = COALESCE(download_count, 0) + 1 WHERE id = $1 RETURNING download_count',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error incrementing download count:', error);
        res.status(500).json({ error: 'Failed to update download count' });
    }
});

// Increment reading count
router.post('/:id/read', async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query(
            'UPDATE books SET reading_count = COALESCE(reading_count, 0) + 1 WHERE id = $1 RETURNING reading_count',
            [id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Book not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error incrementing reading count:', error);
        res.status(500).json({ error: 'Failed to update reading count' });
    }
});

module.exports = router;
