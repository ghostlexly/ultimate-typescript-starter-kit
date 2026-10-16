import { Injectable } from '@nestjs/common';

@Injectable()
export class CartService {
  private getHello(): string {
    return 'Hello World!';
  }
}
