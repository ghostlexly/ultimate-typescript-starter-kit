import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../application/services/database.service';

@Injectable()
export class CustomerService {
  constructor(private db: DatabaseService) {}

  /**
   * Verify if the given e-mail is already in use.
   */
  async verifyExistingEmail({ email }: { email: string }) {
    const existingCustomer = await this.db.prisma.account.findFirst({
      where: {
        email: {
          equals: email,
          mode: 'insensitive',
        },
      },
    });

    if (existingCustomer) {
      return true;
    }

    return false;
  }
}
