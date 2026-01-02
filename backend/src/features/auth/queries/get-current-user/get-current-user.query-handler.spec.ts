import { Test } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { GetCurrentUserQueryHandler } from './get-current-user.query-handler';
import { GetCurrentUserQuery } from './get-current-user.query';

describe('GetCurrentUserQueryHandler', () => {
  let handler: GetCurrentUserQueryHandler;

  beforeEach(async () => {
    const app = await Test.createTestingModule({
      providers: [GetCurrentUserQueryHandler],
    }).compile();

    handler = app.get(GetCurrentUserQueryHandler);
  });

  it('should return current user data when authenticated', async () => {
    // ===== Arrange
    const user: Express.User = {
      sessionId: 'session-123',
      accountId: 'account-123',
      email: 'test@test.com',
      role: 'CUSTOMER',
    };

    // ===== Act
    const result = await handler.execute(new GetCurrentUserQuery({ user }));

    // ===== Assert
    expect(result).toEqual({
      accountId: 'account-123',
      email: 'test@test.com',
      role: 'CUSTOMER',
    });
  });

  it('should throw UnauthorizedException when user is not authenticated', async () => {
    // ===== Act & Assert
    await expect(
      handler.execute(new GetCurrentUserQuery({ user: undefined })),
    ).rejects.toThrow(UnauthorizedException);
  });
});
