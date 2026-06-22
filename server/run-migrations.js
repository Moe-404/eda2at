require('dotenv').config();
const pool = require('./config/db');
const fs = require('fs');
const path = require('path');

(async () => {
    const sql = fs.readFileSync(path.join(__dirname, 'db', 'schema.sql'), 'utf8');
    const statements = sql
        .split(';')
        .map((s) => s.trim())
        .filter((s) => s && !s.startsWith('--'));

    console.log(`Running ${statements.length} statements...`);
    try {
        for (const stmt of statements) {
            try {
                await pool.query(stmt);
                const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
                console.log('  ✓', preview);
            } catch (err) {
                const preview = stmt.replace(/\s+/g, ' ').slice(0, 80);
                console.log('  ✗', preview, '-', err.message);
            }
        }
        console.log('\nMigration complete.');
    } finally {
        await pool.end();
    }
})();
