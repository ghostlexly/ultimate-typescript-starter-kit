import { Test } from '@nestjs/testing';
import { HttpException } from '@nestjs/common';
import { DeepMockProxy, mockDeep } from 'jest-mock-extended';
import { SendCodeHandler } from './send-code.handler';
import { SendCodeCommand } from './send-code.command';
import { DatabaseService } from 'src/modules/shared/services/database.service';
import { AuthService } from '../../auth.service';
import { EventBus } from '@nestjs/cqrs';
import { LoginCodeRequestedEvent } from '../../events/login-code-requested/login-code-requested.event';
import { createMockAccount } from '../../../../core/tests/factories/account.factory';

describe('SendCodeHandler', () => {
  let handler: SendCodeHandler;
  let db: DeepMockProxy<DatabaseService>;
  let authService: DeepMockProxy<AuthService>;
  let eventBus: DeepMockProxy<EventBus>;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [SendCodeHandler],
    })
      .useMocker((token) => {
        if (typeof token === 'function') {
          return mockDeep(token);
        }
      })
      .compile();

    handler = app.get(SendCodeHandler);
    db = app.get(DatabaseService);
    authService = app.get(AuthService);
    eventBus = app.get(EventBus);
  });

  it('should send a login code to the user email', async () => {
    // ===== Arrange
    const mockAccount = createMockAccount();
    db.prisma.account.findFirst.mockResolvedValue(mockAccount);
    authService.getLoginCodeCooldownRemaining.mockResolvedValue(0);
    authService.generateLoginCode.mockReturnValue('1234');
    authService.createLoginCodeToken.mockResolvedValue(undefined as any);

    // ===== Act
    const result = await handler.execute(new SendCodeCommand('test@test.com'));

    // ===== Assert
    expect(result).toEqual({
      message: 'Login code sent successfully.',
    });
    expect(authService.generateLoginCode).toHaveBeenCalled();
    expect(authService.createLoginCodeToken).toHaveBeenCalledWith({
      accountId: mockAccount.id,
      code: '1234',
    });
    expect(eventBus.publish).toHaveBeenCalledWith(
      new LoginCodeRequestedEvent({
        email: mockAccount.email,
        loginCode: '1234',
      }),
    );
  });

  it('should throw error when account is not found', async () => {
    // ===== Arrange
    db.prisma.account.findFirst.mockResolvedValue(null);

    // ===== Act & Assert
    await expect(
      handler.execute(new SendCodeCommand('unknown@test.com')),
    ).rejects.toThrow('No account found with this email address.');
  });

  it('should throw error when cooldown is active', async () => {
    // ===== Arrange
    const mockAccount = createMockAccount();
    db.prisma.account.findFirst.mockResolvedValue(mockAccount);
    authService.getLoginCodeCooldownRemaining.mockResolvedValue(45);

    // ===== Act & Assert
    await expect(handler.execute(new SendCodeCommand('test@test.com'))).rejects.toThrow(
      HttpException,
    );

    expect(eventBus.publish).not.toHaveBeenCalled();
  });
});
