import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

@Injectable()
export class BrevoService {
  private apiKey: string;

  constructor(private configService: ConfigService) {
    this.apiKey = this.configService.getOrThrow('API_BREVO_API_KEY');
  }

  sendEmailTemplate = async ({
    toEmail,
    templateId,
    subject,
    templateParams,
    attachments,
  }: {
    toEmail: string;
    templateId: number;
    subject: string;
    templateParams?: Record<string, string>;
    attachments?: Array<{
      name: string;
      content: string; // Base64 encoded content
    }>;
  }) => {
    return await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      {
        sender: {
          name: 'Acme Inc.',
          email: 'contact@acme.com',
        },
        to: [{ email: toEmail, name: 'Anonymous' }],
        templateId,
        params: templateParams,
        subject,
        attachment: attachments,
      },
      {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'shared/json',
        },
      },
    );
  };

  /**
   * Send SMS
   *
   * @param sender - The sender of the SMS. Limited to 11 characters and only letters and numbers.
   * @param recipient - The recipient of the SMS (ex: 33612345678)
   * @param message - The message to send
   * @returns
   */
  async sendSms({
    sender = 'Thomas',
    recipient,
    content,
  }: {
    sender?: string;
    recipient: string;
    content: string;
  }) {
    // -- remove spaces and + signs from the recipient
    recipient = recipient.replace(/[\s+]/g, '');

    return await axios.post(
      'https://api.brevo.com/v3/transactionalSMS/sms',
      {
        type: 'transactional',
        unicodeEnabled: true, // allow special characters and emojis, cost a bit more
        sender,
        recipient,
        content,
      },
      {
        headers: {
          'api-key': this.apiKey,
          'Content-Type': 'application/json',
          Accept: 'shared/json',
        },
      },
    );
  }
}
