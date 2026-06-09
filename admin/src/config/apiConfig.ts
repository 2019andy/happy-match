/**
 * API 配置 - 云端生产环境
 * 服务器: 114.132.69.85
 */

export const API_CONFIG = {
  // 云端API地址
  API_BASE_URL: 'http://114.132.69.85:3001',

  // API端点
  ENDPOINTS: {
    // 用户管理
    USERS: '/api/admin/users',
    USER_BY_ID: (id: string) => `/api/admin/users/${id}`,

    // 关卡管理
    LEVELS: '/api/admin/levels',

    // 缓存管理
    CACHE_CLEAR: '/api/admin/cache/clear',
    CACHE_STATS: '/api/admin/cache/stats',

    // 认证
    AUTH_CLEAR_ALL: '/api/auth/clear-all-data',
  }
};

// 完整的API URL
export const getFullUrl = (endpoint: string): string => {
  return `${API_CONFIG.API_BASE_URL}${endpoint}`;
};

export default API_CONFIG;
