/**
 * 缓存管理服务
 * 实现数据库 → 缓存 → 页面的数据流程
 */

interface CacheData {
  users: Map<string, any>;
  userProgress: Map<string, any>;
  userEnergy: Map<string, any>;
  levels: Map<number, any>;
  activities: Map<string, any>;
  shopItems: Map<string, any>;
}

class CacheService {
  private cache: CacheData = {
    users: new Map(),
    userProgress: new Map(),
    userEnergy: new Map(),
    levels: new Map(),
    activities: new Map(),
    shopItems: new Map(),
  };

  private lastUpdateTime: Date = new Date();
  private cacheExpiryTime: number = 30 * 60 * 1000; // 30分钟缓存过期

  /**
   * 清除所有缓存数据
   */
  clearAllCache(): void {
    this.cache.users.clear();
    this.cache.userProgress.clear();
    this.cache.userEnergy.clear();
    this.cache.levels.clear();
    this.cache.activities.clear();
    this.cache.shopItems.clear();
    this.lastUpdateTime = new Date();
    console.log('✅ 所有缓存数据已清除');
  }

  /**
   * 检查缓存是否过期
   */
  isCacheExpired(): boolean {
    const now = new Date();
    const timeDiff = now.getTime() - this.lastUpdateTime.getTime();
    return timeDiff > this.cacheExpiryTime;
  }

  /**
   * 获取用户缓存数据
   */
  getUser(userId: string): any | null {
    return this.cache.users.get(userId) || null;
  }

  /**
   * 设置用户缓存数据
   */
  setUser(userId: string, userData: any): void {
    this.cache.users.set(userId, userData);
    this.lastUpdateTime = new Date();
  }

  /**
   * 获取所有用户缓存数据（不包括已逻辑删除的）
   */
  getAllUsers(): any[] {
    return Array.from(this.cache.users.values()).filter((user: any) => !user.isDeleted);
  }

  /**
   * 获取所有用户缓存数据（包括已逻辑删除的）
   */
  getAllUsersIncludingDeleted(): any[] {
    return Array.from(this.cache.users.values());
  }

  /**
   * 逻辑删除用户（设置isDeleted标志）
   */
  softDeleteUser(userId: string): boolean {
    const user = this.cache.users.get(userId);
    if (user) {
      user.isDeleted = true;
      user.deletedAt = new Date().toISOString();
      user.status = 'deleted';
      this.lastUpdateTime = new Date();
      console.log(`✅ 用户 ${userId} 已逻辑删除`);
      return true;
    }
    console.log(`❌ 用户 ${userId} 不存在`);
    return false;
  }

  /**
   * 物理删除用户缓存数据
   */
  deleteUser(userId: string): boolean {
    const deleted = this.cache.users.delete(userId);
    if (deleted) {
      console.log(`✅ 用户 ${userId} 已物理删除`);
    }
    return deleted;
  }

  /**
   * 更新用户信息（编辑功能）
   */
  updateUser(userId: string, updateData: any): any | null {
    const user = this.cache.users.get(userId);
    if (!user) {
      console.log(`❌ 用户 ${userId} 不存在，无法更新`);
      return null;
    }
    
    // 合并更新数据，保留原始数据，只更新提供的字段
    const updatedUser = {
      ...user,
      ...updateData,
      // 确保id不变
      id: user.id,
      updatedAt: new Date().toISOString(),
    };
    
    this.cache.users.set(userId, updatedUser);
    this.lastUpdateTime = new Date();
    console.log(`✅ 用户 ${userId} 已更新`);
    return updatedUser;
  }

  /**
   * 获取单个用户信息
   */
  getUser(userId: string): any | null {
    const user = this.cache.users.get(userId);
    if (user && !user.isDeleted) {
      return user;
    }
    return null;
  }

  /**
   * 获取关卡缓存数据
   */
  getLevel(levelId: number): any | null {
    return this.cache.levels.get(levelId) || null;
  }

  /**
   * 设置关卡缓存数据
   */
  setLevel(levelId: number, levelData: any): void {
    this.cache.levels.set(levelId, levelData);
    this.lastUpdateTime = new Date();
  }

  /**
   * 获取所有关卡缓存数据
   */
  getAllLevels(): any[] {
    return Array.from(this.cache.levels.values());
  }

  /**
   * 获取活动缓存数据
   */
  getActivity(activityId: string): any | null {
    return this.cache.activities.get(activityId) || null;
  }

  /**
   * 设置活动缓存数据
   */
  setActivity(activityId: string, activityData: any): void {
    this.cache.activities.set(activityId, activityData);
    this.lastUpdateTime = new Date();
  }

  /**
   * 获取所有活动缓存数据
   */
  getAllActivities(): any[] {
    return Array.from(this.cache.activities.values());
  }

  /**
   * 获取商城商品缓存数据
   */
  getShopItem(itemId: string): any | null {
    return this.cache.shopItems.get(itemId) || null;
  }

  /**
   * 设置商城商品缓存数据
   */
  setShopItem(itemId: string, itemData: any): void {
    this.cache.shopItems.set(itemId, itemData);
    this.lastUpdateTime = new Date();
  }

  /**
   * 获取所有商城商品缓存数据
   */
  getAllShopItems(): any[] {
    return Array.from(this.cache.shopItems.values());
  }

  /**
   * 获取缓存统计信息
   */
  getCacheStats(): any {
    return {
      usersCount: this.cache.users.size,
      levelsCount: this.cache.levels.size,
      activitiesCount: this.cache.activities.size,
      shopItemsCount: this.cache.shopItems.size,
      lastUpdateTime: this.lastUpdateTime,
      isExpired: this.isCacheExpired(),
    };
  }

  /**
   * 从数据库加载用户数据到缓存（模拟）
   * TODO: 实际项目中需要连接真实数据库
   */
  async loadUsersFromDatabase(): Promise<void> {
    console.log('🔄 从数据库加载用户数据到缓存...');
    
    // 模拟数据库数据
    const mockUsers = [
      {
        id: 'user_001',
        nickname: '玩家小明',
        avatar: '😊',
        currentLevel: 15,
        totalScore: 12500,
        highestScore: 850,
        totalStars: 42,
        coins: 580,
        diamonds: 25,
        energy: 30,
        maxEnergy: 30,
        totalPlays: 156,
        totalEliminations: 2340,
        createdAt: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
        status: 'active',
        isDeleted: false,
      },
      {
        id: 'user_002',
        nickname: '游戏达人',
        avatar: '🎮',
        currentLevel: 28,
        totalScore: 28600,
        highestScore: 1250,
        totalStars: 78,
        coins: 1250,
        diamonds: 65,
        energy: 30,
        maxEnergy: 30,
        totalPlays: 320,
        totalEliminations: 4800,
        createdAt: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
        status: 'active',
        isDeleted: false,
      },
      {
        id: 'user_003',
        nickname: '新手玩家',
        avatar: '🌟',
        currentLevel: 5,
        totalScore: 3200,
        highestScore: 420,
        totalStars: 12,
        coins: 150,
        diamonds: 8,
        energy: 30,
        maxEnergy: 30,
        totalPlays: 45,
        totalEliminations: 675,
        createdAt: new Date().toISOString(),
        lastLoginDate: new Date().toISOString(),
        status: 'active',
        isDeleted: false,
      },
    ];

    // 清空现有缓存
    this.cache.users.clear();

    // 加载到缓存
    mockUsers.forEach(user => {
      this.cache.users.set(user.id, user);
    });

    this.lastUpdateTime = new Date();
    console.log(`✅ 已加载 ${mockUsers.length} 个用户数据到缓存`);
  }

  /**
   * 添加新用户
   */
  addUser(userData: any): any {
    const newUser = {
      id: userData.id || `user_${Date.now()}`,
      nickname: userData.nickname,
      avatar: userData.avatar || '👤',
      currentLevel: userData.currentLevel || 1,
      totalScore: userData.totalScore || 0,
      highestScore: userData.highestScore || 0,
      totalStars: userData.totalStars || 0,
      coins: userData.coins || 100,
      diamonds: userData.diamonds || 10,
      energy: userData.energy || 30,
      maxEnergy: userData.maxEnergy || 30,
      totalPlays: userData.totalPlays || 0,
      totalEliminations: userData.totalEliminations || 0,
      status: 'active',
      isDeleted: false,
      createdAt: new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
    };
    this.cache.users.set(newUser.id, newUser);
    this.lastUpdateTime = new Date();
    console.log(`✅ 新用户 ${newUser.nickname} 已添加到缓存`);
    return newUser;
  }

  /**
   * 从数据库加载关卡数据到缓存（模拟）
   */
  async loadLevelsFromDatabase(): Promise<void> {
    console.log('🔄 从数据库加载关卡数据到缓存...');
    
    const mockLevels = [
      { id: 1, level: 1, difficulty: 'easy', targetScore: 500, moves: 20, status: 'active' },
      { id: 2, level: 2, difficulty: 'easy', targetScore: 600, moves: 22, status: 'active' },
      { id: 3, level: 3, difficulty: 'easy', targetScore: 700, moves: 24, status: 'active' },
      { id: 4, level: 4, difficulty: 'medium', targetScore: 800, moves: 25, status: 'active' },
      { id: 5, level: 5, difficulty: 'medium', targetScore: 900, moves: 26, status: 'active' },
      { id: 6, level: 6, difficulty: 'medium', targetScore: 1000, moves: 28, status: 'active' },
      { id: 7, level: 7, difficulty: 'hard', targetScore: 1200, moves: 30, status: 'active' },
      { id: 8, level: 8, difficulty: 'hard', targetScore: 1500, moves: 32, status: 'active' },
      { id: 9, level: 9, difficulty: 'hard', targetScore: 1800, moves: 35, status: 'active' },
      { id: 10, level: 10, difficulty: 'hard', targetScore: 2000, moves: 40, status: 'active' },
    ];

    this.cache.levels.clear();
    mockLevels.forEach(level => {
      this.cache.levels.set(level.id, level);
    });

    this.lastUpdateTime = new Date();
    console.log(`✅ 已加载 ${mockLevels.length} 个关卡数据到缓存`);
  }

  /**
   * 从数据库加载所有数据到缓存
   */
  async loadAllDataFromDatabase(): Promise<void> {
    console.log('🚀 开始从数据库加载所有数据到缓存...');
    
    await this.loadUsersFromDatabase();
    await this.loadLevelsFromDatabase();
    
    console.log('✅ 所有数据已从数据库加载到缓存');
  }
}

// 导出单例实例
export const cacheService = new CacheService();