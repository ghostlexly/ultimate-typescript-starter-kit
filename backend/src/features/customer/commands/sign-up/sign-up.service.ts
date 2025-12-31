import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SignUpCommand } from './sign-up.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { Email, Password } from 'src/features/auth/domain/value-objects';
import { Account } from 'src/features/auth/domain/entities';
import { ACCOUNT_REPOSITORY } from 'src/features/auth/domain/ports';
import type { AccountRepositoryPort } from 'src/features/auth/domain/ports';
import { Customer } from '../../domain/entities';

export interface SignUpResult {
  id: string;
  email: string;
  role: string;
}

@CommandHandler(SignUpCommand)
export class SignUpService
  implements ICommandHandler<SignUpCommand, SignUpResult>
{
  constructor(
    @Inject(ACCOUNT_REPOSITORY)
    private readonly accountRepository: AccountRepositoryPort,
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: SignUpCommand): Promise<SignUpResult> {
    // Create value objects
    const email = Email.create(command.email);
    const password = Password.create(command.password);

    // Verify if this e-mail is already in use
    const existingAccount = await this.accountRepository.findByEmail(email);

    if (existingAccount) {
      throw new HttpException(
        { message: 'Cette adresse e-mail est déjà utilisée.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create Account entity (hashes password, adds domain event)
    const account = await Account.create({
      id: crypto.randomUUID(),
      email,
      password,
      role: 'CUSTOMER',
    });

    // Create Customer entity (adds domain event)
    const customer = Customer.create({
      id: crypto.randomUUID(),
      accountId: account.id,
      email: account.email,
    });

    // Persist to database, the create() methods are not required to be in the repositories
    await this.db.prisma.account.create({
      data: {
        id: account.id,
        email: account.email,
        password: account.password,
        role: account.role,
        isEmailVerified: account.isEmailVerified,
        customer: {
          create: {
            id: customer.id,
          },
        },
      },
    });

    // Dispatch domain events
    for (const event of account.domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }
    for (const event of customer.domainEvents) {
      this.eventEmitter.emit(event.eventName, event);
    }

    return {
      id: account.id,
      email: account.email,
      role: account.role,
    };
  }
}
