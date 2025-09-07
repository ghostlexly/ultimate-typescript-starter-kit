import { Account, Admin, Customer } from 'src/generated/prisma/client';

export type User = Account & {
  admin: Admin;
  customer: Customer;
};

declare global {
  namespace Express {
    interface Request {
      // Get the real ip address from cloudflare or other proxies
      clientIp?: string;
    }

    interface User extends Account {
      admin: Admin;
      customer: Customer;
    }
  }
}

export {};
