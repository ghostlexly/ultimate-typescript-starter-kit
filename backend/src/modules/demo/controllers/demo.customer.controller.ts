import { Controller, Get, UnauthorizedException } from '@nestjs/common';
import { Roles } from '../../../core/decorators/roles.decorator';
import { AuthenticationPrincipal } from '../../../core/decorators/authentication-principal.decorator';
import type { UserPrincipal } from '../../../core/types/request';
import { DatabaseService } from '../../shared/services/database.service';

@Controller()
@Roles(['CUSTOMER'])
export class DemoCustomerController {
  constructor(private readonly db: DatabaseService) {}

  @Get('/demos/protected-route-customer')
  async protectedRouteCustomer(@AuthenticationPrincipal() user: UserPrincipal) {
    const customer = await this.db.prisma.customer.findFirst({
      where: { accountId: user.accountId },
    });

    if (!customer) {
      throw new UnauthorizedException();
    }

    return {
      message: 'Protected route for customer.',
      sessionId: user.sessionId,
      role: user.role,
      accountId: user.accountId,
      email: user.email,
      customerId: customer.id,
    };
  }
}
