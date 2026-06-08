import { IsString, IsOptional } from 'class-validator';

export class WechatLoginDto {
  @IsString()
  code: string;

  @IsString()
  @IsOptional()
  openId?: string;

  @IsString()
  @IsOptional()
  unionId?: string;

  @IsString()
  @IsOptional()
  nickname?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}