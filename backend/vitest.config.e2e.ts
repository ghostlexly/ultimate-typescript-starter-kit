import { defineConfig } from 'vitest/config';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],
  test: {
    globals: true,
    root: './',
    include: ['**/*.e2e-spec.ts'],
    globalSetup: ['./test/e2e/supports/e2e-setup.ts'],
    // Per-test hooks (database cleanup after each test)
    setupFiles: ['./test/e2e/supports/e2e-hooks.ts'],
    // Pulling the image the first time can take a while.
    hookTimeout: 120_000,
    testTimeout: 30_000,
    // All files share one database, so keep them sequential.
    fileParallelism: false,
  },
});
