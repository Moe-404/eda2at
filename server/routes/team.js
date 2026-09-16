const express = require('express');
const { body, validationResult } = require('express-validator');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const pool = require('../config/db');
const { authenticateToken, requireAdmin } = require('../middleware/auth');
const { decodeOriginalName } = require('../services/uploadNames');

const router = express.Router();

const teamUploadsDir = path.join(__dirname, '..', 'uploads', 'team');
if (!fs.existsSync(teamUploadsDir)) {
    fs.mkdirSync(teamUploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, teamUploadsDir),
    filename: (req, file, cb) => {
        const originalName = decodeOriginalName(file.originalname);
        const ext = path.extname(originalName) || '.jpg';
        const safeBase = path
            .basename(originalName, ext)
            .replace(/[^\p{L}\p{N}._-]+/gu, '_')
            .slice(0, 60) || 'member';
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${safeBase}-${unique}${ext.toLowerCase()}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 5 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (!/\.(jpg|jpeg|png|webp|gif)$/i.test(path.extname(file.originalname))) {
            return cb(new Error('يجب أن تكون الصورة بصيغة JPG أو PNG أو WebP'));
        }
        cb(null, true);
    },
});

const handleMulter = (req, res, next) => {
    upload.single('photo')(req, res, (err) => {
        if (err) return res.status(400).json({ error: err.message });
        next();
    });
};

const buildPhotoUrl = (req, filename) =>
    `${req.protocol}://${req.get('host')}/uploads/team/${filename}`;

const deletePhoto = (photoUrl) => {
    if (!photoUrl) return;
    const marker = '/uploads/team/';
    const idx = photoUrl.indexOf(marker);
    if (idx === -1) return;
    const filePath = path.join(teamUploadsDir, photoUrl.substring(idx + marker.length));
    if (fs.existsSync(filePath)) {
        try { fs.unlinkSync(filePath); } catch (_) {}
    }
};

// ── PUBLIC ────────────────────────────────────────────────────────────────────

// GET /api/team  →  departments with nested members
router.get('/', async (req, res) => {
    try {
        const [depts, members] = await Promise.all([
            pool.query('SELECT * FROM team_departments ORDER BY display_order ASC, id ASC'),
            pool.query('SELECT * FROM team_members ORDER BY display_order ASC, id ASC'),
        ]);
        const result = depts.rows.map((d) => ({
            ...d,
            members: members.rows.filter((m) => m.department_id === d.id),
        }));
        res.json({ departments: result });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch team data' });
    }
});

// GET /api/team/members/:id  →  single member detail (public)
router.get('/members/:id', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM team_members WHERE id = $1', [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Member not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch member' });
    }
});

// ── DEPARTMENTS (admin) ───────────────────────────────────────────────────────

router.get('/departments', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM team_departments ORDER BY display_order ASC, id ASC');
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch departments' });
    }
});

router.post('/departments', authenticateToken, requireAdmin, [
    body('title').trim().notEmpty().withMessage('عنوان القسم مطلوب'),
    body('display_order').optional().isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { title, display_order = 0 } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO team_departments (title, display_order) VALUES ($1, $2) RETURNING *',
            [title, display_order]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to create department' });
    }
});

router.put('/departments/:id', authenticateToken, requireAdmin, [
    body('title').optional().trim().notEmpty(),
    body('display_order').optional().isInt(),
], async (req, res) => {
    const { id } = req.params;
    const { title, display_order } = req.body;
    try {
        const result = await pool.query(
            `UPDATE team_departments
             SET title = COALESCE($1, title),
                 display_order = COALESCE($2, display_order)
             WHERE id = $3 RETURNING *`,
            [title || null, display_order !== undefined ? parseInt(display_order) : null, id]
        );
        if (!result.rows.length) return res.status(404).json({ error: 'Department not found' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).json({ error: 'Failed to update department' });
    }
});

router.delete('/departments/:id', authenticateToken, requireAdmin, async (req, res) => {
    const { id } = req.params;
    try {
        const check = await pool.query(
            'SELECT COUNT(*)::int AS cnt FROM team_members WHERE department_id = $1', [id]
        );
        if (check.rows[0].cnt > 0) {
            return res.status(400).json({ error: 'لا يمكن حذف القسم لأنه يحتوي على أعضاء' });
        }
        const result = await pool.query('DELETE FROM team_departments WHERE id = $1 RETURNING *', [id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Department not found' });
        res.json({ message: 'Department deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete department' });
    }
});

// ── MEMBERS (admin) ───────────────────────────────────────────────────────────

router.get('/members', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT tm.*, td.title AS department_title
             FROM team_members tm
             LEFT JOIN team_departments td ON tm.department_id = td.id
             ORDER BY td.display_order ASC, tm.display_order ASC, tm.id ASC`
        );
        res.json(result.rows);
    } catch (err) {
        res.status(500).json({ error: 'Failed to fetch members' });
    }
});

router.post('/members', authenticateToken, requireAdmin, handleMulter, [
    body('name').trim().notEmpty().withMessage('الاسم مطلوب'),
    body('role').trim().notEmpty().withMessage('المنصب مطلوب'),
    body('department_id').notEmpty().withMessage('القسم مطلوب').isInt(),
    body('short_bio').optional({ checkFalsy: true }),
    body('full_bio').optional({ checkFalsy: true }),
    body('display_order').optional().isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) {}
        return res.status(400).json({ errors: errors.array() });
    }

    const { name, role, department_id, short_bio = '', full_bio = '', display_order = 0 } = req.body;
    const photo_url = req.file ? buildPhotoUrl(req, req.file.filename) : null;

    try {
        const result = await pool.query(
            `INSERT INTO team_members (name, role, department_id, photo_url, short_bio, full_bio, display_order)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [name, role, parseInt(department_id), photo_url, short_bio, full_bio, parseInt(display_order)]
        );
        res.status(201).json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) {}
        res.status(500).json({ error: 'Failed to create member' });
    }
});

router.put('/members/:id', authenticateToken, requireAdmin, handleMulter, [
    body('name').optional().trim().notEmpty(),
    body('role').optional().trim().notEmpty(),
    body('department_id').optional().isInt(),
    body('display_order').optional().isInt(),
], async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) {}
        return res.status(400).json({ errors: errors.array() });
    }

    const { id } = req.params;
    const { name, role, department_id, short_bio, full_bio, display_order } = req.body;
    const newPhotoUrl = req.file ? buildPhotoUrl(req, req.file.filename) : null;

    try {
        const existing = await pool.query('SELECT photo_url FROM team_members WHERE id = $1', [id]);
        if (!existing.rows.length) {
            if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) {}
            return res.status(404).json({ error: 'Member not found' });
        }

        const result = await pool.query(
            `UPDATE team_members SET
                name = COALESCE($1, name),
                role = COALESCE($2, role),
                department_id = COALESCE($3, department_id),
                photo_url = COALESCE($4, photo_url),
                short_bio = COALESCE($5, short_bio),
                full_bio = COALESCE($6, full_bio),
                display_order = COALESCE($7, display_order),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $8 RETURNING *`,
            [
                name || null,
                role || null,
                department_id ? parseInt(department_id) : null,
                newPhotoUrl,
                short_bio !== undefined ? short_bio : null,
                full_bio !== undefined ? full_bio : null,
                display_order !== undefined ? parseInt(display_order) : null,
                id,
            ]
        );

        if (newPhotoUrl) deletePhoto(existing.rows[0].photo_url);
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        if (req.file) try { fs.unlinkSync(req.file.path); } catch (_) {}
        res.status(500).json({ error: 'Failed to update member' });
    }
});

router.delete('/members/:id', authenticateToken, requireAdmin, async (req, res) => {
    try {
        const result = await pool.query('DELETE FROM team_members WHERE id = $1 RETURNING *', [req.params.id]);
        if (!result.rows.length) return res.status(404).json({ error: 'Member not found' });
        deletePhoto(result.rows[0].photo_url);
        res.json({ message: 'Member deleted' });
    } catch (err) {
        res.status(500).json({ error: 'Failed to delete member' });
    }
});

module.exports = router;
