# 🚀 Ultimate TypeScript Full Stack Starter

## 🌟 Overview

Welcome to the Ultimate TypeScript Full Stack Starter! This toolkit provides a robust foundation for building scalable, feature‑rich applications using NestJS, Next.js, PostgreSQL, and Prisma — all written in TypeScript.

### 🎯 Why Choose This Starter?

- **Full Stack**: Backend (NestJS) + Frontend (Next.js)
- **TypeScript**: Static typing and great DX
- **Batteries Included**: Production‑minded defaults
- **Scalable**: Modular architecture and modern tooling

## 🛠 Tech Stack

- **Database**: PostgreSQL 17 with Prisma ORM
- **Backend**: NestJS (running on Express platform)
- **Frontend**: Next.js 15 (SSR/SSG/CSR)
- **Language**: TypeScript
- **Containers/Proxy**: Docker + Caddy
- **Cache/Queue**: Redis 8

## 🔑 Key Features

### 🖥 Backend

- **Authentication**: JWT (with rotating tokens) with `@nestjs/passport` and `passport-jwt`
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
- **Styling**: Tailwind CSS 4, Shadcn UI, Radix UI
- **Data/Forms**: TanStack Query and React Hook Form
- **State**: Zustand

### 🔒 Security

- Sensible security headers (Helmet)
- JWT‑based auth with tokens rotation
- Input validation
- Throttling

### ⚡ Developer Experience

- Docker Compose for local dev (Caddy reverse proxy)
- ESLint + Prettier
- Hot‑reload for backend and frontend

## 🚀 Getting Started

### Prerequisites

- [Docker](https://www.docker.com/) and Docker Compose
- [Node.js](https://nodejs.org/) (for local tooling and Prisma client generation)
- [Make](https://www.gnu.org/software/make/) (optional, for shortcut commands)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/ghostlexly/ultimate-typescript-starter-kit.git
   cd ultimate-typescript-starter-kit
   ```

2. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

   Open `.env` and update the values as needed (database password, S3 credentials, etc.).

3. **Install dependencies**

   Run this in both `backend/` and `frontend/` directories:

   ```bash
   npm install
   ```

4. **Start the stack**

   ```bash
   make start
   ```

   Or directly with Docker Compose:

   ```bash
   docker compose up
   ```

5. **Initialize the database**

   Generate the Prisma client locally (for IDE autocompletion):

   ```bash
   cd backend && npx prisma generate
   ```

   Apply migrations:

   ```bash
   docker compose exec backend npx prisma migrate deploy
   ```

   Or use the Makefile shortcut:

   ```bash
   make prisma-m-deploy
   ```

6. **Seed the database**

   ```bash
   docker compose exec backend npm run cli seed
   ```

7. **Generate JWT keys** *(optional but recommended)*

   The `.env.example` ships with default keys for development. To generate your own RSA keys:

   ```bash
   docker compose exec backend npm run cli generate:jwt-keys
   ```

   Copy the base64-encoded output into `APP_JWT_PRIVATE_KEY` and `APP_JWT_PUBLIC_KEY` in your `.env`, then restart the backend.

8. **Access the application**

   | Service  | URL                    |
   |----------|------------------------|
   | Frontend | http://localhost       |
   | Backend  | http://localhost/api   |

## 🛠 Development Commands

The project includes a `Makefile` with helpful commands:

```bash
# Show all available commands
make help

# Start the development environment
make start

# Run tests
make test

# Generate Prisma client
make prisma-g

# Apply migrations
make prisma-m-deploy
```

Alternatively, you can use Docker Compose commands directly:

```bash
# Backend commands
docker compose exec backend npm run lint
docker compose exec backend npm run test:e2e
docker compose exec backend npm run cli <command>

# Frontend commands
docker compose exec frontend npm run lint
docker compose exec frontend npm run build
```

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
