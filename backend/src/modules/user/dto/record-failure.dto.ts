import { IsInt, Min } from 'class-validator';

export class RecordFailureDto {
  @IsInt()
  @Min(1)
  levelId: number;
}