import { TileType, PowerUpType, ObstacleType } from '../types';

export const GameConfig = {
  BOARD_WIDTH: 7,
  BOARD_HEIGHT: 7,
  
  TILE_SIZE: 56,
  TILE_SPACING: 8,
  TILE_RADIUS: 12,
  
  BOARD_OFFSET_X: 20,
  BOARD_OFFSET_Y: 80,
  
  BASE_SCORE: 50,
  EXTRA_SCORE: 25,
  LINE_POWERUP_MULTIPLIER: 2,
  BOMB_POWERUP_MULTIPLIER: 3,
  RAINBOW_POWERUP_MULTIPLIER: 5,
  REMAINING_MOVES_SCORE: 100,
  
  INITIAL_ENERGY: 30,
  MAX_ENERGY: 30,
  ENERGY_COST_PER_LEVEL: 5,
  ENERGY_RECOVERY_TIME: 6 * 60 * 1000,
  
  STAR_MULTIPLIER_1: 1,
  STAR_MULTIPLIER_2: 1.5,
  STAR_MULTIPLIER_3: 2,
  
  TILE_COLORS: {
    [TileType.STRAWBERRY]: '#FFB5B5',
    [TileType.CREAM]: '#FFF4E6',
    [TileType.DAISY]: '#FFF8DC',
    [TileType.BOW]: '#FFB6C1',
    [TileType.PEARL]: '#E6E6FA',
    [TileType.CANDY]: '#DDA0DD'
  },
  
  TILE_COLORS_EYE_CARE: {
    [TileType.STRAWBERRY]: '#FFD6D6',
    [TileType.CREAM]: '#FFF8F0',
    [TileType.DAISY]: '#FFFBE6',
    [TileType.BOW]: '#FFD6E0',
    [TileType.PEARL]: '#F0F0FA',
    [TileType.CANDY]: '#E8D4E8'
  },
  
  POWERUP_COLORS: {
    [PowerUpType.SWEET_RAY_H]: '#87CEEB',
    [PowerUpType.SWEET_RAY_V]: '#87CEEB',
    [PowerUpType.FLOWER_BOMB]: '#FFB6C1',
    [PowerUpType.RAINBOW_CANDY]: '#FFE4E1'
  },
  
  OBSTACLE_COLORS: {
    [ObstacleType.FROST]: '#E0FFFF',
    [ObstacleType.VINE]: '#98FB98',
    [ObstacleType.GIFT]: '#FFB6C1',
    [ObstacleType.BUBBLE]: '#87CEEB'
  },
  
  MAX_CHAIN_REACTION: 10,
  
  MAX_AD_SHOWS_PER_DAY: 15,
  
  NEWBIE_LEVELS: 15,
  NEWBIE_EXTRA_MOVES: 5,
  NEWBIE_DROP_RATE_BONUS: 0.3,
  
  DIFFICULTY_ADJUST_THRESHOLD: 3,
  DIFFICULTY_BONUS_MOVES: 5,
  DIFFICULTY_OBSTACLE_REDUCTION: 0.3
};

export const TILE_TYPES = [
  TileType.STRAWBERRY,
  TileType.CREAM,
  TileType.DAISY,
  TileType.BOW,
  TileType.PEARL,
  TileType.CANDY
];

export const POWERUP_TYPES = [
  PowerUpType.SWEET_RAY_H,
  PowerUpType.SWEET_RAY_V,
  PowerUpType.FLOWER_BOMB,
  PowerUpType.RAINBOW_CANDY
];

export const OBSTACLE_TYPES = [
  ObstacleType.FROST,
  ObstacleType.VINE,
  ObstacleType.GIFT,
  ObstacleType.BUBBLE
];
