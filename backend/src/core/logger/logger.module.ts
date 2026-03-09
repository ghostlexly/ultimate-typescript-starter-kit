import { Module } from '@nestjs/common';
import { WinstonModule } from 'nest-winston';
import { createWinstonConfig } from './logger.config';

@Module({
  imports: [WinstonModule.forRoot(createWinstonConfig())],
  exports: [WinstonModule],
})
export class LoggerModule {}
