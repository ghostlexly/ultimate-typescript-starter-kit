import { IsOptional, IsString, MinLength } from 'class-validator';

// refreshToken can arrive either in the body or via cookie, so the field is optional here
export class RefreshTokenRequest {
  @IsOptional()
  @IsString()
  @MinLength(1)
  refreshToken?: string;
}
