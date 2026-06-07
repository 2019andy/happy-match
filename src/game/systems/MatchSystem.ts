import { Board } from '../objects/Board';
import { Tile, Match, MatchType, PowerUpType, TileType } from '../types';
import { GameConfig } from '../config/GameConfig';

export class MatchSystem {
  private board: Board;
  
  constructor(board: Board) {
    this.board = board;
  }
  
  public checkMatches(): Match[] {
    const matches: Match[] = [];
    
    matches.push(...this.checkLTMatches());
    matches.push(...this.checkHorizontalMatches());
    matches.push(...this.checkVerticalMatches());
    
    return matches;
  }
  
  private checkHorizontalMatches(): Match[] {
    const matches: Match[] = [];
    
    for (let y = 0; y < this.board.getHeight(); y++) {
      for (let x = 0; x < this.board.getWidth() - 2; x++) {
        const match = this.findHorizontalMatch(x, y);
        if (match.length >= 3) {
          matches.push({
            tiles: match,
            type: MatchType.HORIZONTAL,
            length: match.length
          });
          x += match.length - 1;
        }
      }
    }
    
    return matches;
  }
  
  private findHorizontalMatch(startX: number, y: number): Tile[] {
    const tiles: Tile[] = [];
    const startTile = this.board.getTile(startX, y);
    
    if (!startTile || startTile.isObstacle) {
      return tiles;
    }
    
    for (let x = startX; x < this.board.getWidth(); x++) {
      const tile = this.board.getTile(x, y);
      if (tile && !tile.isObstacle && tile.type === startTile.type) {
        tiles.push(tile);
      } else {
        break;
      }
    }
    
    return tiles;
  }
  
  private checkVerticalMatches(): Match[] {
    const matches: Match[] = [];
    
    for (let x = 0; x < this.board.getWidth(); x++) {
      for (let y = 0; y < this.board.getHeight() - 2; y++) {
        const match = this.findVerticalMatch(x, y);
        if (match.length >= 3) {
          matches.push({
            tiles: match,
            type: MatchType.VERTICAL,
            length: match.length
          });
          y += match.length - 1;
        }
      }
    }
    
    return matches;
  }
  
  private findVerticalMatch(x: number, startY: number): Tile[] {
    const tiles: Tile[] = [];
    const startTile = this.board.getTile(x, startY);
    
    if (!startTile || startTile.isObstacle) {
      return tiles;
    }
    
    for (let y = startY; y < this.board.getHeight(); y++) {
      const tile = this.board.getTile(x, y);
      if (tile && !tile.isObstacle && tile.type === startTile.type) {
        tiles.push(tile);
      } else {
        break;
      }
    }
    
    return tiles;
  }
  
  private checkLTMatches(): Match[] {
    const matches: Match[] = [];
    
    for (let y = 0; y < this.board.getHeight(); y++) {
      for (let x = 0; x < this.board.getWidth(); x++) {
        const tile = this.board.getTile(x, y);
        if (!tile || tile.isObstacle) {
          continue;
        }
        
        const ltMatch = this.findLTMatch(x, y, tile.type);
        if (ltMatch.length >= 5) {
          matches.push({
            tiles: ltMatch,
            type: MatchType.LT,
            length: ltMatch.length
          });
        }
      }
    }
    
    return matches;
  }
  
  private findLTMatch(x: number, y: number, _type: string): Tile[] {
    const tiles: Tile[] = [];
    const horizontalTiles = this.findHorizontalMatch(x, y);
    const verticalTiles = this.findVerticalMatch(x, y);
    
    if (horizontalTiles.length >= 3 && verticalTiles.length >= 3) {
      tiles.push(...horizontalTiles);
      for (const tile of verticalTiles) {
        if (!horizontalTiles.find(t => t.x === tile.x && t.y === tile.y)) {
          tiles.push(tile);
        }
      }
    }
    
    return tiles;
  }
  
  public executeMatch(match: Match): void {
    let centerTile: Tile | null = null;
    if (match.tiles.length > 0) {
      const centerIndex = Math.floor(match.length / 2);
      centerTile = match.tiles[centerIndex];
    }
    
    for (const tile of match.tiles) {
      this.board.removeTile(tile.x, tile.y);
    }
    
    if (match.length >= 4 && centerTile) {
      this.generatePowerUp(match, centerTile);
    }
    
    this.board.dropTiles();
  }
  
  private generatePowerUp(match: Match, centerTile: Tile): void {
    if (match.length === 4) {
      const powerUpType = match.type === MatchType.HORIZONTAL 
        ? PowerUpType.SWEET_RAY_V 
        : PowerUpType.SWEET_RAY_H;
      
      const powerUpTile: Tile = {
        x: centerTile.x,
        y: centerTile.y,
        type: centerTile.type,
        isObstacle: false,
        isPowerUp: true,
        powerUpType: powerUpType
      };
      
      this.board.setTile(centerTile.x, centerTile.y, powerUpTile);
    } else if (match.length >= 5) {
      let powerUpType: PowerUpType;
      
      if (match.type === MatchType.LT) {
        powerUpType = PowerUpType.FLOWER_BOMB;
      } else {
        powerUpType = PowerUpType.RAINBOW_CANDY;
      }
      
      const powerUpTile: Tile = {
        x: centerTile.x,
        y: centerTile.y,
        type: centerTile.type,
        isObstacle: false,
        isPowerUp: true,
        powerUpType: powerUpType
      };
      
      this.board.setTile(centerTile.x, centerTile.y, powerUpTile);
    }
  }
  
  public executePowerUp(tile: Tile): Tile[] {
    const affectedTiles: Tile[] = [];
    
    if (!tile.isPowerUp || !tile.powerUpType) {
      return affectedTiles;
    }
    
    switch (tile.powerUpType) {
      case PowerUpType.SWEET_RAY_H:
        for (let x = 0; x < this.board.getWidth(); x++) {
          const targetTile = this.board.getTile(x, tile.y);
          if (targetTile) {
            affectedTiles.push(targetTile);
            this.board.removeTile(x, tile.y);
          }
        }
        break;
        
      case PowerUpType.SWEET_RAY_V:
        for (let y = 0; y < this.board.getHeight(); y++) {
          const targetTile = this.board.getTile(tile.x, y);
          if (targetTile) {
            affectedTiles.push(targetTile);
            this.board.removeTile(tile.x, y);
          }
        }
        break;
        
      case PowerUpType.FLOWER_BOMB:
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = tile.x + dx;
            const ny = tile.y + dy;
            if (nx >= 0 && nx < this.board.getWidth() && ny >= 0 && ny < this.board.getHeight()) {
              const targetTile = this.board.getTile(nx, ny);
              if (targetTile) {
                affectedTiles.push(targetTile);
                this.board.removeTile(nx, ny);
              }
            }
          }
        }
        break;
        
      case PowerUpType.RAINBOW_CANDY:
        const targetType = tile.type;
        for (let y = 0; y < this.board.getHeight(); y++) {
          for (let x = 0; x < this.board.getWidth(); x++) {
            const targetTile = this.board.getTile(x, y);
            if (targetTile && targetTile.type === targetType) {
              affectedTiles.push(targetTile);
              this.board.removeTile(x, y);
            }
          }
        }
        break;
    }
    
    this.board.removeTile(tile.x, tile.y);
    this.board.dropTiles();
    
    return affectedTiles;
  }
  
  public canSwap(x1: number, y1: number, x2: number, y2: number): boolean {
    this.board.swapTiles(x1, y1, x2, y2);
    const matches = this.checkMatches();
    this.board.swapTiles(x1, y1, x2, y2);
    return matches.length > 0;
  }
  
  public executeChainReaction(): Match[] {
    const allMatches: Match[] = [];
    let iterations = 0;
    const maxIterations = GameConfig.MAX_CHAIN_REACTION;
    
    while (iterations < maxIterations) {
      const matches = this.checkMatches();
      
      if (matches.length === 0) {
        break;
      }
      
      allMatches.push(...matches);
      
      for (const match of matches) {
        this.executeMatch(match);
      }
      
      iterations++;
    }
    
    return allMatches;
  }
  
  public executeSuperPowerUp(tile1: Tile, tile2: Tile): Tile[] {
    const affectedTiles: Tile[] = [];
    
    if (!tile1.isPowerUp || !tile2.isPowerUp) {
      return affectedTiles;
    }
    
    for (let y = 0; y < this.board.getHeight(); y++) {
      for (let x = 0; x < this.board.getWidth(); x++) {
        const targetTile = this.board.getTile(x, y);
        if (targetTile) {
          affectedTiles.push(targetTile);
          this.board.removeTile(x, y);
        }
      }
    }
    
    this.board.dropTiles();
    
    return affectedTiles;
  }
}
