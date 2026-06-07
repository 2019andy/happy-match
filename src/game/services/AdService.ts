import { adsManager, RewardedVideoCallbacks } from '../utils/AdsManager';

export enum RewardType {
  REVIVE = 'revive',
  FULL_ENERGY = 'full_energy',
  DOUBLE_REWARD = 'double_reward',
  EXTRA_LOTTERY = 'extra_lottery'
}

export interface AdRewardConfig {
  type: RewardType;
  title: string;
  description: string;
  buttonText: string;
  icon: string;
}

export const AD_REWARD_CONFIGS: Record<RewardType, AdRewardConfig> = {
  [RewardType.REVIVE]: {
    type: RewardType.REVIVE,
    title: '继续闯关',
    description: '观看广告即可继续本局游戏',
    buttonText: '看广告复活',
    icon: '🎬'
  },
  [RewardType.FULL_ENERGY]: {
    type: RewardType.FULL_ENERGY,
    title: '恢复体力',
    description: '观看广告即可恢复满体力',
    buttonText: '看广告回满体力',
    icon: '💖'
  },
  [RewardType.DOUBLE_REWARD]: {
    type: RewardType.DOUBLE_REWARD,
    title: '奖励翻倍',
    description: '观看广告可将本局奖励翻倍',
    buttonText: '看广告翻倍',
    icon: '✨'
  },
  [RewardType.EXTRA_LOTTERY]: {
    type: RewardType.EXTRA_LOTTERY,
    title: '额外抽奖',
    description: '观看广告可获得一次额外抽奖机会',
    buttonText: '看广告抽奖',
    icon: '🎰'
  }
};

export class AdService {
  private static instance: AdService;
  private rewardCallback: (() => void) | null = null;
  
  private constructor() {}
  
  public static getInstance(): AdService {
    if (!AdService.instance) {
      AdService.instance = new AdService();
    }
    return AdService.instance;
  }
  
  public async showRewardedAd(
    rewardType: RewardType,
    onRewardEarned: () => void
  ): Promise<boolean> {
    const config = AD_REWARD_CONFIGS[rewardType];
    
    return new Promise((resolve) => {
      const callbacks: RewardedVideoCallbacks = {
        onAdLoaded: () => {
          console.log(`${config.title} 广告加载成功`);
        },
        onAdFailed: (error: string) => {
          console.error(`${config.title} 广告加载失败:`, error);
          // 广告加载失败时显示提示
          this.showFallbackMessage(config, onRewardEarned);
          resolve(false);
        },
        onAdShown: () => {
          console.log(`${config.title} 广告已展示`);
        },
        onAdClicked: () => {
          console.log(`${config.title} 广告被点击`);
        },
        onAdClosed: () => {
          console.log(`${config.title} 广告已关闭`);
          resolve(false);
        },
        onRewardEarned: () => {
          console.log(`${config.title} 奖励已发放`);
          onRewardEarned();
          resolve(true);
        }
      };
      
      adsManager.showRewardedVideo(callbacks);
    });
  }
  
  private showFallbackMessage(config: AdRewardConfig, callback: () => void): void {
    // 在没有广告SDK的环境中，直接提供功能作为测试
    console.log('广告SDK未集成，使用模拟奖励');
    alert(`${config.title}功能 - SDK未集成，直接发放奖励`);
    callback();
  }
  
  // 闯关失败复活
  public async reviveGame(onRevive: () => void): Promise<boolean> {
    return this.showRewardedAd(RewardType.REVIVE, onRevive);
  }
  
  // 恢复满体力
  public async restoreFullEnergy(onRestored: () => void): Promise<boolean> {
    return this.showRewardedAd(RewardType.FULL_ENERGY, onRestored);
  }
  
  // 奖励翻倍
  public async doubleReward(onDoubled: () => void): Promise<boolean> {
    return this.showRewardedAd(RewardType.DOUBLE_REWARD, onDoubled);
  }
  
  // 额外抽奖
  public async extraLottery(onRewarded: () => void): Promise<boolean> {
    return this.showRewardedAd(RewardType.EXTRA_LOTTERY, onRewarded);
  }
}

export const adService = AdService.getInstance();