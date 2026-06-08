import { IsNumber, IsInt, Min, Max } from 'class-validator';

export class UpdateProgressDto {
  @IsInt()
  @Min(1)
  levelId: number;

  @IsNumber()
  @Min(0)
  score: number;

  @IsInt()
  @Min(0)
  @Max(3)
  stars: number;

  @IsInt()
  @Min(0)
  moves: number;

  @IsInt()
  @Min(0)
  time: number;
}