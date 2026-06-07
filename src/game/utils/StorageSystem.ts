import { UserData, ThemeConfig, Achievement, ShopItem, Skin, DailyChallenge, LeaderboardEntry } from '../types';

const STORAGE_KEYS = {
  USER_DATA: 'sweetMatch_userData',
  THEME_CONFIG: 'sweetMatch_themeConfig',
  LAST_PLAY_DATE: 'sweetMatch_lastPlayDate',
  SIGN_IN_DAYS: 'sweetMatch_signInDays',
  LEADERBOARD: 'sweetMatch_leaderboard'
};

export class StorageSystem {
  public static getUserData(): UserData {
    const saved = localStorage.getItem(STORAGE_KEYS.USER_DATA);
    if (saved) {
      try {
        const data = JSON.parse(saved);
        return this.migrateUserData(data);
      } catch {
        return this.getDefaultUserData();
      }
    }
    return this.getDefaultUserData();
  }
  
  private static migrateUserData(data: any): UserData {
    const defaultData = this.getDefaultUserData();
    return {
      ...defaultData,
      ...data,
      totalScore: data.totalScore || 0,
      highestScore: data.highestScore || 0,
      achievements: data.achievements || defaultData.achievements,
      skins: data.skins || defaultData.skins,
      dailyChallenge: data.dailyChallenge || undefined,
      lastLoginDate: data.lastLoginDate || new Date().toDateString(),
      totalPlays: data.totalPlays || 0,
      totalEliminations: data.totalEliminations || 0
    };
  }
  
  public static saveUserData(userData: UserData): void {
    localStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
  }
  
  public static getThemeConfig(): ThemeConfig {
    const saved = localStorage.getItem(STORAGE_KEYS.THEME_CONFIG);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return this.getDefaultThemeConfig();
      }
    }
    return this.getDefaultThemeConfig();
  }
  
  public static saveThemeConfig(themeConfig: ThemeConfig): void {
    localStorage.setItem(STORAGE_KEYS.THEME_CONFIG, JSON.stringify(themeConfig));
  }
  
  public static getLastPlayDate(): string | null {
    return localStorage.getItem(STORAGE_KEYS.LAST_PLAY_DATE);
  }
  
  public static saveLastPlayDate(date: string): void {
    localStorage.setItem(STORAGE_KEYS.LAST_PLAY_DATE, date);
  }
  
  public static getSignInDays(): number {
    const saved = localStorage.getItem(STORAGE_KEYS.SIGN_IN_DAYS);
    return saved ? parseInt(saved, 10) : 0;
  }
  
  public static saveSignInDays(days: number): void {
    localStorage.setItem(STORAGE_KEYS.SIGN_IN_DAYS, days.toString());
  }
  
  public static checkDailySignIn(): { signedIn: boolean; consecutiveDays: number } {
    const today = new Date().toDateString();
    const lastDate = this.getLastPlayDate();
    let consecutiveDays = this.getSignInDays();
    
    if (lastDate !== today) {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      
      if (lastDate === yesterday.toDateString()) {
        consecutiveDays++;
      } else {
        consecutiveDays = 1;
      }
      
      this.saveLastPlayDate(today);
      this.saveSignInDays(consecutiveDays);
      return { signedIn: true, consecutiveDays };
    }
    
    return { signedIn: false, consecutiveDays };
  }
  
  public static getAchievements(): Achievement[] {
    return [
      { id: 'first_win', name: '初次胜利', description: '完成第一关', icon: '🎉', unlocked: false },
      { id: '10_levels', name: '初级玩家', description: '完成10关', icon: '🎯', unlocked: false },
      { id: '50_levels', name: '资深玩家', description: '完成50关', icon: '🏆', unlocked: false },
      { id: '10_stars', name: '收集达人', description: '获得10颗星星', icon: '⭐', unlocked: false },
      { id: '1000_score', name: '千分王者', description: '单局得分超过1000分', icon: '👑', unlocked: false },
      { id: '10000_score', name: '万分大师', description: '累计得分超过10000分', icon: '💎', unlocked: false },
      { id: '7_day_login', name: '坚持达人', description: '连续登录7天', icon: '📅', unlocked: false },
      { id: 'powerup_master', name: '道具大师', description: '合成50个道具', icon: '✨', unlocked: false }
    ];
  }
  
  public static getShopItems(): ShopItem[] {
    return [
      { id: 'extra_moves', name: '额外步数', description: '游戏中+5步', icon: '👣', price: 100, currency: 'coins', type: 'powerup', amount: 5 },
      { id: 'refresh', name: '刷新棋盘', description: '重新生成棋盘', icon: '🔄', price: 150, currency: 'coins', type: 'powerup', amount: 3 },
      { id: 'hammer', name: '小锤子', description: '消除任意方块', icon: '🔨', price: 200, currency: 'coins', type: 'powerup', amount: 3 },
      { id: 'energy_pack', name: '体力礼包', description: '恢复20点体力', icon: '💖', price: 100, currency: 'coins', type: 'energy', amount: 20 },
      { id: 'full_energy', name: '满体力', description: '体力恢复至满', icon: '💗', price: 50, currency: 'diamonds', type: 'energy', amount: 30 }
    ];
  }
  
  public static getSkins(): Skin[] {
    return [
      { id: 'default', name: '默认主题', icon: '🎨', color: '#FFB6C1', owned: true, active: true },
      { id: 'blue', name: '清新蓝', icon: '💙', color: '#87CEEB', owned: false, active: false },
      { id: 'green', name: '自然绿', icon: '💚', color: '#98FB98', owned: false, active: false },
      { id: 'purple', name: '优雅紫', icon: '💜', color: '#DDA0DD', owned: false, active: false }
    ];
  }
  
  public static generateDailyChallenge(): DailyChallenge {
    const today = new Date().toDateString();
    const types: ('score' | 'stars' | 'levels')[] = ['score', 'stars', 'levels'];
    const type = types[Math.floor(Math.random() * types.length)];
    
    let target = 0;
    let coins = 0;
    let diamonds = 0;
    
    switch (type) {
      case 'score':
        target = 500 + Math.floor(Math.random() * 500);
        coins = 100;
        diamonds = 5;
        break;
      case 'stars':
        target = 3 + Math.floor(Math.random() * 3);
        coins = 150;
        diamonds = 10;
        break;
      case 'levels':
        target = 2 + Math.floor(Math.random() * 2);
        coins = 200;
        diamonds = 15;
        break;
    }
    
    return {
      date: today,
      type,
      target,
      progress: 0,
      completed: false,
      reward: { coins, diamonds }
    };
  }
  
  public static getLeaderboard(): LeaderboardEntry[] {
    const saved = localStorage.getItem(STORAGE_KEYS.LEADERBOARD);
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return this.getDefaultLeaderboard();
      }
    }
    return this.getDefaultLeaderboard();
  }
  
  public static saveLeaderboard(leaderboard: LeaderboardEntry[]): void {
    localStorage.setItem(STORAGE_KEYS.LEADERBOARD, JSON.stringify(leaderboard));
  }
  
  public static updateLeaderboard(entry: LeaderboardEntry): void {
    const leaderboard = this.getLeaderboard();
    const existingIndex = leaderboard.findIndex(e => e.id === entry.id);
    
    if (existingIndex >= 0) {
      if (entry.score > leaderboard[existingIndex].score) {
        leaderboard[existingIndex] = entry;
      }
    } else {
      leaderboard.push(entry);
    }
    
    leaderboard.sort((a, b) => b.score - a.score);
    leaderboard.slice(0, 100).forEach((e, i) => e.rank = i + 1);
    
    this.saveLeaderboard(leaderboard.slice(0, 100));
  }
  
  private static getDefaultUserData(): UserData {
    return {
      id: 'guest_' + Date.now(),
      nickname: '小可爱',
      avatar: '',
      level: 1,
      currentLevel: 1,
      totalStars: 0,
      totalScore: 0,
      highestScore: 0,
      energy: 30,
      maxEnergy: 30,
      coins: 100,
      diamonds: 10,
      powerups: {
        refresh: 0,
        hammer: 0,
        moves: 0
      },
      completedLevels: [],
      failedAttempts: {},
      achievements: this.getAchievements(),
      skins: this.getSkins(),
      dailyChallenge: this.generateDailyChallenge(),
      lastLoginDate: new Date().toDateString(),
      totalPlays: 0,
      totalEliminations: 0
    };
  }
  
  private static getDefaultLeaderboard(): LeaderboardEntry[] {
    return [
      { id: 'ai_1', nickname: '甜蜜糖果', avatar: '', score: 50000, rank: 1 },
      { id: 'ai_2', nickname: '草莓公主', avatar: '', score: 45000, rank: 2 },
      { id: 'ai_3', nickname: '奶油小生', avatar: '', score: 40000, rank: 3 },
      { id: 'ai_4', nickname: '雏菊少女', avatar: '', score: 35000, rank: 4 },
      { id: 'ai_5', nickname: '珍珠达人', avatar: '', score: 30000, rank: 5 }
    ];
  }
  
  private static getDefaultThemeConfig(): ThemeConfig {
    return {
      isEyeCareMode: false,
      saturation: 1,
      animationSpeed: 1
    };
  }
  
  public static clearAll(): void {
    localStorage.removeItem(STORAGE_KEYS.USER_DATA);
    localStorage.removeItem(STORAGE_KEYS.THEME_CONFIG);
    localStorage.removeItem(STORAGE_KEYS.LAST_PLAY_DATE);
    localStorage.removeItem(STORAGE_KEYS.SIGN_IN_DAYS);
    localStorage.removeItem('energyData');
  }
}
