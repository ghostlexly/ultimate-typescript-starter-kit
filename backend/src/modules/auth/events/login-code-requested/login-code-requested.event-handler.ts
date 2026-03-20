import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import { BrevoService } from 'src/modules/shared/services/brevo.service';
import { LoginCodeRequestedEvent } from './login-code-requested.event';

@EventsHandler(LoginCodeRequestedEvent)
export class LoginCodeRequestedEventHandler
  implements IEventHandler<LoginCodeRequestedEvent>
{
  constructor(private readonly brevoService: BrevoService) {}

  async handle({ email, loginCode }: LoginCodeRequestedEvent) {
    await this.brevoService.sendEmailTemplate({
      toEmail: email,
      templateId: 291,
      subject: "LUNISOFT - Votre code d'identification",
      templateParams: {
        otpCode: loginCode,
      },
    });
  }
}
