import { LevelConfig, LevelType, ObstacleType, Obstacle, Reward } from '../types';
import { GameConfig } from './GameConfig';

export class LevelGenerator {
  public static generateLevel(levelId: number): LevelConfig {
    const isNewbie = levelId <= GameConfig.NEWBIE_LEVELS;
    const baseDifficulty = Math.min(levelId / 10, 1);
    
    const targetScore = this.calculateTargetScore(levelId, isNewbie);
    const moves = this.calculateMoves(levelId, isNewbie);
    const obstacles = this.generateObstacles(levelId, isNewbie);
    const rewards = this.generateRewards(levelId);
    
    const levelTypes = [LevelType.SCORE];
    if (levelId > 3) {
      levelTypes.push(LevelType.OBSTACLE);
    }
    if (levelId > 5) {
      levelTypes.push(LevelType.COLLECT);
    }
    
    const selectedType = levelTypes[Math.floor(Math.random() * levelTypes.length)];
    
    let targetObstacles = 0;
    let targetCollect = 0;
    let collectType: 'cream' | 'petal' | 'pearl' | undefined;
    
    if (selectedType === LevelType.OBSTACLE) {
      targetObstacles = obstacles.length;
    } else if (selectedType === LevelType.COLLECT) {
      targetCollect = Math.floor(5 + levelId * 1.5);
      const collectTypes: ('cream' | 'petal' | 'pearl')[] = ['cream', 'petal', 'pearl'];
      collectType = collectTypes[Math.floor(Math.random() * collectTypes.length)];
    }
    
    return {
      id: levelId,
      name: `第 ${levelId} 关`,
      type: selectedType,
      targetScore,
      targetObstacles,
      targetCollect,
      collectType,
      moves,
      boardWidth: GameConfig.BOARD_WIDTH,
      boardHeight: GameConfig.BOARD_HEIGHT,
      obstacles,
      rewards
    };
  }
  
  private static calculateTargetScore(levelId: number, isNewbie: boolean): number {
    const baseScore = 800;
    const multiplier = isNewbie ? 0.5 : 1;
    return Math.floor(baseScore * (1 + (levelId - 1) * 0.4) * multiplier);
  }
  
  private static calculateMoves(levelId: number, isNewbie: boolean): number {
    let baseMoves = 20 + Math.floor(levelId * 1.5);
    if (isNewbie) {
      baseMoves += GameConfig.NEWBIE_EXTRA_MOVES;
    }
    return baseMoves;
  }
  
  private static generateObstacles(levelId: number, isNewbie: boolean): Obstacle[] {
    const obstacles: Obstacle[] = [];
    const maxObstacles = isNewbie ? 3 : Math.min(5 + Math.floor(levelId * 0.5), 12);
    
    if (isNewbie) {
      return obstacles;
    }
    
    const obstacleTypes = [ObstacleType.FROST, ObstacleType.VINE, ObstacleType.GIFT, ObstacleType.BUBBLE];
    
    for (let i = 0; i < maxObstacles; i++) {
      const x = Math.floor(Math.random() * GameConfig.BOARD_WIDTH);
      const y = Math.floor(Math.random() * (GameConfig.BOARD_HEIGHT - 2)) + 2;
      
      if (!obstacles.find(o => o.x === x && o.y === y)) {
        obstacles.push({
          x,
          y,
          type: obstacleTypes[Math.floor(Math.random() * obstacleTypes.length)],
          health: 1 + Math.floor(Math.random() * Math.min(levelId, 3))
        });
      }
    }
    
    return obstacles;
  }
  
  private static generateRewards(levelId: number): Reward[] {
    const rewards: Reward[] = [];
    
    rewards.push({
      type: 'coins',
      amount: 50 + levelId * 10
    });
    
    if (levelId % 5 === 0) {
      rewards.push({
        type: 'energy',
        amount: 5
      });
    }
    
    return rewards;
  }
  
  public static adjustDifficultyForRetry(levelConfig: LevelConfig, failedAttempts: number): LevelConfig {
    if (failedAttempts < GameConfig.DIFFICULTY_ADJUST_THRESHOLD) {
      return levelConfig;
    }
    
    const adjustmentFactor = (failedAttempts - GameConfig.DIFFICULTY_ADJUST_THRESHOLD + 1) * 0.1;
    
    return {
      ...levelConfig,
      moves: levelConfig.moves + GameConfig.DIFFICULTY_BONUS_MOVES,
      obstacles: levelConfig.obstacles.slice(0, Math.floor(levelConfig.obstacles.length * (1 - GameConfig.DIFFICULTY_OBSTACLE_REDUCTION))),
      targetScore: Math.floor(levelConfig.targetScore * (1 - adjustmentFactor)),
      targetCollect: levelConfig.targetCollect ? Math.floor(levelConfig.targetCollect * (1 - adjustmentFactor)) : undefined
    };
  }
}
