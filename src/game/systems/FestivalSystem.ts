import { LevelConfig, Obstacle, ObstacleType, LevelType } from '../types';

export interface FestivalTheme {
  id: string;
  name: string;
  description: string;
  icon: string;
  background: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    text: string;
  };
  tiles: {
    strawberry: string;
    cream: string;
    daisy: string;
    bow: string;
    pearl: string;
    candy: string;
  };
  obstacles: {
    frosting: string;
    vine: string;
    gift: string;
    bubble: string;
  };
  powerUps: {
    ray: string;
    bomb: string;
    rainbow: string;
  };
}

export interface FestivalLevel {
  id: string;
  festivalId: string;
  levelNumber: number;
  config: LevelConfig;
  rewards: {
    coins: number;
    diamonds: number;
    stars: number;
  };
  expiresAt: number;
}

export interface FestivalEvent {
  id: string;
  name: string;
  description: string;
  icon: string;
  startDate: number;
  endDate: number;
  theme: FestivalTheme;
  levels: FestivalLevel[];
  rewards: FestivalReward[];
}

export interface FestivalReward {
  id: string;
  name: string;
  description: string;
  icon: string;
  requirement: {
    type: 'complete_levels' | 'total_score' | 'collect_items';
    value: number;
  };
  reward: {
    type: 'coins' | 'diamonds' | 'skin' | 'powerup';
    value: number | string;
  };
  claimed: boolean;
}

export class FestivalSystem {
  private static instance: FestivalSystem;
  private currentFestivals: FestivalEvent[] = [];
  private ownedSkins: string[] = ['default'];
  
  private constructor() {
    this.loadFestivals();
  }
  
  public static getInstance(): FestivalSystem {
    if (!FestivalSystem.instance) {
      FestivalSystem.instance = new FestivalSystem();
    }
    return FestivalSystem.instance;
  }
  
  private loadFestivals(): void {
    const now = Date.now();
    
    const springFestivalTheme: FestivalTheme = {
      id: 'spring_festival',
      name: '春节',
      description: '喜庆红色主题',
      icon: '🧧',
      background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a5a 50%, #c92a2a 100%)',
      colors: {
        primary: '#ff6b6b',
        secondary: '#ffd43b',
        accent: '#ffa94d',
        text: '#ffffff'
      },
      tiles: {
        strawberry: '🧧',
        cream: '💰',
        daisy: '🎇',
        bow: '🏮',
        pearl: '✨',
        candy: '🍊'
      },
      obstacles: {
        frosting: '🧨',
        vine: '🎋',
        gift: '🎁',
        bubble: '🌟'
      },
      powerUps: {
        ray: '🔥',
        bomb: '💥',
        rainbow: '🌈'
      }
    };
    
    const valentinesTheme: FestivalTheme = {
      id: 'valentines',
      name: '情人节',
      description: '浪漫粉色主题',
      icon: '💕',
      background: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 50%, #fecfef 100%)',
      colors: {
        primary: '#ff9a9e',
        secondary: '#fecfef',
        accent: '#ff69b4',
        text: '#ffffff'
      },
      tiles: {
        strawberry: '💕',
        cream: '💘',
        daisy: '🌹',
        bow: '💝',
        pearl: '💎',
        candy: '🍫'
      },
      obstacles: {
        frosting: '💔',
        vine: '🌹',
        gift: '💝',
        bubble: '✨'
      },
      powerUps: {
        ray: '💖',
        bomb: '💗',
        rainbow: '🌈'
      }
    };
    
    const midAutumnTheme: FestivalTheme = {
      id: 'mid_autumn',
      name: '中秋节',
      description: '温馨金色主题',
      icon: '🥮',
      background: 'linear-gradient(135deg, #ffd43b 0%, #ffc078 50%, #ffa94d 100%)',
      colors: {
        primary: '#ffd43b',
        secondary: '#ffc078',
        accent: '#f59f00',
        text: '#5c4033'
      },
      tiles: {
        strawberry: '🥮',
        cream: '🌕',
        daisy: '🌙',
        bow: '🍵',
        pearl: '✨',
        candy: '🌰'
      },
      obstacles: {
        frosting: '☁️',
        vine: '🌳',
        gift: '🎑',
        bubble: '🌕'
      },
      powerUps: {
        ray: '🌙',
        bomb: '💫',
        rainbow: '🌈'
      }
    };
    
    this.currentFestivals = [
      {
        id: 'valentines_2025',
        name: '甜蜜情人节',
        description: '情人节专属关卡，完成可获得限定皮肤',
        icon: '💕',
        startDate: now - 86400000,
        endDate: now + 604800000,
        theme: valentinesTheme,
        levels: this.generateFestivalLevels('valentines_2025', 5),
        rewards: [
          {
            id: 'v1',
            name: '情人节金币',
            description: '完成3个情人节关卡',
            icon: '💰',
            requirement: { type: 'complete_levels', value: 3 },
            reward: { type: 'coins', value: 500 },
            claimed: false
          },
          {
            id: 'v2',
            name: '情人节钻石',
            description: '完成所有情人节关卡',
            icon: '💎',
            requirement: { type: 'complete_levels', value: 5 },
            reward: { type: 'diamonds', value: 50 },
            claimed: false
          },
          {
            id: 'v3',
            name: '爱心皮肤',
            description: '情人节限定皮肤',
            icon: '💕',
            requirement: { type: 'total_score', value: 10000 },
            reward: { type: 'skin', value: 'valentines' },
            claimed: false
          }
        ]
      }
    ];
  }
  
  private generateFestivalLevels(festivalId: string, count: number): FestivalLevel[] {
    const levels: FestivalLevel[] = [];
    const types = Object.values(ObstacleType);
    
    for (let i = 1; i <= count; i++) {
      const obstacleCount = Math.min(i * 2, 8);
      const obstacles: Obstacle[] = [];
      
      for (let j = 0; j < obstacleCount; j++) {
        obstacles.push({
          x: Math.floor(Math.random() * 7),
          y: Math.floor(Math.random() * 7),
          type: types[Math.floor(Math.random() * types.length)],
          health: 1
        });
      }
      
      levels.push({
        id: `${festivalId}_level_${i}`,
        festivalId,
        levelNumber: i,
        config: {
          id: i + 100,
          name: `情人节关卡 ${i}`,
          type: LevelType.SCORE,
          targetScore: 500 + i * 200,
          targetObstacles: obstacleCount,
          targetCollect: 0,
          moves: 20 + i * 2,
          boardWidth: 7,
          boardHeight: 7,
          obstacles,
          rewards: [
            { type: 'coins', amount: 100 + i * 50 },
            { type: 'powerups', amount: 1 }
          ]
        },
        rewards: {
          coins: 100 + i * 50,
          diamonds: 10 + i * 5,
          stars: 1
        },
        expiresAt: Date.now() + 604800000
      });
    }
    
    return levels;
  }
  
  public getActiveFestivals(): FestivalEvent[] {
    const now = Date.now();
    return this.currentFestivals.filter(
      f => f.startDate <= now && now <= f.endDate
    );
  }
  
  public getTheme(themeId: string): FestivalTheme | null {
    for (const festival of this.currentFestivals) {
      if (festival.theme.id === themeId) {
        return festival.theme;
      }
    }
    return null;
  }
  
  public getFestivalLevels(festivalId: string): FestivalLevel[] {
    const festival = this.currentFestivals.find(f => f.id === festivalId);
    return festival ? festival.levels : [];
  }
  
  public completeFestivalLevel(festivalId: string, levelNumber: number): FestivalReward | null {
    const festival = this.currentFestivals.find(f => f.id === festivalId);
    if (!festival) return null;
    
    const level = festival.levels.find(l => l.levelNumber === levelNumber);
    if (!level) return null;
    
    for (const reward of festival.rewards) {
      if (!reward.claimed) {
        if (reward.requirement.type === 'complete_levels') {
          const completedLevels = festival.levels.filter(l => l.levelNumber <= levelNumber).length;
          if (completedLevels >= reward.requirement.value) {
            reward.claimed = true;
            this.grantReward(reward);
            return reward;
          }
        }
      }
    }
    
    return null;
  }
  
  private grantReward(reward: FestivalReward): void {
    if (reward.reward.type === 'skin') {
      this.ownedSkins.push(reward.reward.value as string);
    }
  }
  
  public getFestivalRewards(festivalId: string): FestivalReward[] {
    const festival = this.currentFestivals.find(f => f.id === festivalId);
    return festival ? festival.rewards : [];
  }
  
  public getOwnedSkins(): string[] {
    return [...this.ownedSkins];
  }
  
  public hasSkin(skinId: string): boolean {
    return this.ownedSkins.includes(skinId);
  }
  
  public getAllThemes(): FestivalTheme[] {
    const themes: FestivalTheme[] = [];
    this.currentFestivals.forEach(festival => {
      themes.push(festival.theme);
    });
    return themes;
  }
}

export const festivalSystem = FestivalSystem.getInstance();