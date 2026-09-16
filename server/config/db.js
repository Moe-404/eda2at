const { Pool } = require('pg');
require('dotenv').config();

// Support both connection string and individual parameters
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false
      },
      keepAlive: true,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    }
    : {
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 5432,
      database: process.env.DB_NAME || 'postgres',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
    }
);

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

// Neon (and most managed Postgres) drop idle server-side connections, which
// makes pg emit 'error' on a pooled idle client. Log it and let pg-pool
// discard that client and open a fresh one - never kill the process.
pool.on('error', (err) => {
  console.error('Unexpected error on idle client:', err.message);
});

module.exports = pool;
