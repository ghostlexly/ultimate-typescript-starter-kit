import { AuthService } from '../../auth.service';
import { VerificationType } from '../../../../generated/prisma/enums';
import { Injectable } from '@nestjs/common';

@Injectable()
export class VerifyTokenHandler {
  constructor(private readonly authService: AuthService) {}

  async execute({
    type,
    token,
    email,
  }: {
    type: VerificationType;
    token: string;
    email: string;
  }) {
    return await this.authService.verifyVerificationToken({
      type: type,
      token: token,
      email: email,
    });
  }
}
