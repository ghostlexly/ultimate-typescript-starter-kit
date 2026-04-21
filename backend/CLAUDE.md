### Backend Specifics

- Follow the command file structure below when adding features.
- Every dispatched operation — read or write — is a `Command` handled via `CommandBus`. The project does not separate reads into a `QueryBus`; the CQRS package is used purely as a dispatcher.
- Request validation uses `class-validator` DTOs. The global `ClassValidatorPipe` (registered in `AppModule`) validates every `@Body()` / `@Query()` / `@Param()` against its DTO class metadata — no `@UsePipes` decoration needed on routes.
- Validation errors are translated into the project's `ValidationException` envelope by the pipe.
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
- `ClassValidatorPipe` — Global pipe; validates request payloads against class-validator DTOs and throws `ValidationException`
- `TrimStringsPipe` — Global pipe; trims string fields in request bodies before validation
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

### Backend — Command Pattern

Every operation lives under a single `commands/` folder per module (reads and writes side by side). Handlers use `@CommandHandler` + `ICommandHandler` — no `@QueryHandler` is used anywhere.

```
modules/<domain>/
├── dtos/                                    # Request (and response) DTOs — class-validator classes
│   └── <action>.request.dto.ts
├── commands/<action>/
│   ├── <action>.command.ts                  # Command class (data holder)
│   ├── <action>.handler.ts                  # Business logic (implements ICommandHandler)
│   └── <action>.handler.spec.ts             # Unit test
├── controllers/
│   └── <name>.controller.ts                 # Dispatches via CommandBus
├── events/                                  # Domain events
└── <domain>.module.ts
```

Controllers import DTO classes from `../dtos/` and command classes from `../commands/<action>/`, then call `commandBus.execute(new FooCommand(...))`.

Events go in `modules/<domain>/events/` with separate event handlers for side effects.

### Backend — Shared DTOs

- `src/core/dtos/page-query.dto.ts` — `PageQueryDto` base class for paginated list endpoints. Extend it and add your own filter fields.
