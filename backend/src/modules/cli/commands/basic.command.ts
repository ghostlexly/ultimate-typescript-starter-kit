import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { DatabaseService } from 'src/modules/shared/services/database.service';

@Command({
  name: 'basic',
  description: 'A parameter parse',
  arguments: '<name>',
})
export class BasicCommand extends CommandRunner {
  private logger = new Logger(BasicCommand.name);

  constructor(private db: DatabaseService) {
    super();
  }

  async run(passedParams: string[]) {
    const [name] = passedParams;

    // Test the database connection from the CLI commands, will throw an error if the connection is not established
    await this.db.prisma.account.findMany();

    this.logger.debug(`Hello, ${name}!`);
  }
}
