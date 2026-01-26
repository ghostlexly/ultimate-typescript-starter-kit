# Project Guidelines

## Project Overview

Monorepo with a **NestJS 11** backend and **Next.js 16** frontend, running in Docker via Docker Compose with Caddy as reverse proxy.

## Tech Stack

**Backend:** NestJS 11, TypeScript 5.7, Prisma 7 (PostgreSQL 17), Zod 4 validation, Jest 30 (with @swc/jest), BullMQ (Redis 8), Passport JWT (RS256) + Google OAuth, Winston logging, Sentry, AWS S3
**Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Shadcn UI + Radix UI, Zustand, TanStack React Query 5, React Hook Form + Zod, Axios

## Architecture

### Backend — CQRS Pattern

The backend uses `@nestjs/cqrs` with this file structure per feature:

```
modules/<domain>/commands/<action>/
├── <action>.command.ts            # Command class
├── <action>.handler.ts            # Business logic (implements ICommandHandler)
├── <action>.http.controller.ts    # HTTP route
├── <action>.request.dto.ts        # Zod validation schema
└── <action>.handler.spec.ts       # Unit test

modules/<domain>/queries/<query>/
├── <query>.query.ts
├── <query>.handler.ts
└── <query>.http.controller.ts
```

Events go in `modules/<domain>/events/` with separate event handlers for side effects.

### Backend — Module Organization

- `modules/auth/` — Authentication (sign-in, tokens, OAuth, password reset)
- `modules/customer/` — Customer management
- `modules/media/` — File uploads (S3)
- `modules/core/` — Global guards, pipes, decorators, exceptions, filters
- `modules/shared/` — DatabaseService (Prisma), S3Service
- `modules/demo/` — Example module
- `modules/cli/` — CLI commands and seeders (nest-commander)

### Backend — Key Services

- `DatabaseService` — Extended Prisma client with `findManyAndCount()` for pagination
- `ZodValidationPipe` — Validates request body/query/params against Zod schemas
- `JwtAuthGuard` — Global guard; use `@AllowAnonymous()` to skip auth
- `RolesGuard` — Role-based access via `@Roles()` decorator
- `TrimStringsPipe` — Auto-trims whitespace on string inputs
- `UnhandledExceptionsFilter` — Global error handler

### Frontend — Structure

- `src/app/` — Next.js App Router pages and layouts
- `src/components/` — Shadcn UI and custom components
- `src/middleware.ts` — Auth route protection (redirects to `/auth/signin`)
- Path alias: `@/*` maps to `./src/*`
- State: Zustand stores, TanStack React Query for server state
- Auth: Custom `LuniAuthProvider` with SSR session support

## Database

- **ORM:** Prisma 7 with `@prisma/adapter-pg` connection pooling
- **Schema:** `backend/prisma/schema.prisma`
- **Models:** Account, Session, Customer, Admin, VerificationToken, Media, City, AppConfig
- **IDs:** Always `String` type
- All cascade deletes flow from Account

## Commands

### Development (via Makefile, runs in Docker)

```bash
make start              # Start dev environment (docker compose up)
make stop               # Stop dev environment
make build              # Build Docker images
make bb                 # Bash into backend container
make bf                 # Bash into frontend container
```

### Code Quality

```bash
make lint               # ESLint (frontend)
make lint-fix           # ESLint with autofix
make type-check         # TypeScript type checking
make qa                 # lint-fix + type-check
```

### Testing

```bash
make test               # Run backend unit tests (Jest)
make test-watch         # Watch mode
make test-e2e           # Reset test DB + run E2E tests
```

### Prisma

```bash
make prisma-g           # Generate Prisma client
make prisma-m-g         # Create new migration (dev --create-only)
make prisma-m-deploy    # Apply migrations + regenerate client
make prisma-m-diff      # Check schema drift
```

### Direct npm scripts (inside containers)

```bash
# Backend
npm run build           # nest build
npm test                # jest
npm run test:e2e        # E2E tests
npm run cli             # Run CLI commands (node dist/cli.js)

# Frontend
npm run dev             # next dev --turbopack
npm run build           # next build
```

## Code Conventions

### General

- Use English for all code and documentation.
- Always declare types for variables, parameters, and return values. Avoid `any`.
- Use kebab-case for file and directory names.
- One export per file.
- Use Zod schemas for all request validation (not class-validator).
- IDs are always of type `string`.

### Naming

- **PascalCase:** Classes, interfaces, type aliases, decorators
- **camelCase:** Variables, functions, methods, properties
- **UPPERCASE:** Constants, environment variables
- **kebab-case:** Files and directories
- Booleans start with a verb: `isLoading`, `hasError`, `canDelete`
- Functions start with a verb: `findUser`, `createSession`, `handleSubmit`

### Backend Specifics

- Follow the CQRS file structure above when adding features.
- Commands dispatch via `CommandBus`, queries via `QueryBus`.
- Use `@UsePipes(new ZodValidationPipe(schema))` for request validation.
- Inject dependencies via constructor (NestJS DI).
- API routes are prefixed with `/api`.
- Use `ConfigService.getOrThrow()` for required env vars.

### Frontend Specifics

- Use functional components only. No classes.
- Prefer React Server Components; minimize `'use client'`.
- Use Shadcn UI + Radix UI + Tailwind CSS for all UI.
- Use `useForm` with Zod resolver for forms.
- Use TanStack React Query for data fetching, Zustand for client state.
- Favor named exports.

### Testing

- Test files live alongside source: `*.spec.ts`
- Follow Arrange-Act-Assert pattern.
- Name test variables: `inputX`, `mockX`, `actualX`, `expectedX`.
- Use `jest-mock-extended` for mocking.
- Use `@nestjs/testing` Test module for backend tests.
