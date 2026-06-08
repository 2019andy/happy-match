/**
 * local server entry file, for local development
 */
import app from './app.js';
import { cacheService } from './services/cacheService.js';

/**
 * start server with port
 */
const PORT = process.env.PORT || 3001;

/**
 * 初始化服务器数据
 * 服务器启动时自动清除缓存并从数据库重新加载
 */
async function initializeServer() {
  console.log('🚀 服务器启动初始化...');
  
  try {
    // 1. 清除所有缓存数据
    console.log('🧹 清除缓存数据...');
    cacheService.clearAllCache();
    
    // 2. 从数据库加载所有数据到缓存
    console.log('📥 从数据库加载数据到缓存...');
    await cacheService.loadAllDataFromDatabase();
    
    // 3. 显示缓存统计信息
    const stats = cacheService.getCacheStats();
    console.log('📊 缓存统计:', {
      用户数: stats.usersCount,
      关卡数: stats.levelsCount,
      活动数: stats.activitiesCount,
      商品数: stats.shopItemsCount,
      最后更新: stats.lastUpdateTime,
    });
    
    console.log('✅ 服务器初始化完成');
  } catch (error) {
    console.error('❌ 服务器初始化失败:', error);
    // 即使初始化失败，服务器仍然可以运行
    // 后续请求时会自动从数据库加载
  }
}

const server = app.listen(PORT, async () => {
  console.log(`Server ready on port ${PORT}`);
  
  // 服务器启动后自动初始化缓存数据
  await initializeServer();
});

/**
 * close server
 */
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;