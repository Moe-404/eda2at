const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();

const pool = require('./config/db');
const authRoutes = require('./routes/auth');
const booksRoutes = require('./routes/books');
const articlesRoutes = require('./routes/articles');
const videosRoutes = require('./routes/videos');
const consultationsRoutes = require('./routes/consultations');
const contactRoutes = require('./routes/contact');
const teamRoutes = require('./routes/team');

const app = express();
const PORT = process.env.PORT || 5000;

// Render/Vercel terminate TLS at a proxy. Without this, req.protocol reports
// 'http' and the absolute upload URLs we hand the frontend get blocked as
// mixed content on an https page.
app.set('trust proxy', 1);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const uploadsDir = path.join(__dirname, 'uploads');
const booksUploadsDir = path.join(uploadsDir, 'books');
if (!fs.existsSync(booksUploadsDir)) {
    fs.mkdirSync(booksUploadsDir, { recursive: true });
}

// Books PDFs are meant to be read in the embedded viewer, not saved locally.
// This is a deterrent, not a guarantee - a determined visitor can still
// capture rendered pages, but it removes the one-click "save as" affordance.
app.use('/uploads/books', (req, res, next) => {
    if (req.path.toLowerCase().endsWith('.pdf')) {
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'private, no-store');
    }
    next();
});

app.use('/uploads', express.static(uploadsDir));

// Request logging
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/books', booksRoutes);
app.use('/api/articles', articlesRoutes);
app.use('/api/videos', videosRoutes);
app.use('/api/consultations', consultationsRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/team', teamRoutes);

// Health check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', message: 'Server is running' });
});

// SEO: robots.txt
app.get('/robots.txt', (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
        `User-agent: *\nAllow: /\nDisallow: /admin\nDisallow: /api\n\nSitemap: ${host}/sitemap.xml\n`
    );
});

// SEO: dynamic sitemap.xml
app.get('/sitemap.xml', async (req, res) => {
    const host = `${req.protocol}://${req.get('host')}`;
    const staticPaths = ['/', '/about', '/books', '/articles', '/videos', '/consultations', '/contact', '/team'];
    const now = new Date().toISOString();

    let dynamicUrls = '';
    try {
        const [articles, books, videos] = await Promise.all([
            pool.query('SELECT id, updated_at, created_at FROM articles'),
            pool.query('SELECT id, updated_at, created_at FROM books'),
            pool.query('SELECT id, updated_at, created_at FROM videos'),
        ]);

        const buildLoc = (prefix, rows) =>
            rows.rows
                .map((r) => {
                    const lastmod = (r.updated_at || r.created_at || new Date()).toISOString();
                    return `  <url><loc>${host}${prefix}/${r.id}</loc><lastmod>${lastmod}</lastmod></url>`;
                })
                .join('\n');

        dynamicUrls = [
            buildLoc('/articles', articles),
            buildLoc('/books', books),
            buildLoc('/videos', videos),
        ]
            .filter(Boolean)
            .join('\n');
    } catch (err) {
        console.error('Sitemap DB error:', err.message);
    }

    const staticXml = staticPaths
        .map(
            (p) =>
                `  <url><loc>${host}${p}</loc><lastmod>${now}</lastmod><changefreq>weekly</changefreq></url>`
        )
        .join('\n');

    const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${staticXml}\n${dynamicUrls}\n</urlset>`;

    res.type('application/xml').send(xml);
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({ error: 'Route not found' });
});

// Error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    console.log(`Health check: http://localhost:${PORT}/health`);
});
