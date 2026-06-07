import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { cloudSyncService } from '../game/utils/CloudSyncService';
import { SoundManager } from '../game/utils/SoundManager';

export function Login() {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showQRCode, setShowQRCode] = useState(false);

  const handleWechatLogin = async () => {
    setIsLoading(true);
    setError(null);
    SoundManager.playClick();

    try {
      // 1. 获取微信授权码
      const loginResult = await cloudSyncService.wechatLogin();
      
      if (!loginResult) {
        throw new Error('微信登录失败');
      }

      // 2. 使用授权码换取access_token
      const success = await cloudSyncService.exchangeCodeForToken(loginResult.code);
      
      if (!success) {
        throw new Error('登录授权失败');
      }

      // 3. 同步云端数据
      await cloudSyncService.forceSync();

      // 4. 登录成功
      SoundManager.playWin();
      alert('登录成功！');
      navigate('/');

    } catch (error: any) {
      console.error('登录失败:', error);
      setError(error.message || '登录失败，请重试');
      SoundManager.playLose();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestLogin = () => {
    SoundManager.playClick();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-3 mb-4">
              <span className="text-4xl animate-bounce">🍓</span>
              <span className="text-4xl animate-bounce delay-100">🍦</span>
              <span className="text-4xl animate-bounce delay-200">🌸</span>
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-2">
              甜趣点点消
            </h1>
            <p className="text-gray-500">登录以同步游戏进度</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-center">
              {error}
            </div>
          )}

          <div className="space-y-4">
            {/* 微信登录按钮 */}
            <Button
              onClick={handleWechatLogin}
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 text-white text-lg py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all font-semibold"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="animate-spin">🔄</span>
                  登录中...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <span>🐱</span>
                  微信一键登录
                </span>
              )}
            </Button>

            {/* 扫码登录提示 */}
            <div className="text-center">
              <button
                onClick={() => setShowQRCode(!showQRCode)}
                className="text-blue-500 hover:text-blue-600 text-sm underline"
              >
                {showQRCode ? '收起二维码' : '显示微信扫码登录'}
              </button>
              
              {showQRCode && (
                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <div className="w-48 h-48 mx-auto bg-white border-2 border-gray-300 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-5xl mb-2">📱</div>
                      <div className="text-sm text-gray-500">
                        微信扫码区域
                      </div>
                      <div className="text-xs text-gray-400 mt-1">
                        300×300
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-500">
                    打开微信扫一扫登录
                  </div>
                </div>
              )}
            </div>

            {/* 分隔线 */}
            <div className="flex items-center gap-4 my-6">
              <div className="flex-1 h-px bg-gray-300"></div>
              <span className="text-gray-400 text-sm">或</span>
              <div className="flex-1 h-px bg-gray-300"></div>
            </div>

            {/* 游客登录 */}
            <Button
              onClick={handleGuestLogin}
              className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 text-lg py-4 rounded-xl shadow transition-all font-semibold"
            >
              <span className="flex items-center justify-center gap-2">
                <span>👤</span>
                游客登录
              </span>
            </Button>
          </div>

          {/* 登录说明 */}
          <div className="mt-8 text-center">
            <p className="text-xs text-gray-400 leading-relaxed">
              登录即表示您同意我们的<br/>
              <span className="text-blue-500">《用户协议》</span> 和{' '}
              <span className="text-blue-500">《隐私政策》</span>
            </p>
          </div>

          {/* 功能说明 */}
          <div className="mt-6 p-4 bg-pink-50 rounded-xl">
            <h3 className="font-bold text-gray-800 mb-3">🎁 登录即享</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>云端同步游戏进度</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>多设备数据互通</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>参与好友排行榜</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-green-500">✓</span>
                <span>领取专属登录奖励</span>
              </li>
            </ul>
          </div>
        </div>

        {/* 返回按钮 */}
        <div className="mt-6 text-center">
          <Button
            onClick={() => navigate('/')}
            className="bg-white/80 hover:bg-white text-gray-600 px-6 py-2 rounded-full shadow"
          >
            ← 返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}