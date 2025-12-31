import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  UseInterceptors,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { GetSerializedClassQuery } from './get-serialized-class.query';

@Controller()
export class GetSerializedClassHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/serialize-with-class')
  @AllowAnonymous()
  @UseInterceptors(ClassSerializerInterceptor)
  async getSerializedClass() {
    return this.queryBus.execute(new GetSerializedClassQuery());
  }
}
