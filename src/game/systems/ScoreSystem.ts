import { Match, PowerUpType, Tile } from '../types';
import { GameConfig } from '../config/GameConfig';

export class ScoreSystem {
  private score: number = 0;
  private chainMultiplier: number = 1;
  
  public getScore(): number {
    return this.score;
  }
  
  public getChainMultiplier(): number {
    return this.chainMultiplier;
  }
  
  public reset(): void {
    this.score = 0;
    this.chainMultiplier = 1;
  }
  
  public calculateMatchScore(match: Match): number {
    const baseScore = GameConfig.BASE_SCORE;
    const extraScore = GameConfig.EXTRA_SCORE;
    
    let matchScore = baseScore;
    if (match.length > 3) {
      matchScore += (match.length - 3) * extraScore;
    }
    
    matchScore *= this.chainMultiplier;
    
    this.score += matchScore;
    this.chainMultiplier++;
    
    return matchScore;
  }
  
  public calculatePowerUpScore(powerUpType: PowerUpType, affectedCount: number): number {
    let multiplier = 1;
    
    switch (powerUpType) {
      case PowerUpType.SWEET_RAY_H:
      case PowerUpType.SWEET_RAY_V:
        multiplier = GameConfig.LINE_POWERUP_MULTIPLIER;
        break;
      case PowerUpType.FLOWER_BOMB:
        multiplier = GameConfig.BOMB_POWERUP_MULTIPLIER;
        break;
      case PowerUpType.RAINBOW_CANDY:
        multiplier = GameConfig.RAINBOW_POWERUP_MULTIPLIER;
        break;
    }
    
    const powerUpScore = affectedCount * GameConfig.EXTRA_SCORE * multiplier * this.chainMultiplier;
    this.score += powerUpScore;
    
    return powerUpScore;
  }
  
  public calculateSuperPowerUpScore(affectedCount: number): number {
    const score = affectedCount * GameConfig.BASE_SCORE * 10 * this.chainMultiplier;
    this.score += score;
    return score;
  }
  
  public calculateRemainingMovesScore(remainingMoves: number): number {
    const score = remainingMoves * GameConfig.REMAINING_MOVES_SCORE;
    this.score += score;
    return score;
  }
  
  public addScore(points: number): void {
    this.score += points;
  }
  
  public resetChainMultiplier(): void {
    this.chainMultiplier = 1;
  }
}
