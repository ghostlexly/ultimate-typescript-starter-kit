import { Test } from '@nestjs/testing';
import { GetCurrentUserQueryHandler } from './get-current-user.query-handler';
import { GetCurrentUserQuery } from './get-current-user.query';

describe('GetCurrentUserQueryHandler', () => {
  let handler: GetCurrentUserQueryHandler;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [GetCurrentUserQueryHandler],
    }).compile();

    handler = moduleRef.get<GetCurrentUserQueryHandler>(
      GetCurrentUserQueryHandler,
    );
  });

  describe('execute', () => {
    it('should return the current user data from the query', async () => {
      // Arrange
      const query = new GetCurrentUserQuery(
        'account-123',
        'test@test.com',
        'ADMIN',
      );

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual({
        accountId: 'account-123',
        email: 'test@test.com',
        role: 'ADMIN',
      });
    });

    it('should return correct data for different roles', async () => {
      // Arrange
      const query = new GetCurrentUserQuery(
        'customer-456',
        'customer@test.com',
        'CUSTOMER',
      );

      // Act
      const result = await handler.execute(query);

      // Assert
      expect(result).toEqual({
        accountId: 'customer-456',
        email: 'customer@test.com',
        role: 'CUSTOMER',
      });
    });
  });
});
