import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DbTransactionCommand } from './db-transaction.command';
import { BusinessRuleException } from '../../../../core/exceptions/business-rule.exception';
import { DatabaseService } from '../../../shared/services/database.service';
import { Logger } from '@nestjs/common';

@CommandHandler(DbTransactionCommand)
export class DbTransactionHandler implements ICommandHandler<DbTransactionCommand> {
  private readonly logger = new Logger(DbTransactionHandler.name);

  constructor(private readonly db: DatabaseService) {}

  async execute({ name }: DbTransactionCommand) {
    return this.db.prisma.$transaction(async (tx) => {
      // Perform database transaction operations using the provided Prisma transaction context
      await tx.appConfig.create({
        data: {
          key: 'never-created',
          value: name,
        },
      });

      // Do some other stuffs here...
      // Keep all your work inside this transaction..
      this.writeRandomLogs();

      throw new BusinessRuleException({
        code: 'TESTING_TRANSACTION',
        message:
          "We are trying the Prisma's transaction rollback feature. This operation will be rolled back.",
      });
    });
  }

  private writeRandomLogs() {
    this.logger.log('Hello World :)');
  }
}
