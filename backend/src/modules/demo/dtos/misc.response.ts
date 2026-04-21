import { Exclude, Expose, Transform, Type } from 'class-transformer';

class Person {
  @Expose()
  name: string;
}

export class DemoSerializeTestResponse {
  constructor(partial: Partial<DemoSerializeTestResponse>) {
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

  @Type(() => Person)
  @Expose()
  person: Person;
}
