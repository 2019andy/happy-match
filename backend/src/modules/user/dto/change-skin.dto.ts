import { IsString } from 'class-validator';

export class ChangeSkinDto {
  @IsString()
  skinId: string;
}