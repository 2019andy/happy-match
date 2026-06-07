import { UserData } from '../types';
import { StorageSystem } from './StorageSystem';

// 微信小程序的全局对象类型定义
declare global {
  interface Window {
    wx?: {
      login: (options: {
        success?: (res: { code: string }) => void;
        fail?: (error: any) => void;
      }) => void;
      initAdService?: (config: any) => void;
      createRewardedVideoAd?: (config: any) => any;
      createBannerAd?: (config: any) => any;
      createInterstitialAd?: (config: any) => any;
    };
  }
}

export interface CloudSyncConfig {
  apiBaseUrl: string;
  timeout: number;
  retryAttempts: number;
}

export interface SyncResult {
  success: boolean;
  data?: any;
  error?: string;
}

export interface WechatLoginResult {
  code: string;
  state: string;
}

export class CloudSyncService {
  private static instance: CloudSyncService;
  private config: CloudSyncConfig = {
    apiBaseUrl: 'https://your-api-domain.com/api',
    timeout: 10000,
    retryAttempts: 3
  };
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private userId: string | null = null;
  private lastSyncTime: number = 0;
  private syncInterval: number = 30000; // 30秒同步一次
  
  private constructor() {
    this.loadTokens();
    this.startAutoSync();
  }
  
  public static getInstance(): CloudSyncService {
    if (!CloudSyncService.instance) {
      CloudSyncService.instance = new CloudSyncService();
    }
    return CloudSyncService.instance;
  }
  
  private loadTokens(): void {
    const savedTokens = localStorage.getItem('cloud_tokens');
    if (savedTokens) {
      try {
        const tokens = JSON.parse(savedTokens);
        this.accessToken = tokens.accessToken;
        this.refreshToken = tokens.refreshToken;
        this.userId = tokens.userId;
      } catch (error) {
        console.error('加载云端令牌失败:', error);
      }
    }
  }
  
  private saveTokens(): void {
    localStorage.setItem('cloud_tokens', JSON.stringify({
      accessToken: this.accessToken,
      refreshToken: this.refreshToken,
      userId: this.userId
    }));
  }
  
  public isLoggedIn(): boolean {
    return !!this.accessToken && !!this.userId;
  }
  
  public getUserId(): string | null {
    return this.userId;
  }
  
  // 微信登录
  public async wechatLogin(): Promise<WechatLoginResult | null> {
    // 在微信环境中使用 wx.login()
    const wx = (window as any).wx;
    if (wx && wx.login) {
      return new Promise((resolve) => {
        wx.login({
          success: (res: { code: string }) => {
            if (res.code) {
              resolve({
                code: res.code,
                state: 'wechat'
              });
            } else {
              console.error('微信登录失败: 未获取到code');
              resolve(null);
            }
          },
          fail: (error: any) => {
            console.error('微信登录调用失败:', error);
            resolve(null);
          }
        });
      });
    }
    
    // 在H5环境中模拟扫码登录
    console.log('H5环境：模拟微信扫码登录');
    return {
      code: 'mock_code_' + Date.now(),
      state: 'h5_mock'
    };
  }
  
  // 使用code换取access_token
  public async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      console.log('交换授权码:', code);
      
      // 模拟API调用
      // 实际项目中：
      // const response = await fetch(`${this.config.apiBaseUrl}/auth/wechat`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ code })
      // });
      // 
      // if (!response.ok) throw new Error('Token exchange failed');
      // 
      // const data = await response.json();
      // this.accessToken = data.access_token;
      // this.refreshToken = data.refresh_token;
      // this.userId = data.user_id;
      
      // 模拟成功
      this.accessToken = 'mock_access_token_' + Date.now();
      this.refreshToken = 'mock_refresh_token_' + Date.now();
      this.userId = 'user_' + Date.now();
      
      this.saveTokens();
      console.log('登录成功，用户ID:', this.userId);
      
      return true;
    } catch (error) {
      console.error('交换令牌失败:', error);
      return false;
    }
  }
  
  // 刷新access_token
  public async refreshAccessToken(): Promise<boolean> {
    if (!this.refreshToken) return false;
    
    try {
      console.log('刷新access_token...');
      
      // 模拟API调用
      // 实际项目中：
      // const response = await fetch(`${this.config.apiBaseUrl}/auth/refresh`, {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify({ refresh_token: this.refreshToken })
      // });
      // 
      // if (!response.ok) throw new Error('Token refresh failed');
      // 
      // const data = await response.json();
      // this.accessToken = data.access_token;
      
      // 模拟成功
      this.accessToken = 'new_access_token_' + Date.now();
      this.saveTokens();
      
      return true;
    } catch (error) {
      console.error('刷新令牌失败:', error);
      this.logout();
      return false;
    }
  }
  
  // 登出
  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.userId = null;
    localStorage.removeItem('cloud_tokens');
    console.log('已退出登录');
  }
  
  // 上传用户数据到云端
  public async uploadUserData(userData: UserData): Promise<SyncResult> {
    if (!this.isLoggedIn()) {
      return { success: false, error: '未登录' };
    }
    
    try {
      console.log('上传用户数据到云端...');
      
      // 实际项目中：
      // const response = await fetch(`${this.config.apiBaseUrl}/user/sync`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.accessToken}`
      //   },
      //   body: JSON.stringify({
      //     userId: this.userId,
      //     userData
      //   })
      // });
      // 
      // if (!response.ok) throw new Error('Upload failed');
      // 
      // return { success: true, data: await response.json() };
      
      // 模拟成功
      await this.simulateDelay(500);
      this.lastSyncTime = Date.now();
      
      console.log('用户数据上传成功');
      return { success: true };
    } catch (error: any) {
      console.error('上传用户数据失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 从云端下载用户数据
  public async downloadUserData(): Promise<SyncResult> {
    if (!this.isLoggedIn()) {
      return { success: false, error: '未登录' };
    }
    
    try {
      console.log('从云端下载用户数据...');
      
      // 实际项目中：
      // const response = await fetch(`${this.config.apiBaseUrl}/user/sync/${this.userId}`, {
      //   method: 'GET',
      //   headers: {
      //     'Authorization': `Bearer ${this.accessToken}`
      //   }
      // });
      // 
      // if (!response.ok) throw new Error('Download failed');
      // 
      // const data = await response.json();
      // return { success: true, data: data.userData };
      
      // 模拟成功
      await this.simulateDelay(500);
      const localData = StorageSystem.getUserData();
      
      console.log('用户数据下载成功');
      return { success: true, data: localData };
    } catch (error: any) {
      console.error('下载用户数据失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 同步数据（上传本地最新数据，下载云端数据并合并）
  public async syncData(): Promise<SyncResult> {
    if (!this.isLoggedIn()) {
      return { success: false, error: '未登录' };
    }
    
    try {
      console.log('开始数据同步...');
      
      // 1. 上传本地数据
      const localData = StorageSystem.getUserData();
      const uploadResult = await this.uploadUserData(localData);
      
      if (!uploadResult.success) {
        return uploadResult;
      }
      
      // 2. 下载云端数据
      const downloadResult = await this.downloadUserData();
      
      if (downloadResult.success && downloadResult.data) {
        // 3. 合并数据（云端数据优先，或使用最新的）
        const cloudData = downloadResult.data as UserData;
        const mergedData = this.mergeUserData(localData, cloudData);
        
        // 4. 保存合并后的数据
        StorageSystem.saveUserData(mergedData);
        
        console.log('数据同步完成');
        return { success: true, data: mergedData };
      }
      
      return downloadResult;
    } catch (error: any) {
      console.error('数据同步失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  // 合并用户数据
  private mergeUserData(local: UserData, cloud: UserData): UserData {
    // 策略：使用时间戳最新的数据
    const merged: UserData = { ...cloud };
    
    // 如果本地数据更新，则使用本地数据
    if (local.totalScore > cloud.totalScore) {
      merged.totalScore = local.totalScore;
    }
    
    if (local.highestScore > cloud.highestScore) {
      merged.highestScore = local.highestScore;
    }
    
    if (local.currentLevel > cloud.currentLevel) {
      merged.currentLevel = local.currentLevel;
    }
    
    if (local.totalStars > cloud.totalStars) {
      merged.totalStars = local.totalStars;
    }
    
    // 合并通关记录
    const completedLevels = new Set([...cloud.completedLevels, ...local.completedLevels]);
    merged.completedLevels = Array.from(completedLevels).sort((a, b) => a - b);
    
    // 合并成就
    local.achievements.forEach((localAch) => {
      const cloudAch = merged.achievements.find(a => a.id === localAch.id);
      if (cloudAch && localAch.unlocked && !cloudAch.unlocked) {
        cloudAch.unlocked = true;
        cloudAch.unlockDate = localAch.unlockDate;
      }
    });
    
    // 其他字段取较大值
    merged.coins = Math.max(local.coins, cloud.coins);
    merged.diamonds = Math.max(local.diamonds, cloud.diamonds);
    merged.energy = Math.max(local.energy, cloud.energy);
    merged.totalPlays = Math.max(local.totalPlays, cloud.totalPlays);
    
    return merged;
  }
  
  // 自动同步
  private startAutoSync(): void {
    setInterval(() => {
      if (this.isLoggedIn()) {
        this.syncData().catch(error => {
          console.error('自动同步失败:', error);
        });
      }
    }, this.syncInterval);
  }
  
  // 主动同步
  public async forceSync(): Promise<SyncResult> {
    return this.syncData();
  }
  
  // 获取最后同步时间
  public getLastSyncTime(): number {
    return this.lastSyncTime;
  }
  
  // 模拟延迟
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const cloudSyncService = CloudSyncService.getInstance();