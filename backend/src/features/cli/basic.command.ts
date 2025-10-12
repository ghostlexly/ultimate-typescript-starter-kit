import { Logger } from '@nestjs/common';
import { Command, CommandRunner, Option } from 'nest-commander';
import { DatabaseService } from 'src/features/application/services/database.service';

interface BasicCommandOptions {
  string?: string;
  boolean?: boolean;
  number?: number;
}

@Command({ name: 'basic', description: 'A parameter parse' })
export class BasicCommand extends CommandRunner {
  private logger = new Logger(BasicCommand.name);

  constructor(private db: DatabaseService) {
    super();
  }

  async run(passedParam: string[], options?: BasicCommandOptions) {
    // Test the database connection from the CLI commands, will throw an error if the connection is not established
    await this.db.prisma.account.findMany();

    // Run the command with the options
    if (options?.boolean !== undefined && options?.boolean !== null) {
      this.runWithBoolean(passedParam, options.boolean);
    } else if (options?.number) {
      this.runWithNumber(passedParam, options.number);
    } else if (options?.string) {
      this.runWithString(passedParam, options.string);
    } else {
      this.runWithNone(passedParam);
    }
  }

  @Option({
    flags: '-n, --number [number]',
    description: 'A basic number parser',
  })
  parseNumber(val: string): number {
    return Number(val);
  }

  @Option({
    flags: '-s, --string [string]',
    description: 'A string return',
  })
  parseString(val: string): string {
    return val;
  }

  @Option({
    flags: '-b, --boolean [boolean]',
    description: 'A boolean parser',
  })
  parseBoolean(val: string): boolean {
    return JSON.parse(val);
  }

  runWithString(param: string[], option: string): void {
    this.logger.debug({ param, string: option });
  }

  runWithNumber(param: string[], option: number): void {
    this.logger.debug({ param, number: option });
  }

  runWithBoolean(param: string[], option: boolean): void {
    this.logger.debug({ param, boolean: option });
  }

  runWithNone(param: string[]): void {
    this.logger.debug({ param });
  }
}
