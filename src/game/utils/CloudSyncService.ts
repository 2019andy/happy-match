import { UserData } from '../types';
import { StorageSystem } from './StorageSystem';
import { authApi, userApi, gameApi } from '../../lib/api';

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
    apiBaseUrl: '/api/v1',
    timeout: 10000,
    retryAttempts: 3
  };
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private userId: string | null = null;
  private lastSyncTime: number = 0;
  private syncInterval: number = 30000;
  
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
    const token = localStorage.getItem('access_token');
    const userData = localStorage.getItem('user_data');
    
    if (token) {
      this.accessToken = token;
    }
    
    if (userData) {
      try {
        const data = JSON.parse(userData);
        this.userId = data.id || null;
      } catch (error) {
        console.error('加载用户数据失败:', error);
      }
    }
  }
  
  public isLoggedIn(): boolean {
    return !!this.accessToken && !!this.userId;
  }
  
  public getUserId(): string | null {
    return this.userId;
  }
  
  public getAccessToken(): string | null {
    return this.accessToken;
  }
  
  public async wechatLogin(): Promise<WechatLoginResult | null> {
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
    
    console.log('H5环境：模拟微信扫码登录');
    return {
      code: 'mock_code_' + Date.now(),
      state: 'h5_mock'
    };
  }
  
  public async exchangeCodeForToken(code: string): Promise<boolean> {
    try {
      console.log('交换授权码:', code);
      
      const result = await authApi.wechatLogin(code);
      
      if (result.success && result.data) {
        this.accessToken = result.data.accessToken;
        this.userId = result.data.user.id;
        
        localStorage.setItem('access_token', this.accessToken);
        localStorage.setItem('user_data', JSON.stringify(result.data.user));
        
        StorageSystem.saveUserData(result.data.user);
        console.log('登录成功，用户ID:', this.userId);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('交换令牌失败:', error);
      return false;
    }
  }
  
  public async guestLogin(deviceId: string): Promise<boolean> {
    try {
      const result = await authApi.guestLogin(deviceId);
      
      if (result.success && result.data) {
        this.accessToken = result.data.accessToken;
        this.userId = result.data.user.id;
        
        localStorage.setItem('access_token', this.accessToken);
        localStorage.setItem('user_data', JSON.stringify(result.data.user));
        
        StorageSystem.saveUserData(result.data.user);
        console.log('游客登录成功，用户ID:', this.userId);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('游客登录失败:', error);
      return false;
    }
  }
  
  public logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    this.userId = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
    console.log('已退出登录');
  }
  
  public async uploadUserData(userData: UserData): Promise<SyncResult> {
    if (!this.isLoggedIn()) {
      return { success: false, error: '未登录' };
    }
    
    try {
      console.log('上传用户数据到云端...');
      
      for (const levelId of userData.completedLevels) {
        await gameApi.updateProgress(levelId, userData.totalScore, 3, 0, 0);
      }
      
      this.lastSyncTime = Date.now();
      console.log('用户数据上传成功');
      return { success: true };
    } catch (error: any) {
      console.error('上传用户数据失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  public async downloadUserData(): Promise<SyncResult> {
    if (!this.isLoggedIn()) {
      return { success: false, error: '未登录' };
    }
    
    try {
      console.log('从云端下载用户数据...');
      
      const result = await userApi.getProfile();
      
      if (result.success && result.data) {
        const cloudData = result.data as UserData;
        StorageSystem.saveUserData(cloudData);
        console.log('用户数据下载成功');
        return { success: true, data: cloudData };
      }
      
      return { success: false, error: '获取用户信息失败' };
    } catch (error: any) {
      console.error('下载用户数据失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  public async syncData(): Promise<SyncResult> {
    if (!this.isLoggedIn()) {
      return { success: false, error: '未登录' };
    }
    
    try {
      console.log('开始数据同步...');
      
      const localData = StorageSystem.getUserData();
      const uploadResult = await this.uploadUserData(localData);
      
      if (!uploadResult.success) {
        return uploadResult;
      }
      
      const downloadResult = await this.downloadUserData();
      
      if (downloadResult.success && downloadResult.data) {
        const cloudData = downloadResult.data as UserData;
        const mergedData = this.mergeUserData(localData, cloudData);
        
        StorageSystem.saveUserData(mergedData);
        localStorage.setItem('user_data', JSON.stringify(mergedData));
        
        console.log('数据同步完成');
        return { success: true, data: mergedData };
      }
      
      return downloadResult;
    } catch (error: any) {
      console.error('数据同步失败:', error);
      return { success: false, error: error.message };
    }
  }
  
  private mergeUserData(local: UserData, cloud: UserData): UserData {
    const merged: UserData = { ...cloud };
    
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
    
    const completedLevels = new Set([...cloud.completedLevels, ...local.completedLevels]);
    merged.completedLevels = Array.from(completedLevels).sort((a, b) => a - b);
    
    local.achievements.forEach((localAch) => {
      const cloudAch = merged.achievements.find(a => a.id === localAch.id);
      if (cloudAch && localAch.unlocked && !cloudAch.unlocked) {
        cloudAch.unlocked = true;
        cloudAch.unlockDate = localAch.unlockDate;
      }
    });
    
    merged.coins = Math.max(local.coins, cloud.coins);
    merged.diamonds = Math.max(local.diamonds, cloud.diamonds);
    merged.energy = Math.max(local.energy, cloud.energy);
    merged.totalPlays = Math.max(local.totalPlays, cloud.totalPlays);
    
    return merged;
  }
  
  private startAutoSync(): void {
    setInterval(() => {
      if (this.isLoggedIn()) {
        this.syncData().catch(error => {
          console.error('自动同步失败:', error);
        });
      }
    }, this.syncInterval);
  }
  
  public async forceSync(): Promise<SyncResult> {
    return this.syncData();
  }
  
  public getLastSyncTime(): number {
    return this.lastSyncTime;
  }
  
  private simulateDelay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

export const cloudSyncService = CloudSyncService.getInstance();