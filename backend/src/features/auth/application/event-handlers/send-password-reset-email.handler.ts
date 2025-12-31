import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OnEvent } from '@nestjs/event-emitter';
import { BrevoService } from 'src/features/application/services/brevo.service';
import { PasswordResetRequestedEvent } from '../../domain/events/password-reset-requested.event';

@Injectable()
export class SendPasswordResetEmailHandler {
  private readonly logger = new Logger(SendPasswordResetEmailHandler.name);
  private readonly appBaseUrl: string;

  constructor(
    private readonly brevoService: BrevoService,
    private readonly configService: ConfigService,
  ) {
    this.appBaseUrl = this.configService.getOrThrow<string>('APP_BASE_URL');
  }

  @OnEvent('auth.password-reset.requested')
  async handle(event: PasswordResetRequestedEvent): Promise<void> {
    try {
      await this.brevoService.sendEmailTemplate({
        toEmail: event.email,
        templateId: 275,
        subject: 'Demande de réinitialisation de votre mot de passe',
        templateParams: {
          resetToken: event.resetToken,
          resetLink: `${this.appBaseUrl}/reset-password?token=${event.resetToken}`,
        },
      });

      this.logger.log(`Password reset email sent to ${event.email}`);
    } catch (error) {
      this.logger.error(
        `Failed to send password reset email to ${event.email}`,
        error,
      );
    }
  }
}
