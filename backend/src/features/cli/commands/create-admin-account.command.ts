import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Password } from 'src/features/auth/domain/value-objects';

@Command({
  name: 'create:account:admin',
  description: 'Create an admin account',
  arguments: '<email> <password>',
})
export class CreateAdminAccountCommand extends CommandRunner {
  private logger = new Logger(CreateAdminAccountCommand.name);

  constructor(private db: DatabaseService) {
    super();
  }

  async run(passedParams: string[]) {
    const [email, password] = passedParams;

    // Hash password using domain value object
    const hashedPassword = await Password.create(password).hash();

    // Create admin account
    await this.db.prisma.account.create({
      data: {
        role: 'ADMIN',
        email: email,
        password: hashedPassword.value,
        admin: {
          create: {},
        },
      },
    });

    this.logger.debug(`Admin account ${email} created successfully!`);
  }
}
