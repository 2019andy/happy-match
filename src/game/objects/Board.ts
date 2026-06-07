import { Tile, TileType, LevelConfig } from '../types';
import { GameConfig, TILE_TYPES } from '../config/GameConfig';

export class Board {
  private grid: (Tile | null)[][];
  private width: number;
  private height: number;
  
  constructor(levelConfig?: LevelConfig) {
    this.width = GameConfig.BOARD_WIDTH;
    this.height = GameConfig.BOARD_HEIGHT;
    this.grid = [];
    this.initializeBoard(levelConfig);
  }
  
  private initializeBoard(levelConfig?: LevelConfig): void {
    for (let y = 0; y < this.height; y++) {
      this.grid[y] = [];
      for (let x = 0; x < this.width; x++) {
        const tile = this.generateTile(x, y, levelConfig);
        this.grid[y][x] = tile;
      }
    }
    this.removeInitialMatches();
  }
  
  private generateTile(x: number, y: number, levelConfig?: LevelConfig): Tile {
    const obstacle = levelConfig?.obstacles.find(o => o.x === x && o.y === y);
    
    if (obstacle) {
      return {
        x,
        y,
        type: TileType.STRAWBERRY,
        isObstacle: true,
        obstacleType: obstacle.type,
        obstacleHealth: obstacle.health,
        isPowerUp: false
      };
    }
    
    const tileType = this.generateTileType(x, y);
    
    return {
      x,
      y,
      type: tileType,
      isObstacle: false,
      isPowerUp: false
    };
  }
  
  private generateTileType(x: number, y: number): TileType {
    const availableTypes = this.getAvailableTypes(x, y);
    return availableTypes[Math.floor(Math.random() * availableTypes.length)];
  }
  
  private getAvailableTypes(x: number, y: number): TileType[] {
    const availableTypes = [...TILE_TYPES];
    
    if (x >= 2) {
      const left1 = this.grid[y]?.[x - 1];
      const left2 = this.grid[y]?.[x - 2];
      
      if (left1 && left2 && left1.type === left2.type && !left1.isObstacle && !left2.isObstacle) {
        const index = availableTypes.indexOf(left1.type);
        if (index > -1) {
          availableTypes.splice(index, 1);
        }
      }
    }
    
    if (y >= 2) {
      const up1 = this.grid[y - 1]?.[x];
      const up2 = this.grid[y - 2]?.[x];
      
      if (up1 && up2 && up1.type === up2.type && !up1.isObstacle && !up2.isObstacle) {
        const index = availableTypes.indexOf(up1.type);
        if (index > -1) {
          availableTypes.splice(index, 1);
        }
      }
    }
    
    return availableTypes.length > 0 ? availableTypes : TILE_TYPES;
  }
  
  private removeInitialMatches(): void {
    let hasMatches = true;
    let iterations = 0;
    const maxIterations = 100;
    
    while (hasMatches && iterations < maxIterations) {
      hasMatches = false;
      iterations++;
      
      for (let y = 0; y < this.height; y++) {
        for (let x = 0; x < this.width; x++) {
          const tile = this.grid[y][x];
          if (tile && !tile.isObstacle) {
            if (this.hasMatchAt(x, y, tile.type)) {
              tile.type = this.generateTileType(x, y);
              hasMatches = true;
            }
          }
        }
      }
    }
  }
  
  private hasMatchAt(x: number, y: number, type: TileType): boolean {
    let horizontalCount = 1;
    for (let i = x - 1; i >= 0 && this.grid[y]?.[i]?.type === type; i--) {
      horizontalCount++;
    }
    for (let i = x + 1; i < this.width && this.grid[y]?.[i]?.type === type; i++) {
      horizontalCount++;
    }
    
    let verticalCount = 1;
    for (let i = y - 1; i >= 0 && this.grid[i]?.[x]?.type === type; i--) {
      verticalCount++;
    }
    for (let i = y + 1; i < this.height && this.grid[i]?.[x]?.type === type; i++) {
      verticalCount++;
    }
    
    return horizontalCount >= 3 || verticalCount >= 3;
  }
  
  public swapTiles(x1: number, y1: number, x2: number, y2: number): boolean {
    const tile1 = this.grid[y1][x1];
    const tile2 = this.grid[y2][x2];
    
    if (!tile1 || !tile2 || tile1.isObstacle || tile2.isObstacle) {
      return false;
    }
    
    this.grid[y1][x1] = tile2;
    this.grid[y2][x2] = tile1;
    
    tile1.x = x2;
    tile1.y = y2;
    tile2.x = x1;
    tile2.y = y1;
    
    return true;
  }
  
  public removeTile(x: number, y: number): void {
    this.grid[y][x] = null;
  }
  
  public dropTiles(): void {
    for (let x = 0; x < this.width; x++) {
      let emptySpaces = 0;
      
      for (let y = this.height - 1; y >= 0; y--) {
        const tile = this.grid[y][x];
        
        if (!tile) {
          emptySpaces++;
        } else if (emptySpaces > 0) {
          this.grid[y + emptySpaces][x] = tile;
          this.grid[y][x] = null;
          tile.y = y + emptySpaces;
        }
      }
      
      for (let y = 0; y < emptySpaces; y++) {
        const tileType = this.generateTileType(x, y);
        this.grid[y][x] = {
          x,
          y,
          type: tileType,
          isObstacle: false,
          isPowerUp: false
        };
      }
    }
  }
  
  public getGrid(): (Tile | null)[][] {
    return this.grid;
  }
  
  public getTile(x: number, y: number): Tile | null {
    return this.grid[y]?.[x] || null;
  }
  
  public setTile(x: number, y: number, tile: Tile | null): void {
    this.grid[y][x] = tile;
  }
  
  public getWidth(): number {
    return this.width;
  }
  
  public getHeight(): number {
    return this.height;
  }
  
  public isAdjacent(x1: number, y1: number, x2: number, y2: number): boolean {
    const dx = Math.abs(x1 - x2);
    const dy = Math.abs(y1 - y2);
    return (dx === 1 && dy === 0) || (dx === 0 && dy === 1);
  }
  
  public clone(): Board {
    const cloned = new Board();
    cloned.grid = this.grid.map(row => 
      row.map(tile => tile ? { ...tile } : null)
    );
    return cloned;
  }
  
  public equals(other: Board): boolean {
    if (this.width !== other.width || this.height !== other.height) {
      return false;
    }
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const t1 = this.grid[y][x];
        const t2 = other.grid[y][x];
        if (!t1 && !t2) continue;
        if (!t1 || !t2) return false;
        if (t1.type !== t2.type || t1.isObstacle !== t2.isObstacle || 
            t1.isPowerUp !== t2.isPowerUp || t1.powerUpType !== t2.powerUpType) {
          return false;
        }
      }
    }
    return true;
  }
}
