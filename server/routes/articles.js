const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { isWordFile, convertWordBufferToPdf } = require('../services/docConverter');

const router = express.Router();

const articlesUploadsDir = path.join(__dirname, '..', 'uploads', 'articles');
if (!fs.existsSync(articlesUploadsDir)) fs.mkdirSync(articlesUploadsDir, { recursive: true });

// Memory storage: the 'pdf' field may need Word->PDF conversion before it's
// written to disk, so files are buffered and persisted manually below.
const upload = multer({
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
    fileFilter: (req, file, cb) => {
        if (file.fieldname === 'cover' && !file.mimetype.startsWith('image/')) {
            return cb(new Error('يجب أن تكون صورة الغلاف صورة صالحة'));
        }
        if (file.fieldname === 'pdf') {
            const ext = path.extname(file.originalname).toLowerCase();
            const isPdf = file.mimetype === 'application/pdf' || ext === '.pdf';
            const isWord = isWordFile(file.originalname, file.mimetype);
            if (!isPdf && !isWord) {
                return cb(new Error('يجب أن يكون الملف بصيغة PDF أو Word (doc/docx)'));
            }
        }
        cb(null, true);
    },
});

const handleUpload = (req, res, next) => {
    upload.fields([
        { name: 'cover', maxCount: 1 },
        { name: 'pdf', maxCount: 1 },
    ])(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
};

const writeUploadedFile = (filenamePrefix, filename, buffer) => {
    const finalPath = path.join(articlesUploadsDir, filename);
    fs.writeFileSync(finalPath, buffer);
    return filename;
};

// Persists the 'pdf' field to disk, converting Word documents to PDF first.
const persistPdfField = async (file) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    if (isWordFile(file.originalname, file.mimetype)) {
        const pdfBuffer = await convertWordBufferToPdf(file.buffer);
        const filename = `idaat-${unique}.pdf`;
        writeUploadedFile('idaat', filename, pdfBuffer);
        return filename;
    }
    const ext = path.extname(file.originalname).toLowerCase() || '.pdf';
    const filename = `idaat-${unique}${ext}`;
    writeUploadedFile('idaat', filename, file.buffer);
    return filename;
};

const persistCoverField = (file) => {
    const ext = (path.extname(file.originalname) || '.bin').toLowerCase();
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const filename = `cover-${unique}${ext}`;
    writeUploadedFile('cover', filename, file.buffer);
    return filename;
};

const buildFileUrl = (req, filename) => {
    const host = `${req.protocol}://${req.get('host')}`;
    return `${host}/uploads/articles/${filename}`;
};

const deleteLocalFile = (url, folder) => {
    if (!url) return;
    const marker = `/uploads/${folder}/`;
    const idx = url.indexOf(marker);
    if (idx === -1) return;
    const filename = url.substring(idx + marker.length);
    const filePath = path.join(__dirname, '..', 'uploads', folder, filename);
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) { /* ignore */ }
    }
};

// Get all articles (public) - supports search, category, status, pagination
router.get('/', async (req, res) => {
    try {
        const {
            search = '',
            category = '',
            status = '',
            page = 1,
            limit = 12,
        } = req.query;

        const pageNum = Math.max(1, parseInt(page, 10) || 1);
        const lim = Math.min(50, Math.max(1, parseInt(limit, 10) || 12));
        const offset = (pageNum - 1) * lim;

        const conditions = [];
        const params = [];

        if (status) {
            params.push(status);
            conditions.push(`status = $${params.length}`);
        } else if (!req.headers.authorization) {
            conditions.push(`(status = 'published' OR status IS NULL)`);
        }

        if (search) {
            params.push(`%${search}%`);
            conditions.push(`(title ILIKE $${params.length} OR excerpt ILIKE $${params.length} OR author ILIKE $${params.length})`);
        }

        if (category) {
            params.push(category);
            conditions.push(`category = $${params.length}`);
        }

        const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

        const countResult = await pool.query(`SELECT COUNT(*)::int AS total FROM articles ${where}`, params);
        const total = countResult.rows[0].total;

        params.push(lim, offset);
        const result = await pool.query(
            `SELECT * FROM articles ${where} ORDER BY published_date DESC, created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
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
    handleUpload,
    [
        body('title').trim().notEmpty().withMessage('Title is required'),
        body('excerpt').optional({ checkFalsy: true }),
        body('content').optional({ checkFalsy: true }),
        body('author').optional({ checkFalsy: true }),
        body('category').optional({ checkFalsy: true }),
        body('status').optional({ checkFalsy: true }).isIn(['draft', 'published', 'archived']),
        body('published_date').optional({ checkFalsy: true }).isDate(),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const coverFile = req.files?.['cover']?.[0];
        const pdfFile = req.files?.['pdf']?.[0];

        const { title, excerpt, content, author, published_date, category, status } = req.body;

        if (!content?.trim() && !pdfFile) {
            return res.status(400).json({ error: 'يجب إدخال محتوى المقال أو رفع ملف PDF' });
        }

        let coverFilename = null;
        let pdfFilename = null;
        try {
            if (coverFile) coverFilename = persistCoverField(coverFile);
            if (pdfFile) pdfFilename = await persistPdfField(pdfFile);
        } catch (error) {
            console.error('Error processing uploaded file:', error);
            return res.status(400).json({ error: error.message || 'فشل معالجة الملف المرفوع' });
        }

        const coverUrl = coverFilename ? buildFileUrl(req, coverFilename) : null;
        const pdfUrl = pdfFilename ? buildFileUrl(req, pdfFilename) : null;

        try {
            const result = await pool.query(
                `INSERT INTO articles (title, excerpt, content, author, published_date, category, status, cover_url, pdf_url)
                 VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
                 RETURNING *`,
                [title, excerpt || null, content || '', author || null,
                 published_date || null, category || null, status || 'published', coverUrl, pdfUrl]
            );
            res.status(201).json(result.rows[0]);
        } catch (error) {
            console.error('Error creating article:', error);
            if (coverFilename) deleteLocalFile(buildFileUrl(req, coverFilename), 'articles');
            if (pdfFilename) deleteLocalFile(buildFileUrl(req, pdfFilename), 'articles');
            res.status(500).json({ error: 'Failed to create article' });
        }
    }
);

// Update article (admin only)
router.put('/:id',
    authenticateToken,
    requireAdmin,
    handleUpload,
    async (req, res) => {
        const { id } = req.params;
        const coverFile = req.files?.['cover']?.[0];
        const pdfFile = req.files?.['pdf']?.[0];
        const { title, excerpt, content, author, published_date, category, status } = req.body;

        let newCoverFilename = null;
        let newPdfFilename = null;
        try {
            if (coverFile) newCoverFilename = persistCoverField(coverFile);
            if (pdfFile) newPdfFilename = await persistPdfField(pdfFile);
        } catch (error) {
            console.error('Error processing uploaded file:', error);
            return res.status(400).json({ error: error.message || 'فشل معالجة الملف المرفوع' });
        }

        const newCoverUrl = newCoverFilename ? buildFileUrl(req, newCoverFilename) : null;
        const newPdfUrl = newPdfFilename ? buildFileUrl(req, newPdfFilename) : null;

        try {
            const existing = await pool.query('SELECT cover_url, pdf_url FROM articles WHERE id = $1', [id]);
            if (existing.rows.length === 0) {
                if (newCoverFilename) deleteLocalFile(newCoverUrl, 'articles');
                if (newPdfFilename) deleteLocalFile(newPdfUrl, 'articles');
                return res.status(404).json({ error: 'Article not found' });
            }

            const result = await pool.query(
                `UPDATE articles
                 SET title = COALESCE($1, title),
                     excerpt = COALESCE($2, excerpt),
                     content = COALESCE($3, content),
                     author = COALESCE($4, author),
                     published_date = COALESCE($5, published_date),
                     category = COALESCE($6, category),
                     status = COALESCE($7, status),
                     cover_url = COALESCE($8, cover_url),
                     pdf_url = COALESCE($9, pdf_url),
                     updated_at = CURRENT_TIMESTAMP
                 WHERE id = $10
                 RETURNING *`,
                [title || null, excerpt || null, content || null, author || null,
                 published_date || null, category || null, status || null,
                 newCoverUrl, newPdfUrl, id]
            );

            if (newCoverUrl) deleteLocalFile(existing.rows[0].cover_url, 'articles');
            if (newPdfUrl) deleteLocalFile(existing.rows[0].pdf_url, 'articles');

            res.json(result.rows[0]);
        } catch (error) {
            console.error('Error updating article:', error);
            if (newCoverFilename) deleteLocalFile(newCoverUrl, 'articles');
            if (newPdfFilename) deleteLocalFile(newPdfUrl, 'articles');
            res.status(500).json({ error: 'Failed to update article' });
        }
    }
);

// Delete article (admin only)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const result = await pool.query('DELETE FROM articles WHERE id = $1 RETURNING *', [id]);
        if (result.rows.length === 0) return res.status(404).json({ error: 'Article not found' });
        deleteLocalFile(result.rows[0].cover_url, 'articles');
        deleteLocalFile(result.rows[0].pdf_url, 'articles');
        res.json({ message: 'Article deleted successfully' });
    } catch (error) {
        console.error('Error deleting article:', error);
        res.status(500).json({ error: 'Failed to delete article' });
    }
});

module.exports = router;
