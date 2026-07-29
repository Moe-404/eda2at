# Sabeel Al-Eda'at

Sabeel Al-Eda'at is a modern Arabic Islamic web platform for publishing books, articles, videos, and consultation services. It combines a public-facing website with an admin dashboard for managing content and customer requests.

## Overview

This project provides:

- A responsive public website for browsing Islamic content
- An administrative area for managing books, articles, videos, consultations, contacts, and team information
- A REST API for the frontend and admin operations
- A containerized setup for local development and deployment

## Main Features

- 📚 Browse and view Islamic books with metadata and downloadable files
- 📝 Read articles with rich content and category-based organization
- 🎥 Watch educational videos linked through YouTube IDs
- 💬 Submit family and medical consultation requests
- 📩 Send contact messages to the organization
- 👥 View team and department information
- 🔐 Secure admin login and protected dashboard
- 🧠 SEO-friendly pages with sitemap and robots support

## Tech Stack

- Frontend: React + Vite + React Router
- Backend: Node.js + Express
- Database: PostgreSQL
- Authentication: JWT + bcrypt
- Styling: CSS modules and custom components
- Containerization: Docker + Docker Compose

## Project Structure

- Frontend: [src](src)
- Backend API: [server](server)
- Database schema: [server/db/schema.sql](server/db/schema.sql)
- Docker setup: [docker-compose.yml](docker-compose.yml)

## Prerequisites

Before running the project, make sure you have:

- Node.js 18+ recommended
- PostgreSQL running locally or in Docker
- npm

## Running with Docker

```bash
docker-compose up --build
```

Then open:

- Frontend: http://localhost
- Backend API: http://localhost:5000
- Health check: http://localhost:5000/health

## Running Locally

### Frontend

```bash
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

Import the SQL schema into PostgreSQL:

```bash
psql -U postgres -d sabeel_db -f server/db/schema.sql
```

## Environment Variables

Create an environment file for the backend if needed. Typical variables include:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=sabeel_db
DB_USER=postgres
DB_PASSWORD=postgres
JWT_SECRET=change-this-secret
```

## Admin Access

Default admin credentials:

- Username: admin
- Password: admin123

Access the admin login page at:

- http://localhost/admin/login

## API Overview

The backend exposes REST endpoints under /api for:

- Authentication
- Books
- Articles
- Videos
- Consultations
- Contact messages
- Team information

## License

This project is distributed under the MIT license.
