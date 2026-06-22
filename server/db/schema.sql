-- Create database tables for Sabeel Al-Eda'at

-- Users table (for admin authentication)
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    role VARCHAR(20) DEFAULT 'admin',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE IF NOT EXISTS books (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    author VARCHAR(255) NOT NULL,
    description TEXT,
    cover_url VARCHAR(500),
    pdf_url VARCHAR(500),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Articles table
CREATE TABLE IF NOT EXISTS articles (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author VARCHAR(255) DEFAULT 'د. أحمد',
    published_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Videos table
CREATE TABLE IF NOT EXISTS videos (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    youtube_id VARCHAR(50) NOT NULL,
    thumbnail_url VARCHAR(500),
    duration VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Consultations table
CREATE TABLE IF NOT EXISTS consultations (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL, -- 'family' or 'medical'
    name VARCHAR(255),
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    details TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'reviewed', 'replied'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Contacts table
CREATE TABLE IF NOT EXISTS contacts (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'new', -- 'new', 'read', 'replied'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add category/status/slug/cover columns (idempotent)
ALTER TABLE books ADD COLUMN IF NOT EXISTS category VARCHAR(60);
ALTER TABLE books ADD COLUMN IF NOT EXISTS slug VARCHAR(255);

ALTER TABLE articles ADD COLUMN IF NOT EXISTS category VARCHAR(60);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS slug VARCHAR(255);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS cover_url VARCHAR(500);
ALTER TABLE articles ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'published'; -- 'draft' | 'published' | 'archived'
ALTER TABLE articles ADD COLUMN IF NOT EXISTS pdf_url VARCHAR(500);

ALTER TABLE videos ADD COLUMN IF NOT EXISTS video_url VARCHAR(500);

ALTER TABLE videos ADD COLUMN IF NOT EXISTS category VARCHAR(60);

-- Team departments (org tree sections)
CREATE TABLE IF NOT EXISTS team_departments (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    display_order INTEGER DEFAULT 0
);

-- Team members
CREATE TABLE IF NOT EXISTS team_members (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    role VARCHAR(255) NOT NULL DEFAULT '',
    department_id INTEGER REFERENCES team_departments(id) ON DELETE SET NULL,
    photo_url VARCHAR(500),
    short_bio TEXT DEFAULT '',
    full_bio TEXT DEFAULT '',
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed default departments
INSERT INTO team_departments (title, display_order) VALUES
    ('بناء المادة العلمية', 1),
    ('المستشار القانوني', 2),
    ('التدقيق العلمي', 3),
    ('التدقيق اللغوي', 4),
    ('الفهرس والتنسيق', 5),
    ('التصاميم والإعلام', 6),
    ('البرمجيات', 7),
    ('السوشيال ميديا', 8),
    ('الخدمات المساندة', 9)
ON CONFLICT DO NOTHING;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_books_created_at ON books(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_books_category ON books(category);
CREATE INDEX IF NOT EXISTS idx_articles_published_date ON articles(published_date DESC);
CREATE INDEX IF NOT EXISTS idx_articles_category ON articles(category);
CREATE INDEX IF NOT EXISTS idx_articles_status ON articles(status);
CREATE INDEX IF NOT EXISTS idx_videos_created_at ON videos(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_videos_category ON videos(category);
CREATE INDEX IF NOT EXISTS idx_consultations_created_at ON consultations(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contacts_created_at ON contacts(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_team_members_dept ON team_members(department_id);
CREATE INDEX IF NOT EXISTS idx_team_departments_order ON team_departments(display_order);

-- Insert default admin user (password: admin123)
-- Password hash is bcrypt hash of 'admin123'
INSERT INTO users (username, email, password_hash, role) 
VALUES ('admin', 'admin@sabeel-eda2at.com', '$2b$10$b.a7dbzq7jPFbo43/LiJK.fy96hGMacfXrtWNsptYgyvjnUpm5eBa', 'admin')
ON CONFLICT (username) DO UPDATE SET password_hash = EXCLUDED.password_hash;
