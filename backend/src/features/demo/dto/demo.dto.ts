import { Exclude, Expose, Transform, Type } from 'class-transformer';

class PersonDto {
  @Expose()
  name: string;
}

export class DemoSerializeTestDto {
  constructor(partial: Partial<DemoSerializeTestDto>) {
    Object.assign(this, partial);
  }

  @Expose()
  firstName: string;

  @Expose()
  @Transform(({ value }) => value.toUpperCase())
  lastName: string;

  @Exclude()
  password: string;

  @Expose()
  age: number;

  @Type(() => PersonDto)
  @Expose()
  person: PersonDto;
}
