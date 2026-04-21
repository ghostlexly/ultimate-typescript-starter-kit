import { IsEmail } from 'class-validator';

export class AdminCreateCustomerRequest {
  @IsEmail()
  email: string;
}
