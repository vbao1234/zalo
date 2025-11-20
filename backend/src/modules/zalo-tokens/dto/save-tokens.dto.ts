import { IsString, IsNumber, IsOptional, IsObject } from 'class-validator';

export class SaveTokensDto {
  @IsString()
  accessToken: string;

  @IsString()
  refreshToken: string;

  @IsNumber()
  expiresIn: number; // seconds

  @IsOptional()
  @IsObject()
  zaloUserInfo?: {
    id?: string;
    name?: string;
    avatar?: string;
    phone?: string;
  };
}
