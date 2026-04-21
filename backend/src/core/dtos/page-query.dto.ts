import { Transform, Type } from 'class-transformer';
import { IsArray, IsInt, IsOptional, IsString, Min } from 'class-validator';

/**
 * Base DTO for paginated list endpoints.
 * Feature DTOs should extend this class and add their own filter fields.
 */
export class PageQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  first?: number;

  @IsOptional()
  @IsString()
  sort?: string;

  // Accept either ?include=foo,bar or ?include=foo&include=bar
  @IsOptional()
  @Transform(({ value }) => (Array.isArray(value) ? value : [value]))
  @IsArray()
  @IsString({ each: true })
  include?: string[];
}
