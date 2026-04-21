import { IsEmail } from 'class-validator';

export class SendCodeRequest {
  @IsEmail()
  email: string;
}
