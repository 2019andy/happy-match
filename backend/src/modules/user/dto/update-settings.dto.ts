import { IsOptional, IsBoolean } from 'class-validator';

export class UpdateSettingsDto {
  @IsOptional()
  @IsBoolean()
  isEyeCareMode?: boolean;

  @IsOptional()
  @IsBoolean()
  soundEnabled?: boolean;

  @IsOptional()
  @IsBoolean()
  vibrationEnabled?: boolean;
}