import { Redis } from "ioredis";
import { Logger } from "@/common/utils/logger";
import { env } from "@/config";
const logger = new Logger("redis");

export const REDIS_CONNECTION = {
  host: env.APP_REDIS_HOST,
  port: env.APP_REDIS_PORT,
};

class RedisService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      ...REDIS_CONNECTION,
    });

    this.client.on("error", (err) => {
      logger.error("Redis error occured.", { error: err });
    });
  }

  /**
   * Get a value from the cache. (JSON supported)
   *
   * @param key
   * @returns
   */
  get = async (key: string) => {
    const value = await this.client.get(key);
    return value ? JSON.parse(value) : null;
  };

  /**
   * Set a value in the cache with an optional expiration time. (JSON supported)
   *
   * @param key - The key to store the value under
   * @param value - The value to store
   * @param ttl - Time to live in seconds (optional)
   */
  set = async (
    key: string,
    value: string | number | boolean | object,
    ttl?: number
  ) => {
    if (ttl) {
      await this.client.set(key, JSON.stringify(value), "EX", ttl);
    } else {
      await this.client.set(key, JSON.stringify(value));
    }
  };

  /**
   * Delete a key from the cache.
   *
   * @param key
   */
  delete = async (key: string) => {
    await this.client.del(key);
  };

  /**
   * Flush all keys from the cache.
   */
  flushall = async () => {
    await this.client.flushall();
  };

  /**
   * Close the Redis connection.
   */
  quit = async () => {
    await this.client.quit();
  };
}

export const redisService = new RedisService();
