declare global {
  namespace Express {
    interface Request {
      // Get the real ip address from cloudflare or other proxies
      clientIp?: string;
    }

    interface User {
      sessionId: string;
      role: string;
      accountId: string;
      email: string;
    }
  }
}

export {};
