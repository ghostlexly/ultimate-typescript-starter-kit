import { type ICommandHandler, CommandHandler } from '@nestjs/cqrs';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { FindAllAccountsCommand } from './find-all-accounts.command';

@CommandHandler(FindAllAccountsCommand)
export class FindAllAccountsHandler implements ICommandHandler<FindAllAccountsCommand> {
  constructor(private readonly db: DatabaseService) {}

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async execute(command: FindAllAccountsCommand) {
    return await this.db.prisma.findManyAndCount('account', {});
  }
}
