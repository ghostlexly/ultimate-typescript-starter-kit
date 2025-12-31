import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { GetSerializedClassQuery } from './get-serialized-class.query';
import { DemoSerializeTestDto } from '../../dto/demo.dto';

@QueryHandler(GetSerializedClassQuery)
export class GetSerializedClassQueryHandler
  implements IQueryHandler<GetSerializedClassQuery>
{
  execute() {
    return Promise.resolve(
      new DemoSerializeTestDto({
        firstName: 'John',
        lastName: 'Doe',
        password: '123456',
        age: 30,
      }),
    );
  }
}
