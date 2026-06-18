import { IsOptional, IsUUID } from 'class-validator';
import { PageQueryDto } from '../../../core/utils/page-query';

export class GetPaginatedDataQuery extends PageQueryDto {
  @IsOptional()
  @IsUUID()
  id?: string;
}
