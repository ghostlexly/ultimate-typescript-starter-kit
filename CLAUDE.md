# Project Guidelines

## Project Overview

Monorepo with a **NestJS 11** backend and **Next.js 16** frontend, running in Docker via Docker Compose with Caddy as reverse proxy.

- `backend/` — See [backend/CLAUDE.md](backend/CLAUDE.md) for conventions.
- `frontend/` — See [frontend/CLAUDE.md](frontend/CLAUDE.md) for conventions.

## Tech Stack

**Backend:** NestJS 11, TypeScript 5.7, Prisma 7 (PostgreSQL 17), Zod 4 validation, Jest 30 (with @swc/jest), BullMQ (Redis 8), Passport JWT (RS256) + Google OAuth, Winston logging, Sentry, AWS S3
**Frontend:** Next.js 16, React 19, TypeScript 5, Tailwind CSS 4, Shadcn UI + Radix UI, Zustand, TanStack React Query 5, React Hook Form + Zod, Axios

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
