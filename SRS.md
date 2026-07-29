# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document defines the functional and non-functional requirements for Sabeel Al-Eda'at, an Islamic web platform that serves public users and administrators. The system allows visitors to browse Islamic content, submit consultations and contact requests, and enables admins to manage website content securely.

### 1.2 Product Scope
The system includes:

- A public website for viewing books, articles, videos, and team information
- A consultation submission form for family and medical requests
- A contact form for general inquiries
- An admin dashboard for managing content and requests
- A REST API and PostgreSQL-based backend for persistence

### 1.3 Intended Users
- Visitors: users who browse content and submit requests
- Administrators: users who manage content and review inquiries

## 2. Overall Description

### 2.1 Product Perspective
The platform is a full-stack web application consisting of:

- A React frontend served by Vite
- An Express backend exposing REST APIs
- A PostgreSQL database for storing content and user data

### 2.2 Product Functions
The system should allow users to:

- View the homepage and navigation pages
- Browse books, articles, and videos
- Submit consultation requests
- Send contact messages
- Access admin login and protected management features

The system should allow administrators to:

- Authenticate securely
- Create, edit, delete, and view books, articles, videos, and team entries
- Review consultation and contact submissions
- Update request status

## 3. Functional Requirements

### 3.1 Public Website
1. The system shall display a homepage with navigation to main sections.
2. The system shall allow users to browse books, articles, videos, and team information.
3. The system shall allow visitors to view detailed information for each content item.
4. The system shall provide forms for consultation and contact submissions.
5. The system shall validate required fields before saving submissions.

### 3.2 Authentication and Authorization
1. The system shall allow administrators to log in using a username and password.
2. The system shall authenticate users using JWT tokens.
3. The system shall restrict admin-only operations to authenticated administrators.
4. The system shall redirect unauthenticated users to the login page when protected routes are accessed.

### 3.3 Content Management
1. The system shall allow administrators to create, update, and delete books.
2. The system shall allow administrators to create, update, and delete articles.
3. The system shall allow administrators to create, update, and delete videos.
4. The system shall allow administrators to manage team members and departments.
5. The system shall store file URLs for uploaded media and downloadable documents.

### 3.4 Consultation and Contact Management
1. The system shall store consultation requests with type, subject, details, and status.
2. The system shall store contact messages with sender information and status.
3. The system shall allow administrators to change the status of requests.
4. The system shall allow administrators to delete outdated submissions.

### 3.5 SEO and Accessibility
1. The system shall provide SEO metadata for public pages.
2. The system shall expose a robots.txt file.
3. The system shall expose a sitemap.xml file containing public routes and dynamic content URLs.

## 4. Non-Functional Requirements

### 4.1 Performance
1. The system shall load public pages efficiently for typical usage.
2. The API shall respond within acceptable limits for CRUD operations on content and submissions.

### 4.2 Security
1. Admin passwords shall be stored as hashed values.
2. API routes that modify data shall require authentication.
3. The system shall prevent unauthorized access to protected admin pages.

### 4.3 Maintainability
1. The system shall separate frontend, backend, and database responsibilities.
2. The codebase shall support future extension with additional content types and modules.

### 4.4 Reliability
1. The system shall handle database connection failures gracefully.
2. The application shall provide clear health-check endpoints for monitoring.

## 5. Assumptions and Dependencies

- PostgreSQL is available for persistence.
- The application runs in a Node.js environment.
- The frontend communicates with the backend through HTTP requests.
- Docker may be used to simplify deployment and local development.

## 6. Future Enhancements

- Add multilingual support for Arabic and English
- Add full-text search for books and articles
- Add email notifications for submissions
- Add richer media upload management
- Add analytics and reporting for content engagement
