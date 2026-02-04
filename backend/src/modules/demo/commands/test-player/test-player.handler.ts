import { Injectable } from '@nestjs/common';

@Injectable()
export class TestPlayerHandler {
  execute({
    name,
    age,
    person,
    id,
  }: {
    name: string;
    age: number;
    person: { name: string };
    id?: string;
  }) {
    return {
      name: name,
      age: age,
      person: person,
      id: id,
    };
  }
}
