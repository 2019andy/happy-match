import { adsManager } from '../utils/AdsManager';

export interface AdPerformance {
  adType: string;
  impressions: number;
  clicks: number;
  revenue: number;
  eCPM: number;
  fillRate: number;
  avgDuration: number;
}

export interface UserBehavior {
  sessionId: string;
  startTime: number;
  endTime: number;
  levelsPlayed: number;
  adsWatched: number;
  totalScore: number;
  purchases: number;
}

export interface LevelMetrics {
  levelId: number;
  attempts: number;
  completions: number;
  avgMoves: number;
  avgScore: number;
  dropOffRate: number;
  avgTime: number;
}

export interface OptimizationConfig {
  adFrequency: {
    interstitialInterval: number; // 插屏广告间隔（关卡数）
    maxDailyInterstitials: number;
    maxHourlyInterstitials: number;
  };
  rewardedVideo: {
    showAfterFailDelay: number; // 失败后展示延迟（毫秒）
    maxAttemptsPerSession: number;
  };
  banner: {
    refreshInterval: number; // Banner刷新间隔（秒）
    showOnGameScreen: boolean;
  };
  targeting: {
    enableAgeTargeting: boolean;
    enableInterestTargeting: boolean;
  };
}

export class AdOptimizationSystem {
  private static instance: AdOptimizationSystem;
  private adPerformance: AdPerformance[] = [];
  private userBehavior: UserBehavior[] = [];
  private levelMetrics: Map<number, LevelMetrics> = new Map();
  private config: OptimizationConfig;
  private dailyStats: {
    impressions: number;
    clicks: number;
    revenue: number;
    adsWatched: number;
  };
  
  private constructor() {
    this.config = this.loadConfig();
    this.dailyStats = this.loadDailyStats();
  }
  
  public static getInstance(): AdOptimizationSystem {
    if (!AdOptimizationSystem.instance) {
      AdOptimizationSystem.instance = new AdOptimizationSystem();
    }
    return AdOptimizationSystem.instance;
  }
  
  private loadConfig(): OptimizationConfig {
    const saved = localStorage.getItem('ad_optimization_config');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return this.getDefaultConfig();
      }
    }
    return this.getDefaultConfig();
  }
  
  private getDefaultConfig(): OptimizationConfig {
    return {
      adFrequency: {
        interstitialInterval: 3,
        maxDailyInterstitials: 15,
        maxHourlyInterstitials: 5
      },
      rewardedVideo: {
        showAfterFailDelay: 1500,
        maxAttemptsPerSession: 3
      },
      banner: {
        refreshInterval: 30,
        showOnGameScreen: true
      },
      targeting: {
        enableAgeTargeting: true,
        enableInterestTargeting: true
      }
    };
  }
  
  private loadDailyStats(): { impressions: number; clicks: number; revenue: number; adsWatched: number } {
    const saved = localStorage.getItem('ad_daily_stats');
    if (saved) {
      const data = JSON.parse(saved);
      // 检查是否是新的一天
      const today = new Date().toDateString();
      if (data.date === today) {
        return data.stats;
      }
    }
    return { impressions: 0, clicks: 0, revenue: 0, adsWatched: 0 };
  }
  
  private saveDailyStats(): void {
    localStorage.setItem('ad_daily_stats', JSON.stringify({
      date: new Date().toDateString(),
      stats: this.dailyStats
    }));
  }
  
  private saveConfig(): void {
    localStorage.setItem('ad_optimization_config', JSON.stringify(this.config));
  }
  
  // 记录广告展示
  public recordAdImpression(adType: string): void {
    this.dailyStats.impressions++;
    
    let perf = this.adPerformance.find(p => p.adType === adType);
    if (!perf) {
      perf = {
        adType,
        impressions: 0,
        clicks: 0,
        revenue: 0,
        eCPM: 0,
        fillRate: 100,
        avgDuration: 0
      };
      this.adPerformance.push(perf);
    }
    perf.impressions++;
    
    this.saveDailyStats();
    this.optimizeAdFrequency();
  }
  
  // 记录广告点击
  public recordAdClick(adType: string): void {
    this.dailyStats.clicks++;
    
    const perf = this.adPerformance.find(p => p.adType === adType);
    if (perf) {
      perf.clicks++;
    }
    
    this.saveDailyStats();
  }
  
  // 记录广告收益
  public recordAdRevenue(adType: string, revenue: number): void {
    this.dailyStats.revenue += revenue;
    
    const perf = this.adPerformance.find(p => p.adType === adType);
    if (perf) {
      perf.revenue += revenue;
      perf.eCPM = perf.impressions > 0 ? (perf.revenue / perf.impressions) * 1000 : 0;
    }
    
    this.saveDailyStats();
  }
  
  // 记录激励视频观看
  public recordRewardedVideoWatched(): void {
    this.dailyStats.adsWatched++;
    this.saveDailyStats();
  }
  
  // 记录用户行为
  public recordUserBehavior(behavior: Omit<UserBehavior, 'sessionId' | 'startTime'>): void {
    const session: UserBehavior = {
      ...behavior,
      sessionId: `session_${Date.now()}`,
      startTime: Date.now() - behavior.endTime,
      endTime: Date.now()
    };
    
    this.userBehavior.push(session);
    
    // 只保留最近100条记录
    if (this.userBehavior.length > 100) {
      this.userBehavior.shift();
    }
    
    this.optimizeBasedOnBehavior();
  }
  
  // 记录关卡指标
  public recordLevelMetric(levelId: number, completed: boolean, moves: number, score: number, time: number): void {
    let metric = this.levelMetrics.get(levelId);
    
    if (!metric) {
      metric = {
        levelId,
        attempts: 0,
        completions: 0,
        avgMoves: 0,
        avgScore: 0,
        dropOffRate: 0,
        avgTime: 0
      };
    }
    
    metric.attempts++;
    if (completed) {
      metric.completions++;
    }
    
    // 计算平均值
    metric.avgMoves = (metric.avgMoves * (metric.attempts - 1) + moves) / metric.attempts;
    metric.avgScore = (metric.avgScore * (metric.attempts - 1) + score) / metric.attempts;
    metric.avgTime = (metric.avgTime * (metric.attempts - 1) + time) / metric.attempts;
    metric.dropOffRate = 100 - (metric.completions / metric.attempts) * 100;
    
    this.levelMetrics.set(levelId, metric);
    this.optimizeLevelDifficulty(levelId);
  }
  
  // 根据用户行为优化广告策略
  private optimizeBasedOnBehavior(): void {
    const recentSessions = this.userBehavior.slice(-10);
    const avgAdsWatched = recentSessions.reduce((sum, s) => sum + s.adsWatched, 0) / recentSessions.length;
    const avgLevelsPlayed = recentSessions.reduce((sum, s) => sum + s.levelsPlayed, 0) / recentSessions.length;
    
    // 如果用户观看广告较少，增加展示机会
    if (avgAdsWatched < 1 && avgLevelsPlayed > 3) {
      this.config.adFrequency.interstitialInterval = Math.max(2, this.config.adFrequency.interstitialInterval - 1);
    }
    
    // 如果用户观看广告较多，保持当前频率
    if (avgAdsWatched > 3) {
      this.config.adFrequency.interstitialInterval = Math.min(5, this.config.adFrequency.interstitialInterval + 1);
    }
    
    this.saveConfig();
  }
  
  // 优化广告频率
  private optimizeAdFrequency(): void {
    const hourlyAds = this.dailyStats.adsWatched;
    const hourOfDay = new Date().getHours();
    
    // 黄金时段（晚上8-11点）增加广告展示
    if (hourOfDay >= 20 && hourOfDay <= 23) {
      this.config.adFrequency.maxHourlyInterstitials = 8;
    } else {
      this.config.adFrequency.maxHourlyInterstitials = 5;
    }
    
    // 根据每日观看量调整
    if (this.dailyStats.adsWatched > 20) {
      this.config.rewardedVideo.maxAttemptsPerSession = 5;
    } else if (this.dailyStats.adsWatched < 5) {
      this.config.rewardedVideo.maxAttemptsPerSession = 2;
    }
    
    this.saveConfig();
  }
  
  // 根据关卡数据优化难度
  private optimizeLevelDifficulty(levelId: number): void {
    const metric = this.levelMetrics.get(levelId);
    if (!metric || metric.attempts < 10) return;
    
    // 如果关卡放弃率超过60%，降低难度
    if (metric.dropOffRate > 60) {
      console.log(`关卡 ${levelId} 放弃率过高，建议降低难度`);
    }
    
    // 如果关卡完成率超过90%，增加难度
    if ((metric.completions / metric.attempts) * 100 > 90) {
      console.log(`关卡 ${levelId} 太简单，建议增加难度`);
    }
  }
  
  // 获取广告性能数据
  public getAdPerformance(): AdPerformance[] {
    return [...this.adPerformance];
  }
  
  // 获取每日统计
  public getDailyStats(): { impressions: number; clicks: number; revenue: number; adsWatched: number } {
    return { ...this.dailyStats };
  }
  
  // 获取关卡指标
  public getLevelMetrics(levelId: number): LevelMetrics | undefined {
    return this.levelMetrics.get(levelId);
  }
  
  // 获取优化配置
  public getConfig(): OptimizationConfig {
    return { ...this.config };
  }
  
  // 设置配置
  public setConfig(config: Partial<OptimizationConfig>): void {
    this.config = { ...this.config, ...config };
    this.saveConfig();
  }
  
  // 预测最佳广告展示时间
  public predictBestAdTime(): string[] {
    const sessionsByHour: Record<number, number> = {};
    
    this.userBehavior.forEach(session => {
      const hour = new Date(session.startTime).getHours();
      sessionsByHour[hour] = (sessionsByHour[hour] || 0) + 1;
    });
    
    // 返回活跃时段
    return Object.entries(sessionsByHour)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3)
      .map(([hour]) => `${hour}:00-${parseInt(hour) + 1}:00`);
  }
  
  // 获取eCPM预估
  public estimateECPM(): number {
    const totalImpressions = this.adPerformance.reduce((sum, p) => sum + p.impressions, 0);
    const totalRevenue = this.adPerformance.reduce((sum, p) => sum + p.revenue, 0);
    
    return totalImpressions > 0 ? (totalRevenue / totalImpressions) * 1000 : 0;
  }
  
  // 重置每日统计
  public resetDailyStats(): void {
    this.dailyStats = { impressions: 0, clicks: 0, revenue: 0, adsWatched: 0 };
    this.saveDailyStats();
  }
}

export const adOptimizationSystem = AdOptimizationSystem.getInstance();