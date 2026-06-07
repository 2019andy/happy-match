export enum AdType {
  REWARDED_VIDEO = 'rewarded_video',
  BANNER = 'banner',
  INTERSTITIAL = 'interstitial',
  NATIVE = 'native'
}

export enum AdPosition {
  HOME_BOTTOM = 'home_bottom',
  GAME_BOTTOM = 'game_bottom',
  SHOP_PAGE = 'shop_page',
  DAILY_CHALLENGE = 'daily_challenge'
}

export interface AdConfig {
  appId: string;
  adUnitId: string;
  type: AdType;
}

export interface RewardedVideoCallbacks {
  onAdLoaded?: () => void;
  onAdFailed?: (error: string) => void;
  onAdShown?: () => void;
  onAdClicked?: () => void;
  onAdClosed?: () => void;
  onRewardEarned?: () => void;
}

export interface BannerCallbacks {
  onAdLoaded?: () => void;
  onAdFailed?: (error: string) => void;
  onAdClicked?: () => void;
}

export interface InterstitialCallbacks {
  onAdLoaded?: () => void;
  onAdFailed?: (error: string) => void;
  onAdShown?: () => void;
  onAdClicked?: () => void;
  onAdClosed?: () => void;
}

export class AdsManager {
  private static instance: AdsManager;
  private adsInitialized: boolean = false;
  private rewardedVideoReady: boolean = false;
  private interstitialReady: boolean = false;
  private bannerVisible: boolean = false;
  private adConfigs: Map<string, AdConfig> = new Map();
  private dailyAdShows: number = 0;
  private maxDailyAdShows: number = 15;
  
  private constructor() {
    this.loadAdConfigs();
  }
  
  public static getInstance(): AdsManager {
    if (!AdsManager.instance) {
      AdsManager.instance = new AdsManager();
    }
    return AdsManager.instance;
  }
  
  private loadAdConfigs(): void {
    // 实际项目中从后台配置获取
    // 这里使用模拟配置
    const configs: AdConfig[] = [
      { appId: 'YOUR_APP_ID', adUnitId: 'YOUR_REWARDED_VIDEO_UNIT_ID', type: AdType.REWARDED_VIDEO },
      { appId: 'YOUR_APP_ID', adUnitId: 'YOUR_BANNER_UNIT_ID', type: AdType.BANNER },
      { appId: 'YOUR_APP_ID', adUnitId: 'YOUR_INTERSTITIAL_UNIT_ID', type: AdType.INTERSTITIAL }
    ];
    
    configs.forEach(config => {
      this.adConfigs.set(config.type, config);
    });
  }
  
  public async initializeAds(): Promise<void> {
    if (this.adsInitialized) return;
    
    // 模拟SDK初始化
    console.log('初始化腾讯优量汇广告SDK...');
    
    // 实际项目中：
    // if (typeof wx !== 'undefined') {
    //   await wx.initAdService({
    //     appId: 'YOUR_WX_APP_ID',
    //     isDebug: false
    //   });
    // }
    
    this.adsInitialized = true;
    console.log('广告SDK初始化完成');
  }
  
  // 激励视频广告
  public async loadRewardedVideo(callbacks: RewardedVideoCallbacks): Promise<void> {
    if (!this.adsInitialized) {
      await this.initializeAds();
    }
    
    console.log('加载激励视频广告...');
    
    // 模拟加载过程
    setTimeout(() => {
      this.rewardedVideoReady = true;
      callbacks.onAdLoaded?.();
    }, 500);
    
    // 实际项目中：
    // const rewardedVideo = wx.createRewardedVideoAd({
    //   adUnitId: this.adConfigs.get(AdType.REWARDED_VIDEO)?.adUnitId
    // });
    // 
    // rewardedVideo.onLoad(() => {
    //   this.rewardedVideoReady = true;
    //   callbacks.onAdLoaded?.();
    // });
    // 
    // rewardedVideo.onError((err) => {
    //   callbacks.onAdFailed?.(err.errMsg);
    // });
    // 
    // rewardedVideo.onClose((res) => {
    //   if (res.isEnded) {
    //     callbacks.onRewardEarned?.();
    //   }
    //   callbacks.onAdClosed?.();
    // });
  }
  
  public async showRewardedVideo(callbacks: RewardedVideoCallbacks): Promise<void> {
    if (!this.rewardedVideoReady) {
      await this.loadRewardedVideo(callbacks);
    }
    
    console.log('显示激励视频广告...');
    callbacks.onAdShown?.();
    
    // 模拟广告展示和奖励发放
    // 实际项目中：
    // await rewardedVideo.show();
  }
  
  // Banner广告
  public async loadBanner(position: AdPosition, callbacks?: BannerCallbacks): Promise<void> {
    if (!this.adsInitialized) {
      await this.initializeAds();
    }
    
    console.log(`加载Banner广告 - 位置: ${position}`);
    
    // 模拟加载
    setTimeout(() => {
      callbacks?.onAdLoaded?.();
    }, 300);
    
    // 实际项目中：
    // const bannerAd = wx.createBannerAd({
    //   adUnitId: this.adConfigs.get(AdType.BANNER)?.adUnitId,
    //   style: {
    //     left: 0,
    //     top: window.innerHeight - 100,
    //     width: '100%'
    //   }
    // });
    // 
    // bannerAd.onLoad(() => callbacks?.onAdLoaded?.());
    // bannerAd.onError((err) => callbacks?.onAdFailed?.(err.errMsg));
  }
  
  public showBanner(position: AdPosition): void {
    console.log(`显示Banner广告 - 位置: ${position}`);
    this.bannerVisible = true;
    
    // 实际项目中：
    // bannerAd.show();
  }
  
  public hideBanner(): void {
    console.log('隐藏Banner广告');
    this.bannerVisible = false;
    
    // 实际项目中：
    // bannerAd.hide();
  }
  
  // 插屏广告
  public async loadInterstitial(callbacks: InterstitialCallbacks): Promise<void> {
    if (!this.adsInitialized) {
      await this.initializeAds();
    }
    
    if (this.dailyAdShows >= this.maxDailyAdShows) {
      callbacks.onAdFailed?.('今日广告展示次数已达上限');
      return;
    }
    
    console.log('加载插屏广告...');
    
    // 模拟加载
    setTimeout(() => {
      this.interstitialReady = true;
      callbacks.onAdLoaded?.();
    }, 400);
    
    // 实际项目中：
    // const interstitialAd = wx.createInterstitialAd({
    //   adUnitId: this.adConfigs.get(AdType.INTERSTITIAL)?.adUnitId
    // });
    // 
    // interstitialAd.onLoad(() => {
    //   this.interstitialReady = true;
    //   callbacks.onAdLoaded?.();
    // });
    // 
    // interstitialAd.onError((err) => {
    //   callbacks.onAdFailed?.(err.errMsg);
    // });
    // 
    // interstitialAd.onClose(() => {
    //   callbacks.onAdClosed?.();
    //   this.dailyAdShows++;
    // });
  }
  
  public async showInterstitial(callbacks: InterstitialCallbacks): Promise<void> {
    if (!this.interstitialReady) {
      await this.loadInterstitial(callbacks);
    }
    
    if (this.dailyAdShows >= this.maxDailyAdShows) {
      callbacks.onAdFailed?.('今日广告展示次数已达上限');
      return;
    }
    
    console.log('显示插屏广告...');
    callbacks.onAdShown?.();
    this.dailyAdShows++;
    
    // 实际项目中：
    // await interstitialAd.show();
  }
  
  // 检查是否可以展示广告
  public canShowAd(type: AdType): boolean {
    switch (type) {
      case AdType.INTERSTITIAL:
        return this.dailyAdShows < this.maxDailyAdShows;
      default:
        return true;
    }
  }
  
  // 获取今日广告展示次数
  public getDailyAdShows(): number {
    return this.dailyAdShows;
  }
  
  // 重置每日广告计数（每日零点调用）
  public resetDailyAdCount(): void {
    this.dailyAdShows = 0;
    console.log('广告计数已重置');
  }
  
  // 销毁广告实例
  public destroy(): void {
    console.log('销毁广告实例');
    this.hideBanner();
    this.rewardedVideoReady = false;
    this.interstitialReady = false;
    this.adsInitialized = false;
  }
}

export const adsManager = AdsManager.getInstance();