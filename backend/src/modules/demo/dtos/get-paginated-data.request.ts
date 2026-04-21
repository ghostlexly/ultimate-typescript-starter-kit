import { IsOptional, IsUUID } from 'class-validator';
import { PageQueryDto } from 'src/core/dtos/page-query.dto';

export class GetPaginatedDataQuery extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  id?: string;
}
