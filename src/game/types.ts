export enum TileType {
  STRAWBERRY = 'strawberry',
  CREAM = 'cream',
  DAISY = 'daisy',
  BOW = 'bow',
  PEARL = 'pearl',
  CANDY = 'candy'
}

export enum PowerUpType {
  SWEET_RAY_H = 'sweet_ray_h',
  SWEET_RAY_V = 'sweet_ray_v',
  FLOWER_BOMB = 'flower_bomb',
  RAINBOW_CANDY = 'rainbow_candy'
}

export enum ObstacleType {
  FROST = 'frost',
  VINE = 'vine',
  GIFT = 'gift',
  BUBBLE = 'bubble'
}

export enum LevelType {
  SCORE = 'score',
  OBSTACLE = 'obstacle',
  COLLECT = 'collect'
}

export enum MatchType {
  HORIZONTAL = 'horizontal',
  VERTICAL = 'vertical',
  LT = 'lt'
}

export interface Tile {
  x: number;
  y: number;
  type: TileType;
  isObstacle: boolean;
  obstacleType?: ObstacleType;
  obstacleHealth?: number;
  isPowerUp: boolean;
  powerUpType?: PowerUpType;
  collectable?: boolean;
  collectType?: 'cream' | 'petal' | 'pearl';
}

export interface Match {
  tiles: Tile[];
  type: MatchType;
  length: number;
}

export interface LevelConfig {
  id: number;
  name: string;
  type: LevelType;
  targetScore: number;
  targetObstacles: number;
  targetCollect: number;
  collectType?: 'cream' | 'petal' | 'pearl';
  moves: number;
  boardWidth: number;
  boardHeight: number;
  obstacles: Obstacle[];
  rewards: Reward[];
}

export interface Obstacle {
  x: number;
  y: number;
  type: ObstacleType;
  health: number;
}

export interface Reward {
  type: 'coins' | 'powerups' | 'energy';
  amount: number;
}

export interface GameState {
  score: number;
  moves: number;
  targetScore: number;
  levelId: number;
  isPlaying: boolean;
  isPaused: boolean;
  chainMultiplier: number;
  collectedItems: { cream: number; petal: number; pearl: number };
  remainingObstacles: number;
}

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockDate?: number;
}

export interface ShopItem {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: number;
  currency: 'coins' | 'diamonds';
  type: 'powerup' | 'energy' | 'skin' | 'special';
  amount?: number;
}

export interface Skin {
  id: string;
  name: string;
  icon: string;
  color: string;
  owned: boolean;
  active: boolean;
}

export interface DailyChallenge {
  date: string;
  type: 'score' | 'stars' | 'levels';
  target: number;
  progress: number;
  completed: boolean;
  reward: {
    coins: number;
    diamonds: number;
  };
}

export interface LeaderboardEntry {
  id: string;
  nickname: string;
  avatar: string;
  score: number;
  rank: number;
}

export interface UserData {
  id: string;
  nickname: string;
  avatar: string;
  level: number;
  currentLevel: number;
  totalStars: number;
  totalScore: number;
  highestScore: number;
  energy: number;
  maxEnergy: number;
  coins: number;
  diamonds: number;
  powerups: {
    refresh: number;
    hammer: number;
    moves: number;
  };
  completedLevels: number[];
  failedAttempts: Record<number, number>;
  achievements: Achievement[];
  skins: Skin[];
  dailyChallenge?: DailyChallenge;
  lastLoginDate: string;
  totalPlays: number;
  totalEliminations: number;
}

export interface ThemeConfig {
  isEyeCareMode: boolean;
  saturation: number;
  animationSpeed: number;
}

export interface HistoryState {
  board: Tile[][];
  score: number;
  moves: number;
  chainMultiplier: number;
}
