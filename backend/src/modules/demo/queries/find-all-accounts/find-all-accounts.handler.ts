import { DatabaseService } from 'src/modules/shared/services/database.service';
import { Injectable } from '@nestjs/common';

@Injectable()
export class FindAllAccountsHandler {
  constructor(private readonly db: DatabaseService) {}

  async execute() {
    return await this.db.prisma.findManyAndCount('account', {});
  }
}
