export interface RequestUser {
  sessionId: string;
  role: string;
  accountId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      // Get the real ip address from cloudflare or other proxies
      clientIp?: string;
    }

    // eslint-disable-next-line @typescript-eslint/no-empty-object-type
    interface User extends RequestUser {}
  }
}
