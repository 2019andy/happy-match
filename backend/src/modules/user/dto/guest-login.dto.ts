import { IsString } from 'class-validator';

export class GuestLoginDto {
  @IsString()
  deviceId: string;
}