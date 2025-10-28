import { Logger } from '@nestjs/common';
import { Command, CommandRunner } from 'nest-commander';
import { DatabaseService } from 'src/features/application/services/database.service';
import { AuthService } from '../auth/auth.service';

@Command({
  name: 'create:admin-account',
  description: 'Create an admin account',
  arguments: '<email> <password>',
})
export class CreateAdminAccountCommand extends CommandRunner {
  private logger = new Logger(CreateAdminAccountCommand.name);

  constructor(
    private db: DatabaseService,
    private authService: AuthService,
  ) {
    super();
  }

  async run(passedParams: string[]) {
    const [email, password] = passedParams;

    // Hash password
    const hashedPassword = await this.authService.hashPassword({
      password: password,
    });

    // Create admin account
    await this.db.prisma.admin.create({
      data: {
        email: email,
        password: hashedPassword,
        account: {
          create: {
            role: 'ADMIN',
          },
        },
      },
    });

    this.logger.debug(`Admin account ${email} created successfully!`);
  }
}
