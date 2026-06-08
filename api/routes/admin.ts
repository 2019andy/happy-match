/**
 * 管理后台API路由
 * 实现数据库 → 缓存 → 页面的数据流程
 */
import { Router, type Request, type Response } from 'express';
import { cacheService } from '../services/cacheService.js';

const router = Router();

/**
 * 清除所有缓存数据
 * POST /api/admin/cache/clear
 */
router.post('/cache/clear', async (req: Request, res: Response): Promise<void> => {
  try {
    cacheService.clearAllCache();
    res.json({
      success: true,
      message: '所有缓存数据已清除',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('清除缓存失败:', error);
    res.status(500).json({
      success: false,
      message: '清除缓存失败',
    });
  }
});

/**
 * 从数据库加载所有数据到缓存
 * POST /api/admin/cache/load-from-database
 */
router.post('/cache/load-from-database', async (req: Request, res: Response): Promise<void> => {
  try {
    await cacheService.loadAllDataFromDatabase();
    const stats = cacheService.getCacheStats();
    res.json({
      success: true,
      message: '数据已从数据库加载到缓存',
      cacheStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('从数据库加载失败:', error);
    res.status(500).json({
      success: false,
      message: '从数据库加载失败',
    });
  }
});

/**
 * 获取缓存统计信息
 * GET /api/admin/cache/stats
 */
router.get('/cache/stats', async (req: Request, res: Response): Promise<void> => {
  try {
    const stats = cacheService.getCacheStats();
    res.json({
      success: true,
      data: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取缓存统计失败:', error);
    res.status(500).json({
      success: false,
      message: '获取缓存统计失败',
    });
  }
});

/**
 * 获取所有用户数据（从缓存，不包括已逻辑删除的）
 * GET /api/admin/users
 */
router.get('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    // 如果缓存过期或为空，先从数据库加载
    if (cacheService.isCacheExpired() || cacheService.getAllUsers().length === 0) {
      await cacheService.loadUsersFromDatabase();
    }
    
    const users = cacheService.getAllUsers();
    res.json({
      success: true,
      data: users,
      source: 'cache',
      count: users.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取用户数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户数据失败',
    });
  }
});

/**
 * 获取单个用户数据
 * GET /api/admin/users/:id
 */
router.get('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const user = cacheService.getUser(userId);
    
    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在或已删除',
      });
      return;
    }
    
    res.json({
      success: true,
      data: user,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取用户数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取用户数据失败',
    });
  }
});

/**
 * 创建新用户
 * POST /api/admin/users
 */
router.post('/users', async (req: Request, res: Response): Promise<void> => {
  try {
    const { nickname, coins, diamonds, currentLevel, avatar } = req.body;
    
    if (!nickname) {
      res.status(400).json({
        success: false,
        message: '用户名不能为空',
      });
      return;
    }
    
    const newUser = cacheService.addUser({
      nickname,
      coins: coins || 100,
      diamonds: diamonds || 10,
      currentLevel: currentLevel || 1,
      avatar: avatar || '👤',
    });
    
    res.json({
      success: true,
      data: newUser,
      message: '用户创建成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('创建用户失败:', error);
    res.status(500).json({
      success: false,
      message: '创建用户失败',
    });
  }
});

/**
 * 更新用户信息（编辑功能）
 * PUT /api/admin/users/:id
 */
router.put('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const { nickname, coins, diamonds, currentLevel, avatar, totalScore, totalStars, energy, status } = req.body;
    
    // 构建更新数据对象，只包含提供的字段
    const updateData: any = {};
    if (nickname !== undefined) updateData.nickname = nickname;
    if (coins !== undefined) updateData.coins = coins;
    if (diamonds !== undefined) updateData.diamonds = diamonds;
    if (currentLevel !== undefined) updateData.currentLevel = currentLevel;
    if (avatar !== undefined) updateData.avatar = avatar;
    if (totalScore !== undefined) updateData.totalScore = totalScore;
    if (totalStars !== undefined) updateData.totalStars = totalStars;
    if (energy !== undefined) updateData.energy = energy;
    if (status !== undefined) updateData.status = status;
    
    const updatedUser = cacheService.updateUser(userId, updateData);
    
    if (!updatedUser) {
      res.status(404).json({
        success: false,
        message: '用户不存在或已删除',
      });
      return;
    }
    
    res.json({
      success: true,
      data: updatedUser,
      message: '用户信息更新成功',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('更新用户信息失败:', error);
    res.status(500).json({
      success: false,
      message: '更新用户信息失败',
    });
  }
});

/**
 * 逻辑删除用户
 * DELETE /api/admin/users/:id
 */
router.delete('/users/:id', async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.params.id;
    const deleted = cacheService.softDeleteUser(userId);
    
    if (!deleted) {
      res.status(404).json({
        success: false,
        message: '用户不存在',
      });
      return;
    }
    
    res.json({
      success: true,
      message: '用户已逻辑删除',
      userId: userId,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('删除用户失败:', error);
    res.status(500).json({
      success: false,
      message: '删除用户失败',
    });
  }
});

/**
 * 获取所有关卡数据（从缓存）
 * GET /api/admin/levels
 */
router.get('/levels', async (req: Request, res: Response): Promise<void> => {
  try {
    // 如果缓存过期或为空，先从数据库加载
    if (cacheService.isCacheExpired() || cacheService.getAllLevels().length === 0) {
      await cacheService.loadLevelsFromDatabase();
    }
    
    const levels = cacheService.getAllLevels();
    res.json({
      success: true,
      data: levels,
      source: 'cache',
      count: levels.length,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('获取关卡数据失败:', error);
    res.status(500).json({
      success: false,
      message: '获取关卡数据失败',
    });
  }
});

/**
 * 清除所有数据（缓存 + localStorage）
 * POST /api/admin/clear-all-data
 */
router.post('/clear-all-data', async (req: Request, res: Response): Promise<void> => {
  try {
    // 清除缓存
    cacheService.clearAllCache();
    
    res.json({
      success: true,
      message: '所有数据已清除（缓存已清空，前端localStorage需在浏览器中清除）',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('清除所有数据失败:', error);
    res.status(500).json({
      success: false,
      message: '清除所有数据失败',
    });
  }
});

/**
 * 初始化系统数据
 * POST /api/admin/init-data
 */
router.post('/init-data', async (req: Request, res: Response): Promise<void> => {
  try {
    // 清除现有缓存
    cacheService.clearAllCache();
    
    // 从数据库加载所有数据到缓存
    await cacheService.loadAllDataFromDatabase();
    
    const stats = cacheService.getCacheStats();
    res.json({
      success: true,
      message: '系统数据初始化完成',
      cacheStats: stats,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('初始化数据失败:', error);
    res.status(500).json({
      success: false,
      message: '初始化数据失败',
    });
  }
});

export default router;