import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { HttpException, HttpStatus } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { SignUpCommand } from './sign-up.command';
import { DatabaseService } from 'src/features/application/services/database.service';
import { passwordUtils } from 'src/core/utils/password';
import { AccountCreatedEvent } from 'src/features/auth/domain/events/account-created.event';

export interface SignUpResult {
  id: string;
  email: string;
  role: string;
}

@CommandHandler(SignUpCommand)
export class SignUpService implements ICommandHandler<SignUpCommand, SignUpResult> {
  constructor(
    private readonly db: DatabaseService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async execute(command: SignUpCommand): Promise<SignUpResult> {
    // Verify if this e-mail is already in use
    const existingAccount = await this.db.prisma.account.findFirst({
      where: {
        email: {
          equals: command.email,
          mode: 'insensitive',
        },
      },
    });

    if (existingAccount) {
      throw new HttpException(
        { message: 'Cette adresse e-mail est déjà utilisée.' },
        HttpStatus.BAD_REQUEST,
      );
    }

    // Hash password
    const hashedPassword = await passwordUtils.hash(command.password);

    // Create customer account
    const account = await this.db.prisma.account.create({
      data: {
        email: command.email,
        password: hashedPassword,
        role: 'CUSTOMER',
        customer: {
          create: {},
        },
      },
    });

    // Fire domain event
    this.eventEmitter.emit(
      'auth.account.created',
      new AccountCreatedEvent({
        aggregateId: account.id,
        email: account.email,
        role: account.role,
      }),
    );

    return {
      id: account.id,
      email: account.email,
      role: account.role,
    };
  }
}
