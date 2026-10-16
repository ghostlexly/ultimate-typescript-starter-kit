import { defineConfig } from 'drizzle-kit';

/**
 * drizzle-kit does not load env files on its own. Pick up the first `.env`
 * found (backend-local, then the repository-level one shared with Docker
 * Compose) without overriding variables already set in the environment.
 */
const ENV_FILE_CANDIDATES = ['.env', '../.env'];

for (const envFile of ENV_FILE_CANDIDATES) {
  try {
    process.loadEnvFile(envFile);
    break;
  } catch {
    // File does not exist: try the next candidate (CI / production rely on
    // the process environment instead).
  }
}

const connectionUrl = process.env.APP_DATABASE_CONNECTION_URL;

// drizzle-kit swallows connection errors behind its spinner: fail here with a
// clear message instead of letting `db:migrate` exit silently.
if (!connectionUrl) {
  throw new Error(
    'APP_DATABASE_CONNECTION_URL is not set. Define it in backend/.env, ../.env or the environment.',
  );
}

export default defineConfig({
  dialect: 'postgresql',
  schema: './src/core/database/schema/index.ts',
  out: './migrations',
  // Column names are derived from the camelCase property names (createdAt -> created_at).
  casing: 'snake_case',
  dbCredentials: {
    url: connectionUrl,
  },
  strict: true,
  verbose: true,
});
