import { FestivalTheme } from './FestivalSystem';

export interface Skin {
  id: string;
  name: string;
  description: string;
  icon: string;
  price: {
    type: 'coins' | 'diamonds' | 'free' | 'event';
    value: number;
  };
  isDefault: boolean;
  isUnlocked: boolean;
  theme: FestivalTheme | null;
}

export interface SkinConfig {
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
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    background: string;
    board: string;
    tile: string;
    selectedTile: string;
    text: string;
  };
}

export class SkinSystem {
  private static instance: SkinSystem;
  private skins: Skin[] = [];
  private currentSkinId: string = 'default';
  private storageKey = 'game_skin';
  
  private constructor() {
    this.loadSkins();
    this.loadCurrentSkin();
  }
  
  public static getInstance(): SkinSystem {
    if (!SkinSystem.instance) {
      SkinSystem.instance = new SkinSystem();
    }
    return SkinSystem.instance;
  }
  
  private loadSkins(): void {
    this.skins = [
      {
        id: 'default',
        name: '马卡龙',
        description: '温馨治愈的马卡龙配色',
        icon: '🍬',
        price: { type: 'free', value: 0 },
        isDefault: true,
        isUnlocked: true,
        theme: null
      },
      {
        id: 'candy',
        name: '糖果乐园',
        description: '甜蜜糖果主题',
        icon: '🍭',
        price: { type: 'coins', value: 1000 },
        isDefault: false,
        isUnlocked: false,
        theme: null
      },
      {
        id: 'forest',
        name: '绿野仙踪',
        description: '清新森林主题',
        icon: '🌿',
        price: { type: 'coins', value: 1500 },
        isDefault: false,
        isUnlocked: false,
        theme: null
      },
      {
        id: 'ocean',
        name: '海洋之心',
        description: '清凉海洋主题',
        icon: '🌊',
        price: { type: 'diamonds', value: 100 },
        isDefault: false,
        isUnlocked: false,
        theme: null
      },
      {
        id: 'starlight',
        name: '星光璀璨',
        description: '梦幻星空主题',
        icon: '⭐',
        price: { type: 'diamonds', value: 200 },
        isDefault: false,
        isUnlocked: false,
        theme: null
      },
      {
        id: 'valentines',
        name: '爱心满满',
        description: '情人节限定主题',
        icon: '💕',
        price: { type: 'event', value: 0 },
        isDefault: false,
        isUnlocked: false,
        theme: null
      }
    ];
  }
  
  private loadCurrentSkin(): void {
    const saved = localStorage.getItem(this.storageKey);
    if (saved) {
      this.currentSkinId = saved;
    }
  }
  
  private saveCurrentSkin(): void {
    localStorage.setItem(this.storageKey, this.currentSkinId);
  }
  
  // 获取所有皮肤
  public getSkins(): Skin[] {
    return [...this.skins];
  }
  
  // 获取当前皮肤
  public getCurrentSkin(): Skin | null {
    return this.skins.find(s => s.id === this.currentSkinId) || null;
  }
  
  // 获取当前皮肤ID
  public getCurrentSkinId(): string {
    return this.currentSkinId;
  }
  
  // 设置当前皮肤
  public setCurrentSkin(skinId: string): boolean {
    const skin = this.skins.find(s => s.id === skinId);
    if (skin && skin.isUnlocked) {
      this.currentSkinId = skinId;
      this.saveCurrentSkin();
      return true;
    }
    return false;
  }
  
  // 解锁皮肤
  public unlockSkin(skinId: string, coins: number, diamonds: number): boolean {
    const skin = this.skins.find(s => s.id === skinId);
    if (!skin || skin.isUnlocked) return false;
    
    switch (skin.price.type) {
      case 'free':
        skin.isUnlocked = true;
        return true;
      case 'coins':
        if (coins >= skin.price.value) {
          skin.isUnlocked = true;
          return true;
        }
        return false;
      case 'diamonds':
        if (diamonds >= skin.price.value) {
          skin.isUnlocked = true;
          return true;
        }
        return false;
      case 'event':
        // 事件皮肤需要完成特定事件解锁
        return false;
      default:
        return false;
    }
  }
  
  // 获取皮肤配置
  public getSkinConfig(skinId?: string): SkinConfig {
    const id = skinId || this.currentSkinId;
    
    const configs: Record<string, SkinConfig> = {
      default: {
        tiles: {
          strawberry: '🍓',
          cream: '🍦',
          daisy: '🌸',
          bow: '🎀',
          pearl: '💎',
          candy: '🍬'
        },
        obstacles: {
          frosting: '❄️',
          vine: '🌿',
          gift: '🎁',
          bubble: '🫧'
        },
        powerUps: {
          ray: '✨',
          bomb: '💥',
          rainbow: '🌈'
        },
        colors: {
          primary: '#FFB3BA',
          secondary: '#FFDFBA',
          accent: '#FFFFBA',
          background: 'linear-gradient(135deg, #FFF5F5 0%, #FFF0E1 50%, #F0FFF4 100%)',
          board: 'rgba(255, 255, 255, 0.8)',
          tile: 'rgba(255, 255, 255, 0.95)',
          selectedTile: '#FFB3BA',
          text: '#5C4033'
        }
      },
      candy: {
        tiles: {
          strawberry: '🍓',
          cream: '🍰',
          daisy: '🍪',
          bow: '🎀',
          pearl: '🍬',
          candy: '🍭'
        },
        obstacles: {
          frosting: '🍩',
          vine: '🍫',
          gift: '🎁',
          bubble: '🍬'
        },
        powerUps: {
          ray: '✨',
          bomb: '💥',
          rainbow: '🌈'
        },
        colors: {
          primary: '#FF69B4',
          secondary: '#FFB6C1',
          accent: '#FFC0CB',
          background: 'linear-gradient(135deg, #FFF0F5 0%, #FFE4E1 50%, #FAF0E6 100%)',
          board: 'rgba(255, 245, 250, 0.9)',
          tile: 'rgba(255, 255, 255, 0.95)',
          selectedTile: '#FF69B4',
          text: '#8B4513'
        }
      },
      forest: {
        tiles: {
          strawberry: '🍓',
          cream: '🍃',
          daisy: '🌼',
          bow: '🌿',
          pearl: '🍄',
          candy: '🌸'
        },
        obstacles: {
          frosting: '🌨️',
          vine: '🌿',
          gift: '🌰',
          bubble: '💧'
        },
        powerUps: {
          ray: '🌿',
          bomb: '💥',
          rainbow: '🌈'
        },
        colors: {
          primary: '#90EE90',
          secondary: '#98FB98',
          accent: '#ADFF2F',
          background: 'linear-gradient(135deg, #F0FFF0 0%, #E6E6FA 50%, #F0FFF0 100%)',
          board: 'rgba(240, 255, 240, 0.9)',
          tile: 'rgba(255, 255, 255, 0.95)',
          selectedTile: '#90EE90',
          text: '#228B22'
        }
      },
      ocean: {
        tiles: {
          strawberry: '🐚',
          cream: '🌊',
          daisy: '🦋',
          bow: '🐙',
          pearl: '💎',
          candy: '🐟'
        },
        obstacles: {
          frosting: '🧊',
          vine: '🌊',
          gift: '🐠',
          bubble: '🫧'
        },
        powerUps: {
          ray: '🌊',
          bomb: '💥',
          rainbow: '🌈'
        },
        colors: {
          primary: '#87CEEB',
          secondary: '#B0E0E6',
          accent: '#ADD8E6',
          background: 'linear-gradient(135deg, #E0F7FA 0%, #E3F2FD 50%, #E0F7FA 100%)',
          board: 'rgba(224, 247, 250, 0.9)',
          tile: 'rgba(255, 255, 255, 0.95)',
          selectedTile: '#87CEEB',
          text: '#1E90FF'
        }
      },
      starlight: {
        tiles: {
          strawberry: '⭐',
          cream: '🌙',
          daisy: '✨',
          bow: '🌠',
          pearl: '💫',
          candy: '🌌'
        },
        obstacles: {
          frosting: '❄️',
          vine: '✨',
          gift: '🌠',
          bubble: '🌟'
        },
        powerUps: {
          ray: '✨',
          bomb: '💥',
          rainbow: '🌈'
        },
        colors: {
          primary: '#E6E6FA',
          secondary: '#DDA0DD',
          accent: '#EE82EE',
          background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)',
          board: 'rgba(26, 26, 46, 0.9)',
          tile: 'rgba(40, 40, 60, 0.95)',
          selectedTile: '#DDA0DD',
          text: '#E6E6FA'
        }
      },
      valentines: {
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
        },
        colors: {
          primary: '#FF6B6B',
          secondary: '#FFB3BA',
          accent: '#FF69B4',
          background: 'linear-gradient(135deg, #FFF0F3 0%, #FFE4E9 50%, #FFF0F3 100%)',
          board: 'rgba(255, 240, 243, 0.9)',
          tile: 'rgba(255, 255, 255, 0.95)',
          selectedTile: '#FF6B6B',
          text: '#8B0000'
        }
      }
    };
    
    return configs[id] || configs.default;
  }
  
  // 获取皮肤图标
  public getTileIcon(tileType: string, skinId?: string): string {
    const config = this.getSkinConfig(skinId);
    return config.tiles[tileType as keyof typeof config.tiles] || '❓';
  }
  
  // 获取障碍物图标
  public getObstacleIcon(obstacleType: string, skinId?: string): string {
    const config = this.getSkinConfig(skinId);
    return config.obstacles[obstacleType as keyof typeof config.obstacles] || '❓';
  }
  
  // 获取道具图标
  public getPowerUpIcon(powerUpType: string, skinId?: string): string {
    const config = this.getSkinConfig(skinId);
    return config.powerUps[powerUpType as keyof typeof config.powerUps] || '❓';
  }
  
  // 检查皮肤是否解锁
  public isSkinUnlocked(skinId: string): boolean {
    const skin = this.skins.find(s => s.id === skinId);
    return skin ? skin.isUnlocked : false;
  }
}

export const skinSystem = SkinSystem.getInstance();