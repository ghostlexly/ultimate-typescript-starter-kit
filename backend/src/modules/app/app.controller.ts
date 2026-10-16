import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service.js';
import { AppRepository } from './app.repository.js';

@Controller('/test')
export class AppController {
  constructor(
    private readonly appService: AppService,
    private readonly appRepository: AppRepository,
  ) {}

  @Get()
  getHello() {
    return { message: this.appService.getHello() };
  }

  @Get('db')
  testDatabase() {
    return this.appRepository.findAll();
  }
}
