const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { isWordFile, convertWordBufferToPdf } = require('../services/docConverter');

const router = express.Router();

const booksUploadsDir = path.join(__dirname, '..', 'uploads', 'books');

// Memory storage: Word uploads need conversion to PDF before they're
// written to disk, so the file is buffered and persisted manually below.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        const ext = path.extname(file.originalname).toLowerCase();
        const isPdf = file.mimetype === 'application/pdf' || ext === '.pdf';
        const isWord = isWordFile(file.originalname, file.mimetype);
        if (!isPdf && !isWord) {
            return cb(new Error('يجب أن يكون الملف بصيغة PDF أو Word (doc/docx)'));
        }
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

// Persists the uploaded book file to disk as a PDF, converting Word documents first.
const persistBookFile = async (file) => {
    const ext = path.extname(file.originalname) || '.pdf';
    const safeBase = path
        .basename(file.originalname, ext)
        .replace(/[^\p{L}\p{N}._-]+/gu, '_')
        .slice(0, 60) || 'book';
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;

    if (isWordFile(file.originalname, file.mimetype)) {
        const pdfBuffer = await convertWordBufferToPdf(file.buffer);
        const filename = `${safeBase}-${unique}.pdf`;
        fs.writeFileSync(path.join(booksUploadsDir, filename), pdfBuffer);
        return filename;
    }

    const filename = `${safeBase}-${unique}${ext.toLowerCase()}`;
    fs.writeFileSync(path.join(booksUploadsDir, filename), file.buffer);
    return filename;
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
            return res.status(400).json({ errors: errors.array() });
        }

        if (!req.file) {
            return res.status(400).json({ error: 'يجب رفع ملف PDF أو Word للكتاب' });
        }

        const { title, author, description, category, pages, publisher, language } = req.body;

        let filename;
        try {
            filename = await persistBookFile(req.file);
        } catch (error) {
            console.error('Error processing uploaded file:', error);
            return res.status(400).json({ error: error.message || 'فشل معالجة الملف المرفوع' });
        }
        const pdfUrl = buildPublicPdfUrl(req, filename);

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
            deleteFileIfLocal(pdfUrl);
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
            return res.status(400).json({ errors: errors.array() });
        }

        const { id } = req.params;
        const { title, author, description, category, pages, publisher, language } = req.body;

        let newPdfUrl = null;
        if (req.file) {
            try {
                const filename = await persistBookFile(req.file);
                newPdfUrl = buildPublicPdfUrl(req, filename);
            } catch (error) {
                console.error('Error processing uploaded file:', error);
                return res.status(400).json({ error: error.message || 'فشل معالجة الملف المرفوع' });
            }
        }

        try {
            const existing = await pool.query('SELECT pdf_url FROM books WHERE id = $1', [id]);
            if (existing.rows.length === 0) {
                if (newPdfUrl) deleteFileIfLocal(newPdfUrl);
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
            if (newPdfUrl) deleteFileIfLocal(newPdfUrl);
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

// Save reading progress for an anonymous session
router.post('/:id/progress', async (req, res) => {
    try {
        const { id } = req.params;
        const { sessionId, page } = req.body;

        if (!sessionId || typeof sessionId !== 'string') {
            return res.status(400).json({ error: 'sessionId is required' });
        }
        const lastPage = parseInt(page, 10);
        if (!Number.isInteger(lastPage) || lastPage < 1) {
            return res.status(400).json({ error: 'page must be a positive integer' });
        }

        const result = await pool.query(
            `INSERT INTO reading_progress (book_id, session_id, last_page)
             VALUES ($1, $2, $3)
             ON CONFLICT (book_id, session_id)
             DO UPDATE SET last_page = EXCLUDED.last_page, updated_at = CURRENT_TIMESTAMP
             RETURNING last_page`,
            [id, sessionId, lastPage]
        );

        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error saving reading progress:', error);
        res.status(500).json({ error: 'Failed to save reading progress' });
    }
});

// Fetch reading progress for an anonymous session
router.get('/:id/progress', async (req, res) => {
    try {
        const { id } = req.params;
        const { sessionId } = req.query;

        if (!sessionId) {
            return res.status(400).json({ error: 'sessionId is required' });
        }

        const result = await pool.query(
            'SELECT last_page FROM reading_progress WHERE book_id = $1 AND session_id = $2',
            [id, sessionId]
        );

        res.json({ last_page: result.rows[0]?.last_page || 1 });
    } catch (error) {
        console.error('Error fetching reading progress:', error);
        res.status(500).json({ error: 'Failed to fetch reading progress' });
    }
});

module.exports = router;
