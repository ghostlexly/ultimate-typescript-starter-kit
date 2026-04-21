### Backend Specifics

- Follow the CQRS file structure above when adding features.
- Commands dispatch via `CommandBus`, queries via `QueryBus`.
- Use `@UsePipes(new ZodValidationPipe(schema))` for request validation.
- Inject dependencies via constructor (NestJS DI).
- API routes are prefixed with `/api`.
- Use `ConfigService.getOrThrow()` for required env vars.

## Database

- **ORM:** Prisma 7 with `@prisma/adapter-pg` connection pooling

### Testing

- Test files live alongside source: `*.spec.ts`
- Follow Arrange-Act-Assert pattern.
- Name test variables: `inputX`, `mockX`, `actualX`, `expectedX`.
- Use `jest-mock-extended` for mocking.
- Use `@nestjs/testing` Test module for backend tests.

### Backend — Key Services

- `DatabaseService` — Extended Prisma client with `findManyAndCount()` for pagination
- `ZodValidationPipe` — Validates request body/query/params against Zod schemas
- `JwtAuthGuard` — Global guard; use `@AllowAnonymous()` to skip auth
- `RolesGuard` — Role-based access via `@Roles()` decorator
- `UnhandledExceptionsFilter` — Global error handler

### Backend — Module Organization

- `modules/auth/` — Authentication (sign-in, tokens, OAuth, password reset)
- `modules/customer/` — Customer management
- `modules/media/` — File uploads (S3)
- `modules/core/` — Global guards, pipes, decorators, exceptions, filters
- `modules/shared/` — DatabaseService (Prisma), S3Service
- `modules/demo/` — Example module
- `modules/cli/` — CLI commands and seeders (nest-commander)

### Backend — CQRS Pattern

The backend uses `@nestjs/cqrs` with this file structure per feature:

```
modules/<domain>/commands/<action>/
├── <action>.command.ts            # Command class
├── <action>.handler.ts            # Business logic (implements ICommandHandler)
└── <action>.handler.spec.ts       # Unit test

modules/<domain>/queries/<query>/
├── <query>.query.ts
├── <query>.handler.ts
└── <query>.handler.spec.ts       # Unit test
```

Events go in `modules/<domain>/events/` with separate event handlers for side effects.