import axios from 'axios';
import { UserData, Achievement, Skin, DailyChallenge, LeaderboardEntry } from '../game/types';

const API_BASE_URL = import.meta.env.VITE_API_URL || '/api/auth';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
}

export interface LoginResult {
  accessToken: string;
  user: UserData;
}

export const authApi = {
  wechatLogin: async (code: string): Promise<ApiResponse<LoginResult>> => {
    try {
      const response = await api.post('/wechat-login', { code });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '登录失败' };
    }
  },

  guestLogin: async (deviceId: string): Promise<ApiResponse<LoginResult>> => {
    try {
      const response = await api.post('/guest-login', { deviceId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '登录失败' };
    }
  },

  logout: (): void => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
  },
};

export const userApi = {
  getProfile: async (): Promise<ApiResponse<UserData>> => {
    try {
      const response = await api.get('/profile');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '获取用户信息失败' };
    }
  },

  updateSettings: async (settings: Partial<UserData['powerups'] & { soundEnabled?: boolean; vibrationEnabled?: boolean }>): Promise<ApiResponse> => {
    try {
      const response = await api.put('/settings', settings);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '更新设置失败' };
    }
  },

  changeSkin: async (skinId: string): Promise<ApiResponse<{ skinId: string }>> => {
    try {
      const response = await api.put('/skin', { skinId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '更换皮肤失败' };
    }
  },

  consumeEnergy: async (amount: number = 5): Promise<ApiResponse<{ energy: number }>> => {
    try {
      const response = await api.post('/energy/consume', { amount });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '消耗能量失败' };
    }
  },

  recoverEnergy: async (): Promise<ApiResponse<{ energy: number }>> => {
    try {
      const response = await api.post('/energy/recover');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '恢复能量失败' };
    }
  },
};

export const gameApi = {
  updateProgress: async (levelId: number, score: number, stars: number, moves: number, time: number): Promise<ApiResponse> => {
    try {
      const response = await api.post('/game/progress', { levelId, score, stars, moves, time });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '更新进度失败' };
    }
  },

  recordFailure: async (levelId: number): Promise<ApiResponse> => {
    try {
      const response = await api.post('/game/failure', { levelId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '记录失败失败' };
    }
  },
};

export const socialApi = {
  getLeaderboard: async (): Promise<ApiResponse<LeaderboardEntry[]>> => {
    try {
      const response = await api.get('/social/leaderboard');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '获取排行榜失败' };
    }
  },

  getFriends: async (): Promise<ApiResponse<UserData[]>> => {
    try {
      const response = await api.get('/social/friends');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '获取好友列表失败' };
    }
  },

  sendHelp: async (friendId: string): Promise<ApiResponse> => {
    try {
      const response = await api.post('/social/help', { friendId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '发送求助失败' };
    }
  },
};

export const shopApi = {
  getItems: async (): Promise<ApiResponse<{ id: string; name: string; description: string; icon: string; price: number; currency: 'coins' | 'diamonds'; type: string }[]>> => {
    try {
      const response = await api.get('/shop/items');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '获取商品列表失败' };
    }
  },

  purchase: async (itemId: string): Promise<ApiResponse> => {
    try {
      const response = await api.post('/shop/purchase', { itemId });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '购买失败' };
    }
  },
};

export const activityApi = {
  getDailyChallenge: async (): Promise<ApiResponse<DailyChallenge>> => {
    try {
      const response = await api.get('/activity/daily-challenge');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '获取每日挑战失败' };
    }
  },

  updateChallengeProgress: async (progress: number): Promise<ApiResponse> => {
    try {
      const response = await api.post('/activity/daily-challenge/progress', { progress });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '更新挑战进度失败' };
    }
  },
};

export const levelApi = {
  getLevel: async (levelId: number): Promise<ApiResponse<{ id: number; name: string; type: string; targetScore: number; moves: number; boardWidth: number; boardHeight: number }>> => {
    try {
      const response = await api.get(`/level/${levelId}`);
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '获取关卡信息失败' };
    }
  },

  getLevels: async (): Promise<ApiResponse<{ id: number; name: string; type: string; targetScore: number; moves: number }[]>> => {
    try {
      const response = await api.get('/level/list');
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, message: '获取关卡列表失败' };
    }
  },
};

export { api };
export default api;