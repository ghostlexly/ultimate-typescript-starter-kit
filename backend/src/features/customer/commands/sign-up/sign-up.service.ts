import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus, Inject } from '@nestjs/common';
import { SignUpCommand } from './sign-up.command';
import { Password } from 'src/features/auth/domain/value-objects';
import { Account } from 'src/features/auth/domain/entities';
import { ACCOUNT_REPOSITORY } from 'src/features/auth/domain/ports';
import type { AccountRepositoryPort } from 'src/features/auth/domain/ports';
import { Customer } from '../../domain/entities';
import { CUSTOMER_REPOSITORY } from '../../domain/ports';
import type { CustomerRepositoryPort } from '../../domain/ports';

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
    @Inject(CUSTOMER_REPOSITORY)
    private readonly customerRepository: CustomerRepositoryPort,
  ) {}

  async execute(command: SignUpCommand): Promise<SignUpResult> {
    // Create value objects
    const password = Password.create(command.password);

    // Verify if this e-mail is already in use
    const existingAccount = await this.accountRepository.findByEmail(
      command.email,
    );

    if (existingAccount) {
      throw new HttpException(
        { message: 'Cette adresse e-mail est déjà utilisée.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Create Account entity (hashes password, adds domain event)
    const account = await Account.create({
      id: crypto.randomUUID(),
      email: command.email,
      password,
      role: 'CUSTOMER',
    });

    // Create Customer entity (adds domain event)
    const customer = Customer.create({
      id: crypto.randomUUID(),
      accountId: account.id,
      email: account.email,
    });

    // Persist account (repository publishes domain events)
    await this.accountRepository.create(account);

    // Persist customer (repository publishes domain events)
    await this.customerRepository.create(customer);

    return {
      id: account.id,
      email: account.email,
      role: account.role,
    };
  }
}
