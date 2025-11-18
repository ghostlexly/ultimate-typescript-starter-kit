# CLAUDE.md

This file provides guidance to Claude Code when working with this repository.

## Project Overview

**Ultimate-TypeScript-Starter-Kit** is a great starter for any solid, long-term projects.

### Architecture

- **Backend**: NestJS (TypeScript) - Feature-based modular architecture
- **Frontend**: Next.js 15 (TypeScript) - App Router
- **Database**: PostgreSQL with Prisma ORM
- **Infrastructure**: Docker-based development and deployment

## Development Setup

### Starting the Project

```bash
# Start all services (backend, frontend, database, redis)
docker compose up

# Access the applications:
# - Frontend: http://localhost
# - Backend API: http://localhost/api/
# - Database: PostgreSQL on port 5432
# - Redis: port 6379
```

### Working with the Backend

```bash
# Run linting
docker compose exec backend npm run lint

# Run tests
make test

# Generate Prisma client (after schema changes)
make prisma-g

# Create and apply database migrations
docker compose exec backend npx prisma migrate dev --name <migration_name>

# Format code
docker compose exec backend npm run format

# CLI commands
docker compose exec backend npm run cli create-admin-account
docker compose exec backend npm run cli generate-password
```

### Working with the Frontend

```bash
# Run linting
docker compose exec frontend npm run lint

# Build for production
cd frontend && npm run build
```

### Database Operations

```bash
# Run migrations in Docker
docker compose exec backend npx prisma migrate deploy

# Generate Prisma client in container
docker compose exec backend npx prisma generate

# Seed database
docker compose exec backend npm run seed

# Access Prisma Studio
docker compose exec backend npx prisma studio
```

## Backend Architecture

### Core Structure

```
backend/src/
├── app.module.ts           # Root module with global configuration
├── core/                   # Shared infrastructure
│   ├── decorators/         # Custom decorators (@Public, @Roles, etc.)
│   ├── exceptions/         # Custom exception classes
│   ├── filters/            # Exception filters
│   ├── guards/             # Auth guards (JwtAuthGuard, RolesGuard, ThrottlerBehindProxyGuard)
│   ├── pipes/              # Custom pipes (TrimStringsPipe)
│   ├── types/              # Shared TypeScript types
│   ├── utils/              # Utility functions (page-query.ts, etc.)
│   └── validators/         # Shared Zod validators
├── features/               # Feature modules (30+ modules)
│   ├── auth/               # Authentication & authorization
│   └── ...                 # Other feature modules
└── generated/              # Generated code (Prisma client)
```

### Key Technologies & Patterns

- **CQRS Pattern**: Commands and queries separation using @nestjs/cqrs
- **Event-Driven**: EventEmitter for domain events
- **Queue System**: BullMQ for background jobs
- **Validation**: Zod schemas for request validation
- **Authentication**: JWT with Passport, role-based access control
- **Error Tracking**: Sentry integration
- **Caching**: Redis via cache-manager
- **Rate Limiting**: Throttler with proxy support

### Feature Module Structure

Each feature module typically contains:

```
feature-name/
├── controllers/
│   ├── feature.admin.controller.ts      # Admin endpoints
│   ├── feature.customer.controller.ts   # Customer endpoints
├── validators/
│   ├── feature.admin.validators.ts      # Zod schemas for admin
│   ├── feature.customer.validators.ts   # Zod schemas for customer
├── services/                             # Business logic
├── entities/                             # Domain entities
└── feature.module.ts                     # Module definition
```

### User Roles

The application has 2 main roles:

- **ADMIN**: Full system access
- **CUSTOMER**: Clients

### Global Guards & Pipes

- `JwtAuthGuard`: Enforces authentication (use `@Public()` to bypass)
- `RolesGuard`: Enforces role-based access (use `@Roles()` decorator)
- `ThrottlerBehindProxyGuard`: Rate limiting behind reverse proxy
- `TrimStringsPipe`: Automatically trims string inputs

## Frontend Architecture

### Core Structure

```
frontend/src/
├── app/                    # Next.js App Router pages
├── components/             # Reusable React components
├── hooks/                  # Custom React hooks
├── lib/                    # Utilities and configurations
├── actions/                # Server actions
└── assets/                 # Static assets
```

### Key Technologies

- **UI Components**: Shadcn UI, Radix UI
- **Styling**: Tailwind CSS 4.x
- **Forms**: React Hook Form
- **State Management**: Zustand
- **Data Fetching**: TanStack Query (React Query)
- **Animations**: Framer Motion
- **Icons**: Lucide React, React Icons

## Code Style & Conventions

### Backend

- Use **Zod** for all request validation
- Controllers should be thin, delegate to services
- Use DTOs for data transfer
- Apply appropriate decorators (`@Public()`, `@Roles()`)
- Handle errors with custom exceptions
- Write unit tests for services

### Frontend

- Use TypeScript strictly
- Prefer server components when possible
- Use client components only when needed (`'use client'`)
- Follow Next.js App Router conventions
- Use Tailwind CSS for styling
- Implement proper error boundaries

## Testing

```bash
# Backend unit tests
cd backend
npm test

# Watch mode
npm run test:watch

# Coverage
npm run test:cov

# E2E tests
npm run test:e2e
```

## Common Commands

### Docker

```bash
# Rebuild containers
docker compose build

# View logs
docker compose logs -f [service]

# Stop all services
docker compose down

# Remove volumes (caution: deletes data)
docker compose down -v

# Execute command in container
docker compose exec backend <command>
docker compose exec frontend <command>
```

### Git Workflow

```bash
# Ensure code quality before committing
cd backend && npm run lint
cd frontend && npm run lint

# Run tests
cd backend && npm test
```

## Important Files

- `backend/prisma/schema.prisma`: Database schema
- `backend/src/app.module.ts`: Root module configuration
- `.env`: Environment variables (not in git)
- `.env.template`: Template for environment setup
- `docker-compose.yml`: Docker services configuration

## External Services

- **MangoPay**: Payment processing
- **Brevo**: Email notifications
- **AWS S3**: File storage
- **Sentry**: Error tracking and monitoring

## Notes for AI Assistant

### Code Quality Checks (MANDATORY)

After making ANY code changes, you MUST:

1. **Check for TypeScript errors** - Run `npm run build` or check IDE diagnostics
2. **Run linting** - Execute `npm run lint` to catch code style issues
3. **Fix all errors** - Never leave TypeScript errors or linting errors unfixed
4. **Verify imports** - Ensure all imports are correct (e.g., `import request from 'supertest'` not `import * as request`)
5. **Test the build** - Make sure the project compiles successfully

**Example workflow:**

```bash
# After making changes
npm run build          # Check TypeScript compilation
npm run lint           # Check code style and catch errors
npm test              # Run tests if applicable
```

### Development Guidelines

- When modifying Prisma schema, remember to generate client and create migration
- Use existing validators and decorators before creating new ones
- Follow the established feature module pattern
- Respect role-based access control
- Consider performance implications (caching, queue jobs)
- Write tests for new features
- Update this file if adding significant new patterns or tools

### Common TypeScript Issues to Avoid

- ❌ Wrong imports: `import * as request from 'supertest'`
- ✅ Correct imports: `import request from 'supertest'`
- ❌ Using functions that don't exist in imported modules
- ✅ Verify function exports before using them
- ❌ Ignoring TypeScript diagnostics
- ✅ Fix all type errors immediately
