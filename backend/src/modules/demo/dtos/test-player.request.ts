import { Type } from 'class-transformer';
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';

class TestPlayerPerson {
  @IsString()
  name: string;
}

export class TestPlayerBody {
  @IsString()
  name: string;

  @Type(() => Number)
  @IsInt()
  age: number;

  @ValidateNested()
  @Type(() => TestPlayerPerson)
  person: TestPlayerPerson;
}

export class TestPlayerQuery {
  @IsOptional()
  @IsUUID()
  id?: string;
}
