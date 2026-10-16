import { Module } from '@nestjs/common';
import { CartService } from './services/cart.service.js';

@Module({
  providers: [CartService],
})
export class CartModule {}
