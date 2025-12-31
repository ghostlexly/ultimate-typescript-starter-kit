import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSerializedOptionsQuery } from './get-serialized-options.query';
import { DemoSerializeTestDto } from '../../dto/demo.dto';

@QueryHandler(GetSerializedOptionsQuery)
export class GetSerializedOptionsQueryHandler
  implements IQueryHandler<GetSerializedOptionsQuery>
{
  execute(): Promise<DemoSerializeTestDto> {
    return Promise.resolve({
      firstName: 'John',
      lastName: 'Doe',
      password: '123456',
      age: 30,
      person: {
        name: 'John Doe',
      },
    });
  }
}
