import {
  ClassSerializerInterceptor,
  Controller,
  Get,
  SerializeOptions,
  UseInterceptors,
} from '@nestjs/common';
import { QueryBus } from '@nestjs/cqrs';
import { AllowAnonymous } from 'src/core/decorators/allow-anonymous.decorator';
import { GetSerializedOptionsQuery } from './get-serialized-options.query';
import { DemoSerializeTestDto } from '../../dto/demo.dto';

@Controller()
export class GetSerializedOptionsHttpController {
  constructor(private readonly queryBus: QueryBus) {}

  @Get('/demos/serialize-with-options')
  @AllowAnonymous()
  @UseInterceptors(ClassSerializerInterceptor)
  @SerializeOptions({
    type: DemoSerializeTestDto,
    excludeExtraneousValues: true,
  })
  async getSerializedOptions() {
    return this.queryBus.execute(new GetSerializedOptionsQuery());
  }
}
