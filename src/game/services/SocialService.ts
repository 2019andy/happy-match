import { UserData } from '../types';

export interface Friend {
  id: string;
  nickname: string;
  avatar: string;
  totalScore: number;
  highestScore: number;
  currentLevel: number;
  totalStars: number;
  isOnline: boolean;
  lastActiveTime: number;
}

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  nickname: string;
  avatar: string;
  totalScore: number;
  highestScore: number;
  currentLevel: number;
}

export interface GiftRecord {
  id: string;
  fromUserId: string;
  fromNickname: string;
  fromAvatar: string;
  giftType: 'energy' | 'coin' | 'hint';
  amount: number;
  timestamp: number;
  claimed: boolean;
}

export interface HelpRequest {
  id: string;
  userId: string;
  nickname: string;
  avatar: string;
  levelId: number;
  timestamp: number;
  status: 'pending' | 'resolved';
}

export class SocialService {
  private static instance: SocialService;
  private friends: Friend[] = [];
  private leaderboard: LeaderboardEntry[] = [];
  private giftRecords: GiftRecord[] = [];
  private helpRequests: HelpRequest[] = [];
  private lastSyncTime: number = 0;
  
  private constructor() {
    this.loadMockData();
  }
  
  public static getInstance(): SocialService {
    if (!SocialService.instance) {
      SocialService.instance = new SocialService();
    }
    return SocialService.instance;
  }
  
  private loadMockData(): void {
    // 模拟好友数据
    this.friends = [
      { id: '1', nickname: '草莓甜心', avatar: '🍓', totalScore: 25800, highestScore: 3500, currentLevel: 28, totalStars: 56, isOnline: true, lastActiveTime: Date.now() },
      { id: '2', nickname: '奶油蛋糕', avatar: '🍰', totalScore: 18600, highestScore: 2800, currentLevel: 22, totalStars: 44, isOnline: false, lastActiveTime: Date.now() - 3600000 },
      { id: '3', nickname: '糖果公主', avatar: '🍬', totalScore: 32400, highestScore: 4200, currentLevel: 35, totalStars: 70, isOnline: true, lastActiveTime: Date.now() },
      { id: '4', nickname: '雏菊朵朵', avatar: '🌼', totalScore: 15200, highestScore: 2200, currentLevel: 18, totalStars: 36, isOnline: false, lastActiveTime: Date.now() - 7200000 },
      { id: '5', nickname: '珍珠宝贝', avatar: '💎', totalScore: 45600, highestScore: 5800, currentLevel: 42, totalStars: 84, isOnline: true, lastActiveTime: Date.now() },
    ];
    
    // 模拟排行榜数据
    this.leaderboard = [
      { rank: 1, userId: '5', nickname: '珍珠宝贝', avatar: '💎', totalScore: 45600, highestScore: 5800, currentLevel: 42 },
      { rank: 2, userId: '3', nickname: '糖果公主', avatar: '🍬', totalScore: 32400, highestScore: 4200, currentLevel: 35 },
      { rank: 3, userId: '1', nickname: '草莓甜心', avatar: '🍓', totalScore: 25800, highestScore: 3500, currentLevel: 28 },
      { rank: 4, userId: '2', nickname: '奶油蛋糕', avatar: '🍰', totalScore: 18600, highestScore: 2800, currentLevel: 22 },
      { rank: 5, userId: '4', nickname: '雏菊朵朵', avatar: '🌼', totalScore: 15200, highestScore: 2200, currentLevel: 18 },
      { rank: 6, userId: '6', nickname: '彩虹甜心', avatar: '🌈', totalScore: 12800, highestScore: 1800, currentLevel: 15 },
      { rank: 7, userId: '7', nickname: '巧克力酱', avatar: '🍫', totalScore: 10500, highestScore: 1500, currentLevel: 12 },
      { rank: 8, userId: '8', nickname: '蓝莓派', avatar: '🫐', totalScore: 8200, highestScore: 1200, currentLevel: 10 },
      { rank: 9, userId: '9', nickname: '芒果冰沙', avatar: '🥭', totalScore: 6500, highestScore: 950, currentLevel: 8 },
      { rank: 10, userId: '10', nickname: '西瓜太郎', avatar: '🍉', totalScore: 4800, highestScore: 700, currentLevel: 6 },
    ];
    
    // 模拟礼物记录
    this.giftRecords = [
      { id: 'g1', fromUserId: '1', fromNickname: '草莓甜心', fromAvatar: '🍓', giftType: 'energy', amount: 5, timestamp: Date.now() - 300000, claimed: false },
      { id: 'g2', fromUserId: '3', fromNickname: '糖果公主', fromAvatar: '🍬', giftType: 'coin', amount: 100, timestamp: Date.now() - 600000, claimed: false },
      { id: 'g3', fromUserId: '2', fromNickname: '奶油蛋糕', fromAvatar: '🍰', giftType: 'energy', amount: 5, timestamp: Date.now() - 900000, claimed: true },
    ];
    
    // 模拟求助请求
    this.helpRequests = [
      { id: 'h1', userId: '2', nickname: '奶油蛋糕', avatar: '🍰', levelId: 22, timestamp: Date.now() - 1800000, status: 'pending' },
      { id: 'h2', userId: '4', nickname: '雏菊朵朵', avatar: '🌼', levelId: 18, timestamp: Date.now() - 3600000, status: 'resolved' },
    ];
  }
  
  // 获取好友列表
  public getFriends(): Friend[] {
    return [...this.friends];
  }
  
  // 获取在线好友
  public getOnlineFriends(): Friend[] {
    return this.friends.filter(f => f.isOnline);
  }
  
  // 获取排行榜
  public getLeaderboard(): LeaderboardEntry[] {
    return [...this.leaderboard];
  }
  
  // 获取我的排名
  public getMyRank(): number {
    // 模拟当前用户排名
    return 3;
  }
  
  // 获取我的数据
  public getMyStats(): LeaderboardEntry {
    return {
      rank: 3,
      userId: 'current_user',
      nickname: '我',
      avatar: '👑',
      totalScore: 25800,
      highestScore: 3500,
      currentLevel: 28
    };
  }
  
  // 赠送体力给好友
  public async sendEnergy(toUserId: string, amount: number = 5): Promise<boolean> {
    try {
      // 实际项目中：调用API赠送体力
      console.log(`向好友 ${toUserId} 赠送 ${amount} 体力`);
      
      // 模拟成功
      await this.simulateDelay(500);
      return true;
    } catch {
      return false;
    }
  }
  
  // 获取礼物记录
  public getGiftRecords(): GiftRecord[] {
    return [...this.giftRecords];
  }
  
  // 领取礼物
  public claimGift(giftId: string): boolean {
    const gift = this.giftRecords.find(g => g.id === giftId);
    if (gift && !gift.claimed) {
      gift.claimed = true;
      return true;
    }
    return false;
  }
  
  // 领取所有礼物
  public claimAllGifts(): number {
    let totalEnergy = 0;
    let totalCoins = 0;
    
    this.giftRecords.forEach(gift => {
      if (!gift.claimed) {
        gift.claimed = true;
        if (gift.giftType === 'energy') {
          totalEnergy += gift.amount;
        } else if (gift.giftType === 'coin') {
          totalCoins += gift.amount;
        }
      }
    });
    
    return totalEnergy;
  }
  
  // 发起求助
  public async requestHelp(levelId: number): Promise<boolean> {
    try {
      // 实际项目中：调用API发起求助
      console.log(`发起关卡 ${levelId} 的求助`);
      
      const request: HelpRequest = {
        id: `h${Date.now()}`,
        userId: 'current_user',
        nickname: '我',
        avatar: '👑',
        levelId,
        timestamp: Date.now(),
        status: 'pending'
      };
      
      this.helpRequests.unshift(request);
      await this.simulateDelay(500);
      return true;
    } catch {
      return false;
    }
  }
  
  // 获取求助列表
  public getHelpRequests(): HelpRequest[] {
    return [...this.helpRequests];
  }
  
  // 帮助好友
  public async helpFriend(requestId: string): Promise<boolean> {
    try {
      const request = this.helpRequests.find(h => h.id === requestId);
      if (request && request.status === 'pending') {
        request.status = 'resolved';
        console.log(`帮助好友通过关卡 ${request.levelId}`);
        await this.simulateDelay(500);
        return true;
      }
      return false;
    } catch {
      return false;
    }
  }
  
  // 同步数据
  public async syncSocialData(): Promise<void> {
    // 实际项目中：调用API同步好友、排行榜、礼物等数据
    console.log('同步社交数据...');
    await this.simulateDelay(1000);
    this.lastSyncTime = Date.now();
  }
  
  // 获取最后同步时间
  public getLastSyncTime(): number {
    return this.lastSyncTime;
  }
  
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const socialService = SocialService.getInstance();