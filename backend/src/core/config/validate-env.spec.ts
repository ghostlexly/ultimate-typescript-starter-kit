import { validateEnv } from './validate-env.js';

describe('validateEnv', () => {
  const VALID_ENV = {
    APP_DATABASE_CONNECTION_URL: 'postgresql://user:pass@localhost:5432/db',
  };

  it('applies defaults and coerces numeric values', () => {
    const env = validateEnv({ ...VALID_ENV, APP_PORT: '4000' });

    expect(env.NODE_ENV).toBe('development');
    expect(env.APP_PORT).toBe(4000);
    expect(env.APP_REDIS_HOST).toBe('localhost');
    expect(env.APP_REDIS_PORT).toBe(6379);
  });

  it('throws a readable error listing every invalid variable', () => {
    const invalidEnv = { APP_PORT: 'not-a-number', APP_BASE_URL: 'nope' };

    const getErrorMessage = (): string => {
      try {
        validateEnv(invalidEnv);
      } catch (error) {
        return (error as Error).message;
      }

      throw new Error('validateEnv did not throw');
    };

    const message = getErrorMessage();

    expect(message).toContain('Invalid environment variables:');
    expect(message).toContain('APP_DATABASE_CONNECTION_URL');
    expect(message).toContain('APP_PORT');
    expect(message).toContain('APP_BASE_URL');
  });
});
