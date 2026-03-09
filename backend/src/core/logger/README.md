# 📝 Logging System

This project uses Winston with automatic log rotation to handle all application logs.

## 📦 Generated Log Files

Logs are automatically saved in the `logs/` folder with daily rotation:

- **`combined-YYYY-MM-DD.log`** - All logs (info, warn, error, debug)
- **`error-YYYY-MM-DD.log`** - Errors only
- **`warn-YYYY-MM-DD.log`** - Warnings only
- **`debug-YYYY-MM-DD.log`** - Debug messages only
- **`exceptions-YYYY-MM-DD.log`** - Unhandled exceptions
- **`rejections-YYYY-MM-DD.log`** - Unhandled promise rejections

## 🔄 Automatic Rotation

Logs follow these rotation rules:

- **Daily rotation**: New file each day
- **Maximum size**: 20MB per file
- **Retention**: 14 days of history
- **Compression**: Old logs are automatically compressed to `.gz`

## 🚀 Usage in Services

### Logger Injection

```ts
import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class MyService {
  private readonly logger = new Logger(MyService.name);

  myMethod() {
    // Info log
    this.logger.log('Informational message');

    // Debug log
    this.logger.debug('Debug message');

    // Warning log
    this.logger.warn('Warning message');

    // Error log
    this.logger.error('Error message', 'Optional stack trace');

    // Verbose log
    this.logger.verbose('Detailed message');
  }
}
```

### Example with Context

```ts
async findUser(id: string) {
  this.logger.log(`Searching for user with ID: ${id}`);

  try {
    const user = await this.userRepository.findById(id);
    this.logger.debug(`User found: ${JSON.stringify(user)}`);
    return user;
  } catch (error) {
    this.logger.error(
      `Error while searching for user ${id}`,
      error.stack,
    );
    throw error;
  }
}
```

## 🔧 Configuration

Configuration is located in `logger.config.ts`:

- **Development environment**: Console logs with colors + files
- **Production environment**: Logs only in files

### Modify Log Retention

```ts
maxFiles: '30d', // Keep 30 days instead of 14
```

### Modify Maximum File Size

```ts
maxSize: '50m', // 50MB instead of 20MB
```

## 📊 Log Format

Logs are saved in JSON format for easy analysis:

```json
{
  "level": "info",
  "message": "Application started",
  "timestamp": "2025-11-03T10:30:00.000Z",
  "context": "NestApplication"
}
```

## 🐛 Debugging

To see more details during development, make sure the `NODE_ENV` environment variable is not set to `production`.
