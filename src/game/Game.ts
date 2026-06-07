import { Board } from './objects/Board';
import { MatchSystem } from './systems/MatchSystem';
import { ScoreSystem } from './systems/ScoreSystem';
import { EnergySystem } from './systems/EnergySystem';
import { LevelGenerator } from './config/LevelGenerator';
import { StorageSystem } from './utils/StorageSystem';
import { GameEventManager, GAME_EVENTS } from './utils/GameEventManager';
import { LevelConfig, GameState, Tile, HistoryState } from './types';

export class Game {
  private board: Board;
  private matchSystem: MatchSystem;
  private scoreSystem: ScoreSystem;
  private energySystem: EnergySystem;
  private eventManager: GameEventManager;
  
  private levelConfig: LevelConfig;
  private gameState: GameState;
  private history: HistoryState | null = null;
  private canUndo: boolean = true;
  private isProcessing: boolean = false;
  
  constructor(levelId: number = 1) {
    const userData = StorageSystem.getUserData();
    const failedAttempts = userData.failedAttempts[levelId] || 0;
    
    let baseConfig = LevelGenerator.generateLevel(levelId);
    this.levelConfig = LevelGenerator.adjustDifficultyForRetry(baseConfig, failedAttempts);
    
    this.board = new Board(this.levelConfig);
    this.matchSystem = new MatchSystem(this.board);
    this.scoreSystem = new ScoreSystem();
    this.energySystem = new EnergySystem();
    this.eventManager = new GameEventManager();
    
    this.gameState = {
      score: 0,
      moves: this.levelConfig.moves,
      targetScore: this.levelConfig.targetScore,
      levelId: levelId,
      isPlaying: true,
      isPaused: false,
      chainMultiplier: 1,
      collectedItems: { cream: 0, petal: 0, pearl: 0 },
      remainingObstacles: this.levelConfig.obstacles.length
    };
  }
  
  public getBoard(): Board {
    return this.board;
  }
  
  public getGameState(): GameState {
    return { ...this.gameState };
  }
  
  public getLevelConfig(): LevelConfig {
    return { ...this.levelConfig };
  }
  
  public canUndoAction(): boolean {
    return this.canUndo && this.history !== null;
  }
  
  public undo(): boolean {
    if (!this.canUndo || this.history === null) {
      return false;
    }
    
    const restoredBoard = new Board();
    restoredBoard.getGrid().forEach((row, y) => {
      row.forEach((_, x) => {
        const tile = this.history.board[y][x];
        if (tile) {
          restoredBoard.setTile(x, y, { ...tile });
        }
      });
    });
    
    this.board = restoredBoard;
    this.matchSystem = new MatchSystem(this.board);
    this.gameState.score = this.history.score;
    this.gameState.moves = this.history.moves;
    this.gameState.chainMultiplier = this.history.chainMultiplier;
    this.canUndo = false;
    
    this.eventManager.emit(GAME_EVENTS.SCORE_UPDATE, this.gameState.score);
    this.eventManager.emit(GAME_EVENTS.MOVES_UPDATE, this.gameState.moves);
    
    return true;
  }
  
  public selectTile(x: number, y: number): boolean {
    if (this.isProcessing || !this.gameState.isPlaying) {
      return false;
    }
    
    const tile = this.board.getTile(x, y);
    if (!tile || tile.isObstacle) {
      return false;
    }
    
    return true;
  }
  
  public swapTiles(x1: number, y1: number, x2: number, y2: number): boolean {
    if (this.isProcessing || !this.gameState.isPlaying) {
      return false;
    }
    
    if (!this.board.isAdjacent(x1, y1, x2, y2)) {
      return false;
    }
    
    const tile1 = this.board.getTile(x1, y1);
    const tile2 = this.board.getTile(x2, y2);
    
    if (!tile1 || !tile2 || tile1.isObstacle || tile2.isObstacle) {
      return false;
    }
    
    if (!this.matchSystem.canSwap(x1, y1, x2, y2)) {
      return false;
    }
    
    this.saveHistory();
    
    this.board.swapTiles(x1, y1, x2, y2);
    this.eventManager.emit(GAME_EVENTS.TILE_SWAPPED, x1, y1, x2, y2);
    
    this.processMatches();
    
    return true;
  }
  
  private saveHistory(): void {
    if (this.canUndo && this.history === null) {
      const boardCopy: Tile[][] = [];
      this.board.getGrid().forEach(row => {
        const rowCopy: Tile[] = [];
        row.forEach(tile => {
          if (tile) {
            rowCopy.push({ ...tile });
          }
        });
        boardCopy.push(rowCopy);
      });
      
      this.history = {
        board: boardCopy,
        score: this.gameState.score,
        moves: this.gameState.moves,
        chainMultiplier: this.gameState.chainMultiplier
      };
    }
  }
  
  private async processMatches(): Promise<void> {
    this.isProcessing = true;
    
    // 每次操作只减少1步
    this.gameState.moves--;
    this.eventManager.emit(GAME_EVENTS.MOVES_UPDATE, this.gameState.moves);
    
    let matches = this.matchSystem.checkMatches();
    
    while (matches.length > 0) {
      for (const match of matches) {
        const score = this.scoreSystem.calculateMatchScore(match);
        this.gameState.score += score;
        this.gameState.chainMultiplier = this.scoreSystem.getChainMultiplier();
        
        this.eventManager.emit(GAME_EVENTS.MATCH_FOUND, match);
        this.matchSystem.executeMatch(match);
        
        const affectedTiles = this.matchSystem.executeChainReaction();
        if (affectedTiles.length > 0) {
          this.eventManager.emit(GAME_EVENTS.CHAIN_REACTION, affectedTiles);
        }
        
        this.updateCollectedItems();
        this.updateObstacles();
        
        this.eventManager.emit(GAME_EVENTS.SCORE_UPDATE, this.gameState.score);
        
        await this.delay(300);
      }
      
      matches = this.matchSystem.checkMatches();
    }
    
    this.scoreSystem.resetChainMultiplier();
    this.gameState.chainMultiplier = 1;
    
    this.checkGameEnd();
    
    this.isProcessing = false;
  }
  
  private updateCollectedItems(): void {
    const collectTypes: ('cream' | 'petal' | 'pearl')[] = ['cream', 'petal', 'pearl'];
    const randomCollect = collectTypes[Math.floor(Math.random() * collectTypes.length)];
    
    if (this.levelConfig.collectType && Math.random() < 0.3) {
      this.gameState.collectedItems[this.levelConfig.collectType]++;
    } else if (Math.random() < 0.1) {
      this.gameState.collectedItems[randomCollect]++;
    }
  }
  
  private updateObstacles(): void {
    let remaining = 0;
    for (let y = 0; y < this.board.getHeight(); y++) {
      for (let x = 0; x < this.board.getWidth(); x++) {
        const tile = this.board.getTile(x, y);
        if (tile && tile.isObstacle) {
          remaining++;
        }
      }
    }
    this.gameState.remainingObstacles = remaining;
  }
  
  private checkGameEnd(): void {
    const isWin = this.checkWinConditions();
    
    if (isWin) {
      this.gameState.isPlaying = false;
      
      if (this.gameState.moves > 0) {
        const bonusScore = this.scoreSystem.calculateRemainingMovesScore(this.gameState.moves);
        this.gameState.score += bonusScore;
        this.eventManager.emit(GAME_EVENTS.SCORE_UPDATE, this.gameState.score);
      }
      
      this.eventManager.emit(GAME_EVENTS.GAME_WIN, this.gameState.score);
      this.eventManager.emit(GAME_EVENTS.LEVEL_COMPLETE, {
        levelId: this.levelConfig.id,
        score: this.gameState.score,
        stars: this.calculateStars()
      });
      
      this.saveLevelProgress();
    } else if (this.gameState.moves <= 0) {
      this.gameState.isPlaying = false;
      this.eventManager.emit(GAME_EVENTS.GAME_LOSE, this.gameState.score);
      this.recordFailedAttempt();
    }
  }
  
  private checkWinConditions(): boolean {
    const conditions: boolean[] = [];
    
    if (this.gameState.score >= this.levelConfig.targetScore) {
      conditions.push(true);
    }
    
    if (this.levelConfig.targetObstacles > 0 && this.gameState.remainingObstacles === 0) {
      conditions.push(true);
    }
    
    if (this.levelConfig.targetCollect > 0 && this.levelConfig.collectType) {
      const collected = this.gameState.collectedItems[this.levelConfig.collectType];
      if (collected >= this.levelConfig.targetCollect) {
        conditions.push(true);
      }
    }
    
    return conditions.length > 0 && conditions.every(c => c);
  }
  
  private calculateStars(): number {
    const ratio = this.gameState.score / this.levelConfig.targetScore;
    
    if (ratio >= 2) return 3;
    if (ratio >= 1.5) return 2;
    return 1;
  }
  
  private saveLevelProgress(): void {
    const userData = StorageSystem.getUserData();
    
    if (!userData.completedLevels.includes(this.levelConfig.id)) {
      userData.completedLevels.push(this.levelConfig.id);
    }
    
    userData.currentLevel = Math.max(userData.currentLevel, this.levelConfig.id + 1);
    userData.totalStars += this.calculateStars();
    
    const rewardCoins = this.levelConfig.rewards.find(r => r.type === 'coins')?.amount || 0;
    userData.coins += rewardCoins;
    
    const rewardEnergy = this.levelConfig.rewards.find(r => r.type === 'energy')?.amount || 0;
    userData.energy = Math.min(userData.maxEnergy, userData.energy + rewardEnergy);
    
    userData.totalScore += this.gameState.score;
    userData.highestScore = Math.max(userData.highestScore, this.gameState.score);
    userData.totalPlays += 1;
    
    this.checkAndUnlockAchievements(userData);
    this.updateDailyChallenge(userData);
    this.updateLeaderboard(userData);
    
    StorageSystem.saveUserData(userData);
  }
  
  private checkAndUnlockAchievements(userData: any): void {
    const achievements = userData.achievements;
    
    if (userData.completedLevels.length >= 1) {
      const achievement = achievements.find((a: any) => a.id === 'first_win');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockDate = Date.now();
      }
    }
    
    if (userData.completedLevels.length >= 10) {
      const achievement = achievements.find((a: any) => a.id === '10_levels');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockDate = Date.now();
      }
    }
    
    if (userData.completedLevels.length >= 50) {
      const achievement = achievements.find((a: any) => a.id === '50_levels');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockDate = Date.now();
      }
    }
    
    if (userData.totalStars >= 10) {
      const achievement = achievements.find((a: any) => a.id === '10_stars');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockDate = Date.now();
      }
    }
    
    if (this.gameState.score >= 1000) {
      const achievement = achievements.find((a: any) => a.id === '1000_score');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockDate = Date.now();
      }
    }
    
    if (userData.totalScore >= 10000) {
      const achievement = achievements.find((a: any) => a.id === '10000_score');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockDate = Date.now();
      }
    }
    
    const signInDays = StorageSystem.getSignInDays();
    if (signInDays >= 7) {
      const achievement = achievements.find((a: any) => a.id === '7_day_login');
      if (achievement && !achievement.unlocked) {
        achievement.unlocked = true;
        achievement.unlockDate = Date.now();
      }
    }
  }
  
  private updateDailyChallenge(userData: any): void {
    if (!userData.dailyChallenge) return;
    
    const today = new Date().toDateString();
    if (userData.dailyChallenge.date !== today) {
      userData.dailyChallenge = StorageSystem.generateDailyChallenge();
      return;
    }
    
    if (userData.dailyChallenge.completed) return;
    
    switch (userData.dailyChallenge.type) {
      case 'score':
        userData.dailyChallenge.progress += this.gameState.score;
        break;
      case 'stars':
        userData.dailyChallenge.progress += this.calculateStars();
        break;
      case 'levels':
        userData.dailyChallenge.progress += 1;
        break;
    }
    
    if (userData.dailyChallenge.progress >= userData.dailyChallenge.target) {
      userData.dailyChallenge.completed = true;
      userData.coins += userData.dailyChallenge.reward.coins;
      userData.diamonds += userData.dailyChallenge.reward.diamonds;
    }
  }
  
  private updateLeaderboard(userData: any): void {
    StorageSystem.updateLeaderboard({
      id: userData.id,
      nickname: userData.nickname,
      avatar: userData.avatar,
      score: userData.totalScore,
      rank: 0
    });
  }
  
  private recordFailedAttempt(): void {
    const userData = StorageSystem.getUserData();
    
    if (!userData.failedAttempts[this.levelConfig.id]) {
      userData.failedAttempts[this.levelConfig.id] = 0;
    }
    userData.failedAttempts[this.levelConfig.id]++;
    
    StorageSystem.saveUserData(userData);
  }
  
  public consumeEnergy(): boolean {
    return this.energySystem.consumeEnergy();
  }
  
  public getEnergy(): number {
    return this.energySystem.getEnergy();
  }
  
  public getMaxEnergy(): number {
    return this.energySystem.getMaxEnergy();
  }
  
  public on(event: string, callback: (...args: any[]) => void): void {
    this.eventManager.on(event, callback);
  }
  
  public off(event: string, callback: (...args: any[]) => void): void {
    this.eventManager.off(event, callback);
  }
  
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
