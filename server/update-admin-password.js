const { Pool } = require('pg');
const bcrypt = require('bcrypt');

const pool = new Pool({
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    database: process.env.DB_NAME || 'sabeel_db',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
});

async function updateAdminPassword() {
    try {
        // Generate new hash for 'admin123'
        const hash = await bcrypt.hash('admin123', 10);
        console.log('Generated hash:', hash);

        // Update the admin user password
        const result = await pool.query(
            'UPDATE users SET password_hash = $1 WHERE username = $2 RETURNING username',
            [hash, 'admin']
        );

        if (result.rows.length > 0) {
            console.log('✅ Successfully updated admin password!');
            console.log('You can now login with: admin / admin123');
        } else {
            console.log('❌ Admin user not found. Creating new admin user...');

            // Insert new admin user
            await pool.query(
                `INSERT INTO users (username, email, password_hash, role) 
         VALUES ($1, $2, $3, $4)`,
                ['admin', 'admin@sabeel-eda2at.com', hash, 'admin']
            );
            console.log('✅ Created new admin user!');
        }

        await pool.end();
    } catch (error) {
        console.error('Error:', error.message);
        process.exit(1);
    }
}

updateAdminPassword();
