# Enterprise Authentication Microservice 🛡️

![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat&logo=typescript)
![Node.js](https://img.shields.io/badge/Node.js-18-green?style=flat&logo=node.js)
![Redis](https://img.shields.io/badge/Redis-Cache-red?style=flat&logo=redis)
![Docker](https://img.shields.io/badge/Docker-Container-blue?style=flat&logo=docker)
![Prisma](https://img.shields.io/badge/Prisma-ORM-2D3748?style=flat&logo=prisma)

A production-ready, type-safe authentication system built for scale. Implements secure session management, rate limiting, and RBAC (Role-Based Access Control) using modern DevOps practices.

## 🚀 Live Demo
**Base API Endpoint:** [https://prisma-app-n1jm.onrender.com/](https://prisma-app-n1jm.onrender.com/)

## 🏛️ Architecture Highlights

### Security First Design
- **Argon2 Hashing:** Industry-standard password hashing (superior to Bcrypt).
- **Dual Token Rotation:** Short-lived `Access Tokens` (JWT) + HttpOnly `Refresh Tokens`.
- **Zod Validation:** Strict runtime validation for all API inputs to prevent injection attacks.
- **Rate Limiting:** Redis-backed sliding window limiter to block brute-force attacks.
- **Helmet:** Secure HTTP headers to protect against common web vulnerabilities.

### Performance
- **Redis Session Caching:** User sessions are cached in memory for sub-millisecond access.
- **Connection Pooling:** Prisma client configured for optimal connection management under load.
- **Asynchronous Logging:** Non-blocking logging using Pino for optimal throughput.

## 🛠️ Tech Stack & Decisions

| Component | Technology | Why? |
| :--- | :--- | :--- |
| **Language** | TypeScript | Compile-time type safety to prevent runtime crashes. |
| **Runtime** | Node.js (Express) | High-throughput non-blocking I/O. |
| **Database** | MySQL | Reliability and widespread enterprise adoption. |
| **ORM** | Prisma | Type-safe database queries and schema management. |
| **Caching** | Redis | High-speed session storage and rate limiting. |
| **Container** | Docker | Consistent deployment environment. |

## 📂 Project Structure

```bash
src/
├── config/         # Environment & Redis config
├── controllers/    # Request handlers (Auth, User)
├── middlewares/    # Auth guards, Rate limiters, Error handling
├── routes/         # API Route definitions
├── schemas/        # Zod Validation schemas
├── services/       # Business logic layer
├── utils/          # Helper functions (JWT, Hashing, Logger)
index.ts            # App entry point
```

## 🔌 API Documentation

### Authentication
| Method | Endpoint | Description | Auth Required |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/signup` | Register a new user account | ❌ |
| `POST` | `/api/auth/login` | Login and receive Access/Refresh tokens | ❌ |
| `GET` | `/api/auth/refresh` | Refresh Access Token using HttpOnly cookie | ❌ |
| `POST` | `/api/auth/logout` | Logout user/invalidate current session | ✅ |
| `POST` | `/api/auth/logout-all` | Invalidate all sessions for the user | ✅ |

> **Note:** All protected endpoints require the `Authorization: Bearer <token>` header.

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+)
- MySQL
- Redis

### Installation

1.  **Clone the repository**
    ```bash
    git clone https://github.com/Naresh141427/prisma-app.git
    cd prisma-app
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Environment Setup**
    Create a `.env` file in the root directory:
    ```env
    PORT=3000
    DATABASE_URL="mysql://user:password@localhost:3306/dbname"
    REDIS_URL="redis://localhost:6379"
    JWT_SECRET="your_jwt_secret"
    REFRESH_TOKEN_SECRET="your_refresh_secret"
    ```

4.  **Database Migration**
    ```bash
    npx prisma generate
    npx prisma migrate dev --name init
    ```

5.  **Run the Server**
    ```bash
    # Development mode
    npm run dev

    # Production build
    npm run build
    npm start
    ```

## 📜 License
This project is licensed under the MIT License.
