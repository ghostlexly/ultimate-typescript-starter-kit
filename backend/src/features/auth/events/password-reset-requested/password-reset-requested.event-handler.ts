import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { PasswordResetRequestedEvent } from './password-reset-requested.event';
import { BrevoService } from 'src/features/application/services/brevo.service';

@EventsHandler(PasswordResetRequestedEvent)
export class PasswordResetRequestedEventHandler
  implements IEventHandler<PasswordResetRequestedEvent>
{
  constructor(private readonly brevoService: BrevoService) {}

  async handle({ email, token }: PasswordResetRequestedEvent) {
    await this.brevoService.sendEmailTemplate({
      toEmail: email,
      templateId: 275,
      subject: 'Demande de réinitialisation de votre mot de passe',
      templateParams: {
        passwordResetToken: token,
      },
    });
  }
}