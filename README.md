# 🚀 Ultimate TypeScript Full Stack Starter

## 🌟 Overview

Welcome to the Ultimate TypeScript Full Stack Starter! This toolkit provides a robust foundation for building scalable, feature‑rich applications using NestJS, Next.js, PostgreSQL, and Prisma — all written in TypeScript.

### 🎯 Why Choose This Starter?

- **Full Stack**: Backend (NestJS) + Frontend (Next.js)
- **TypeScript**: Static typing and great DX
- **Batteries Included**: Production‑minded defaults
- **Scalable**: Modular architecture and modern tooling

## 🛠 Tech Stack

- **Database**: PostgreSQL with Prisma ORM
- **Backend**: NestJS (running on Express platform)
- **Frontend**: Next.js (SSR/SSG/CSR)
- **Language**: TypeScript
- **Containers/Proxy**: Docker + Caddy

## 🔑 Key Features

### 🖥 Backend

- **Authentication**: JWT with `@nestjs/passport` and `passport-jwt`
- **Authorization**: Role‑based via custom `RolesGuard` and `@Roles` decorator
- **Validation**: Zod via `ZodValidationPipe`
- **Error Handling**: Centralized `UnhandledExceptionsFilter`
- **Observability**: Sentry integration
- **File Management**: S3 integration for file and video uploads
- **Video Processing**: FFmpeg encoding for web‑compatible formats
- **Caching**: Redis via `@nestjs/cache-manager`
- **Rate Limiting**: `@nestjs/throttler` with proxy support
- **Background Jobs**: BullMQ queues and workers

### 🎨 Frontend

- **Framework**: React 19 with Next.js 15
- **Styling**: Tailwind CSS and MUI
- **Data/Forms**: TanStack Query and React Hook Form

### 🔒 Security

- Sensible security headers (Helmet)
- JWT‑based auth
- Input validation
- Throttling

### ⚡ Developer Experience

- Docker Compose for local dev (Caddy reverse proxy)
- ESLint + Prettier
- Hot‑reload for backend and frontend

## 🚀 Getting Started

1. **Clone the repository**

   ```
   git clone https://github.com/ghostlexly/ultimate-typescript-starter-kit.git
   cd ultimate-typescript-starter-kit
   ```

2. **Create a .env file (repo root)**
   Provide the variables used by `compose.yml` (examples):

   ```
   APP_PORT=3000
   APP_BASE_URL=http://localhost
   APP_DATABASE_CONNECTION_URL=postgresql://lunisoft:${POSTGRES_PASSWORD}@postgres:5432/${PROJECT_NAME}
   APP_REDIS_HOST=redis
   APP_REDIS_PORT=6379
   APP_JWT_PRIVATE_KEY=base64-encoded-private-key
   APP_JWT_PUBLIC_KEY=base64-encoded-public-key
   API_S3_ENDPOINT=http://minio:9000
   API_S3_ACCESS_KEY=changeme
   API_S3_SECRET_KEY=changeme
   API_S3_BUCKET=uploads
   API_GOOGLE_CLIENT_ID=
   API_GOOGLE_CLIENT_SECRET=
   POSTGRES_PASSWORD=changeme
   PROJECT_NAME=ultimate_ts_starter
   ```

3. **Install dependencies (optional for local non‑Docker runs)**

   ```
   cd backend && npm install
   cd ../frontend && npm install
   ```

4. **Start the stack**

   ```
   docker compose up
   ```

5. **Initialize the database schema**

   ```
   docker compose exec backend npx prisma migrate deploy
   ```

6. **Access the application**
   - Frontend: http://localhost
   - Backend: http://localhost/api

## 📚 Documentation

For detailed docs, see:

- Backend [README](./backend/README.md)
- Frontend [README](./frontend/README.md)

## 🤝 Contributing

We welcome contributions!

## 📄 License

This project is licensed under the [MIT License](LICENSE).

## 📞 Support

If you have any questions or need help, please [open an issue](https://github.com/ghostlexly/ultimate-typescript-starter-kit/issues) or contact our team at contact@lunisoft.fr.

---

Happy coding! 🎉 Don't forget to star ⭐ this repo if you find it useful!
