import { Type } from 'class-transformer';
import {
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  ValidateNested,
} from 'class-validator';

class TestPlayerPerson {
  @IsString()
  @IsNotEmpty()
  name: string;
}

export class TestPlayerBody {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsInt()
  @Min(18)
  age: number;

  @IsObject()
  @ValidateNested()
  @Type(() => TestPlayerPerson)
  person: TestPlayerPerson;
}

export class TestPlayerQuery {
  @IsOptional()
  @IsUUID()
  id?: string;
}
