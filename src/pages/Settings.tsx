import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { StorageSystem } from '../game/utils/StorageSystem';
import { SoundManager } from '../game/utils/SoundManager';
import { ThemeConfig } from '../game/types';

export function Settings() {
  const navigate = useNavigate();
  const [themeConfig, setThemeConfig] = useState<ThemeConfig>(StorageSystem.getThemeConfig());
  const [soundEnabled, setSoundEnabled] = useState(SoundManager.isSoundEnabled());
  const [vibrationEnabled, setVibrationEnabled] = useState(SoundManager.isVibrationEnabled());
  const [volume, setVolume] = useState(SoundManager.getVolume());

  useEffect(() => {
    StorageSystem.saveThemeConfig(themeConfig);
    
    if (themeConfig.isEyeCareMode) {
      document.documentElement.style.filter = 'saturate(0.7)';
    } else {
      document.documentElement.style.filter = 'saturate(1)';
    }
  }, [themeConfig]);

  const toggleEyeCareMode = () => {
    SoundManager.playClick();
    setThemeConfig(prev => ({
      ...prev,
      isEyeCareMode: !prev.isEyeCareMode
    }));
  };

  const toggleSound = () => {
    const newState = SoundManager.toggleSound();
    setSoundEnabled(newState);
    if (newState) {
      SoundManager.playClick();
    }
  };

  const toggleVibration = () => {
    SoundManager.playClick();
    const newState = SoundManager.toggleVibration();
    setVibrationEnabled(newState);
  };

  const handleVolumeChange = (newVolume: number) => {
    SoundManager.setVolume(newVolume);
    setVolume(newVolume);
    if (soundEnabled) {
      SoundManager.playClick();
    }
  };

  const testSound = () => {
    SoundManager.playWin();
  };

  const resetProgress = () => {
    SoundManager.playClick();
    if (confirm('确定要重置所有游戏进度吗？此操作不可撤销。')) {
      StorageSystem.clearAll();
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
              设置
            </h1>
            <p className="text-purple-300">调整游戏体验</p>
          </div>

          {/* 音效设置 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">🔊</span>
              音效设置
            </h3>
            
            <div className="space-y-4">
              {/* 音效开关 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">游戏音效</div>
                  <div className="text-sm text-gray-500">消除、连击、通关音效</div>
                </div>
                <button
                  onClick={toggleSound}
                  className={`
                    relative w-14 h-8 rounded-full transition-all duration-300
                    ${soundEnabled ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'}
                  `}
                >
                  <span
                    className={`
                      absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all duration-300
                      ${soundEnabled ? 'left-7' : 'left-1'}
                    `}
                  />
                </button>
              </div>
              
              {/* 音量调节 */}
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-semibold text-gray-800">音量大小</div>
                  <div className="text-sm text-gray-500">调节音效音量</div>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={volume * 100}
                    onChange={(e) => handleVolumeChange(parseInt(e.target.value) / 100)}
                    className="w-24 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-400"
                  />
                  <span className="text-sm text-gray-600 w-8">{Math.round(volume * 100)}%</span>
                </div>
              </div>
              
              {/* 测试音效按钮 */}
              <Button
                onClick={testSound}
                className="w-full bg-gradient-to-r from-yellow-200 to-orange-200 hover:from-yellow-300 hover:to-orange-300 text-gray-700 py-2 rounded-full text-sm"
              >
                🎵 测试音效
              </Button>
            </div>
          </div>

          {/* 震动设置 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">📳</span>
              震动反馈
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">震动反馈</div>
                <div className="text-sm text-gray-500">消除成功时轻震动</div>
              </div>
              <button
                onClick={toggleVibration}
                className={`
                  relative w-14 h-8 rounded-full transition-all duration-300
                  ${vibrationEnabled ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all duration-300
                    ${vibrationEnabled ? 'left-7' : 'left-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* 护眼模式 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
              <span className="text-2xl">👁️</span>
              视觉设置
            </h3>
            
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">护眼柔和模式</div>
                <div className="text-sm text-gray-500">降低色彩饱和度，保护眼睛</div>
              </div>
              <button
                onClick={toggleEyeCareMode}
                className={`
                  relative w-14 h-8 rounded-full transition-all duration-300
                  ${themeConfig.isEyeCareMode ? 'bg-gradient-to-r from-pink-400 to-purple-400' : 'bg-gray-300'}
                `}
              >
                <span
                  className={`
                    absolute top-1 w-6 h-6 bg-white rounded-full shadow transition-all duration-300
                    ${themeConfig.isEyeCareMode ? 'left-7' : 'left-1'}
                  `}
                />
              </button>
            </div>
          </div>

          {/* 主题展示 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="font-semibold text-gray-800">当前主题</div>
                <div className="text-sm text-gray-500">马卡龙色系</div>
              </div>
              <div className="flex gap-2">
                <div className="w-6 h-6 rounded-full bg-pink-300" />
                <div className="w-6 h-6 rounded-full bg-purple-300" />
                <div className="w-6 h-6 rounded-full bg-yellow-300" />
              </div>
            </div>
          </div>

          {/* 版本信息 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 shadow-xl mb-8">
            <div className="text-sm text-gray-600 space-y-2">
              <p>🍓 甜趣点点消 v1.0.0</p>
              <p>🎀 治愈系三消游戏</p>
              <p>💝 用心打造每一个细节</p>
              <p className="text-purple-400 mt-2">✨ 柔和音效 · 温柔震动 · 护眼配色</p>
            </div>
          </div>

          <div className="flex flex-col gap-3">
            <Button 
              onClick={resetProgress}
              className="bg-red-200 hover:bg-red-300 text-red-600 px-6 py-3 rounded-full"
            >
              🗑️ 重置游戏进度
            </Button>
            
            <Button 
              onClick={() => {
                SoundManager.playClick();
                navigate('/');
              }}
              className="bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-white px-6 py-3 rounded-full"
            >
              ← 返回首页
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}