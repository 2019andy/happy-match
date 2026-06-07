import { LevelConfig, Obstacle, ObstacleType } from '../types';

export interface DifficultyConfig {
  baseMoves: number;
  maxMoves: number;
  obstacleCount: number;
  targetScore: number;
  dropProbability: number;
  powerUpProbability: number;
}

export interface PlayerPerformance {
  levelId: number;
  attempts: number;
  success: boolean;
  movesUsed: number;
  score: number;
  timestamp: number;
}

export interface DifficultyState {
  currentLevel: number;
  consecutiveFailures: number;
  recentPerformance: PlayerPerformance[];
  difficultyMultiplier: number;
  lastAdjustment: number;
}

export class DynamicDifficultySystem {
  private static instance: DynamicDifficultySystem;
  private state: DifficultyState;
  private readonly ADJUSTMENT_INTERVAL = 300000;
  private readonly MAX_CONSECUTIVE_FAILURES = 3;
  private readonly DIFFICULTY_INCREASE_THRESHOLD = 5;
  private readonly DIFFICULTY_DECREASE_THRESHOLD = 3;
  
  private constructor() {
    this.state = this.loadState();
  }
  
  public static getInstance(): DynamicDifficultySystem {
    if (!DynamicDifficultySystem.instance) {
      DynamicDifficultySystem.instance = new DynamicDifficultySystem();
    }
    return DynamicDifficultySystem.instance;
  }
  
  private loadState(): DifficultyState {
    const saved = localStorage.getItem('dynamic_difficulty');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return this.getDefaultState();
      }
    }
    return this.getDefaultState();
  }
  
  private getDefaultState(): DifficultyState {
    return {
      currentLevel: 1,
      consecutiveFailures: 0,
      recentPerformance: [],
      difficultyMultiplier: 1.0,
      lastAdjustment: 0
    };
  }
  
  private saveState(): void {
    localStorage.setItem('dynamic_difficulty', JSON.stringify(this.state));
  }
  
  public recordPerformance(levelId: number, success: boolean, movesUsed: number, score: number): void {
    const performance: PlayerPerformance = {
      levelId,
      attempts: 1,
      success,
      movesUsed,
      score,
      timestamp: Date.now()
    };
    
    this.state.recentPerformance.push(performance);
    
    if (this.state.recentPerformance.length > 20) {
      this.state.recentPerformance.shift();
    }
    
    this.state.currentLevel = levelId;
    
    if (success) {
      this.state.consecutiveFailures = 0;
    } else {
      this.state.consecutiveFailures++;
    }
    
    this.saveState();
  }
  
  public adjustDifficulty(): void {
    const now = Date.now();
    
    if (now - this.state.lastAdjustment < this.ADJUSTMENT_INTERVAL) {
      return;
    }
    
    if (this.state.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      this.decreaseDifficulty();
      this.state.lastAdjustment = now;
      this.saveState();
      return;
    }
    
    const recentSuccesses = this.state.recentPerformance
      .slice(-this.DIFFICULTY_INCREASE_THRESHOLD)
      .filter(p => p.success);
    
    if (recentSuccesses.length >= this.DIFFICULTY_INCREASE_THRESHOLD) {
      this.increaseDifficulty();
      this.state.lastAdjustment = now;
      this.saveState();
    }
  }
  
  private decreaseDifficulty(): void {
    this.state.difficultyMultiplier = Math.max(0.7, this.state.difficultyMultiplier - 0.1);
    console.log(`难度降低，当前倍率: ${this.state.difficultyMultiplier}`);
  }
  
  private increaseDifficulty(): void {
    this.state.difficultyMultiplier = Math.min(1.5, this.state.difficultyMultiplier + 0.05);
    console.log(`难度增加，当前倍率: ${this.state.difficultyMultiplier}`);
  }
  
  public getAdjustedLevelConfig(baseConfig: LevelConfig): LevelConfig {
    const multiplier = this.state.difficultyMultiplier;
    const adjusted: LevelConfig = { ...baseConfig };
    
    if (this.state.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES) {
      adjusted.moves = Math.min(
        adjusted.moves + 5,
        Math.floor(baseConfig.moves * 1.5)
      );
      
      const reducedObstacleCount = Math.max(
        Math.floor(baseConfig.obstacles.length * 0.7),
        0
      );
      adjusted.obstacles = this.reduceObstacles(baseConfig.obstacles, reducedObstacleCount);
      
      adjusted.targetScore = Math.floor(baseConfig.targetScore * 0.8);
    } else {
      adjusted.targetScore = Math.floor(baseConfig.targetScore * multiplier);
      const obstacleCount = Math.floor(baseConfig.obstacles.length * multiplier);
      adjusted.obstacles = this.adjustObstacleCount(baseConfig.obstacles, obstacleCount);
    }
    
    return adjusted;
  }
  
  private reduceObstacles(obstacles: Obstacle[], targetCount: number): Obstacle[] {
    if (obstacles.length <= targetCount) {
      return [...obstacles];
    }
    return obstacles.slice(0, targetCount);
  }
  
  private adjustObstacleCount(obstacles: Obstacle[], targetCount: number): Obstacle[] {
    if (obstacles.length >= targetCount) {
      return obstacles.slice(0, targetCount);
    }
    
    const additionalObstacles: Obstacle[] = [];
    const types = Object.values(ObstacleType);
    
    for (let i = obstacles.length; i < targetCount; i++) {
      additionalObstacles.push({
        x: Math.floor(Math.random() * 7),
        y: Math.floor(Math.random() * 7),
        type: types[Math.floor(Math.random() * types.length)],
        health: 1
      });
    }
    
    return [...obstacles, ...additionalObstacles];
  }
  
  public needsHelp(): boolean {
    return this.state.consecutiveFailures >= this.MAX_CONSECUTIVE_FAILURES;
  }
  
  public getDifficultyState(): DifficultyState {
    return { ...this.state };
  }
  
  public reset(): void {
    this.state = this.getDefaultState();
    this.saveState();
  }
  
  public getNewbieConfig(baseConfig: LevelConfig, levelId: number): LevelConfig {
    if (levelId > 15) {
      return baseConfig;
    }
    
    const newbieFactor = 1 - (levelId - 1) * 0.04;
    
    const adjustedMoves = Math.floor(baseConfig.moves * (1.2 + newbieFactor * 0.3));
    const adjustedObstacleCount = Math.floor(baseConfig.obstacles.length * newbieFactor * 0.5);
    
    return {
      ...baseConfig,
      moves: adjustedMoves,
      obstacles: this.reduceObstacles(baseConfig.obstacles, adjustedObstacleCount),
      targetScore: Math.floor(baseConfig.targetScore * newbieFactor)
    };
  }
}

export const dynamicDifficultySystem = DynamicDifficultySystem.getInstance();