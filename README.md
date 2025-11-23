# Sabeel Al-Eda'at - Islamic Website

A modern Islamic website featuring books, articles, videos, and consultation services.

## Features

- 📚 **Book Library** - Browse and download Islamic books
- 📝 **Articles** - Read Islamic articles and insights
- 🎥 **Videos** - Watch Islamic educational videos
- 💬 **Consultations** - Request family and medical consultations
- 📧 **Contact** - Get in touch with the team
- 🔐 **Admin Panel** - Manage all content

## Tech Stack

- **Frontend**: React + Vite
- **Backend**: Node.js + Express
- **Containerization**: Docker + Docker Compose

## Features

- 📚 Books management (PDF downloads)
- 📝 Articles/Illuminations
- 🎥 Videos (YouTube embeds)
- 💬 Consultations (Family & Medical)
- ✉️ Contact forms
- 🔐 Secure admin dashboard
- 🐳 Fully containerized

## Quick Start with Docker

```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost
# Backend API: http://localhost:5000
# Database: localhost:5432
```

## Development Setup

### Frontend
```bash
cd /path/to/project
npm install
npm run dev
```

### Backend
```bash
cd server
npm install
npm run dev
```

### Database
```bash
# Make sure PostgreSQL is running
# Run schema.sql to initialize
psql -U postgres -d sabeel_db -f server/db/schema.sql
```

## Admin Access

- **URL**: http://localhost/admin/login
- **Username**: admin
- **Password**: admin123

## Environment Variables

Copy `.env.example` and create `.env` file with your configuration:

```env
DB_HOST=db
DB_PORT=5432
DB_NAME=sabeel_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=your-secret-key-change-this
```

## License

MIT
