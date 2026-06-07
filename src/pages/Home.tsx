import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { HomeBannerAd } from '../components/BannerAd';
import { StorageSystem } from '../game/utils/StorageSystem';
import { EnergySystem } from '../game/systems/EnergySystem';
import { SoundManager } from '../game/utils/SoundManager';
import { cloudSyncService } from '../game/utils/CloudSyncService';
import { UserData } from '../game/types';

export function Home() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [energy, setEnergy] = useState(30);
  const [maxEnergy, setMaxEnergy] = useState(30);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const data = StorageSystem.getUserData();
    setUserData(data);
    
    const energySystem = new EnergySystem();
    setEnergy(energySystem.getEnergy());
    setMaxEnergy(energySystem.getMaxEnergy());
    
    setIsLoggedIn(cloudSyncService.isLoggedIn());
  }, []);

  const handleDailySignIn = () => {
    SoundManager.playClick();
    const { signedIn, consecutiveDays } = StorageSystem.checkDailySignIn();
    if (signedIn) {
      const energySystem = new EnergySystem();
      const bonusEnergy = Math.min(5, maxEnergy - energy);
      energySystem.addEnergy(bonusEnergy);
      setEnergy(energySystem.getEnergy());
      SoundManager.playWin();
      alert(`签到成功!连续签到${consecutiveDays}天，获得${bonusEnergy}点体力奖励!`);
      
      const newUserData = StorageSystem.getUserData();
      setUserData(newUserData);
    } else {
      alert('今天已经签到过啦，明天再来吧~');
    }
  };

  const handleStartGame = () => {
    SoundManager.playClick();
    if (energy >= 5) {
      navigate(`/game/${userData?.currentLevel || 1}`);
    } else {
      alert('体力不足，请先补充体力~');
    }
  };

  const handleLevelSelect = () => {
    SoundManager.playClick();
    navigate('/level-select');
  };

  const handleAchievements = () => {
    SoundManager.playClick();
    navigate('/achievements');
  };

  const handleShop = () => {
    SoundManager.playClick();
    navigate('/shop');
  };

  const handleLeaderboard = () => {
    SoundManager.playClick();
    navigate('/leaderboard');
  };

  const handleDailyChallenge = () => {
    SoundManager.playClick();
    navigate('/daily-challenge');
  };

  const handleSettings = () => {
    SoundManager.playClick();
    navigate('/settings');
  };

  if (!userData) return null;

  const unlockedAchievements = userData.achievements.filter(a => a.unlocked).length;
  const totalAchievements = userData.achievements.length;
  const hasDailyChallenge = userData.dailyChallenge && !userData.dailyChallenge.completed;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center">
          <div className="text-center mb-8">
            <div className="flex justify-center gap-3 mb-4">
              <span className="text-5xl animate-bounce">🍓</span>
              <span className="text-5xl animate-bounce delay-100">🍦</span>
              <span className="text-5xl animate-bounce delay-200">🌸</span>
              <span className="text-5xl animate-bounce delay-300">🎀</span>
              <span className="text-5xl animate-bounce delay-400">💎</span>
              <span className="text-5xl animate-bounce delay-500">🍬</span>
            </div>
            <h1 className="text-5xl font-bold bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-3">
              甜趣点点消
            </h1>
            <p className="text-xl text-purple-300">
              甜蜜消除，快乐加倍
            </p>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-6 mb-8 shadow-xl">
            <div className="flex items-center gap-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-pink-200 to-purple-200 flex items-center justify-center">
                <span className="text-3xl">👧</span>
              </div>
              <div className="flex-1">
                <div className="text-lg font-semibold text-gray-800">{userData.nickname}</div>
                <div className="text-sm text-gray-500">关卡 {userData.currentLevel}</div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-yellow-500">{userData.coins} 💰</div>
                <div className="text-lg font-bold text-purple-500">{userData.diamonds} 💎</div>
              </div>
            </div>
          </div>

          <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-4 mb-8 shadow-xl w-full max-w-md">
            <div className="flex items-center justify-between mb-2">
              <span className="text-gray-600">💖 体力</span>
              <span className="text-sm text-gray-500">{energy} / {maxEnergy}</span>
            </div>
            <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-pink-300 to-pink-500 rounded-full transition-all duration-500"
                style={{ width: `${(energy / maxEnergy) * 100}%` }}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 w-full max-w-md mb-6">
            <Button 
              onClick={handleAchievements}
              className="bg-gradient-to-r from-yellow-200 to-orange-200 hover:from-yellow-300 hover:to-orange-300 text-gray-800 text-lg px-4 py-3 rounded-xl shadow-md transform hover:scale-105 transition-all font-semibold relative"
            >
              🏆 成就
              {unlockedAchievements > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                  {unlockedAchievements}
                </span>
              )}
            </Button>
            
            <Button 
              onClick={handleShop}
              className="bg-gradient-to-r from-purple-200 to-pink-200 hover:from-purple-300 hover:to-pink-300 text-gray-800 text-lg px-4 py-3 rounded-xl shadow-md transform hover:scale-105 transition-all font-semibold"
            >
              🏪 商店
            </Button>
            
            <Button 
              onClick={handleLeaderboard}
              className="bg-gradient-to-r from-blue-200 to-cyan-200 hover:from-blue-300 hover:to-cyan-300 text-gray-800 text-lg px-4 py-3 rounded-xl shadow-md transform hover:scale-105 transition-all font-semibold"
            >
              📊 排行榜
            </Button>
            
            <Button 
              onClick={handleDailyChallenge}
              className="bg-gradient-to-r from-green-200 to-teal-200 hover:from-green-300 hover:to-teal-300 text-gray-800 text-lg px-4 py-3 rounded-xl shadow-md transform hover:scale-105 transition-all font-semibold relative"
            >
              🎯 每日挑战
              {hasDailyChallenge && (
                <span className="absolute -top-2 -right-2 w-3 h-3 bg-red-500 rounded-full animate-pulse"></span>
              )}
            </Button>
          </div>

          <div className="flex flex-col gap-4 w-full max-w-md mb-6">
            <Button 
              onClick={handleStartGame}
              className="bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white text-xl px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-semibold"
            >
              🎮 开始闯关
            </Button>
            
            <Button 
              onClick={handleLevelSelect}
              className="bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-white text-xl px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-semibold"
            >
              📋 关卡选择
            </Button>
            
            <Button 
              onClick={handleDailySignIn}
              className="bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 text-white text-xl px-8 py-4 rounded-full shadow-lg transform hover:scale-105 transition-all font-semibold"
            >
              📅 每日签到
            </Button>
          </div>

          <div className="mt-8 grid grid-cols-4 gap-3 w-full max-w-md">
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-md text-center">
              <div className="text-2xl mb-1">⭐</div>
              <div className="text-xs text-gray-500">总星星</div>
              <div className="text-lg font-bold text-yellow-500">{userData.totalStars}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-md text-center">
              <div className="text-2xl mb-1">🎯</div>
              <div className="text-xs text-gray-500">通关数</div>
              <div className="text-lg font-bold text-pink-500">{userData.completedLevels.length}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-md text-center">
              <div className="text-2xl mb-1">🏆</div>
              <div className="text-xs text-gray-500">成就</div>
              <div className="text-lg font-bold text-orange-500">{unlockedAchievements}/{totalAchievements}</div>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-xl p-3 shadow-md text-center">
              <div className="text-2xl mb-1">📈</div>
              <div className="text-xs text-gray-500">总游戏</div>
              <div className="text-lg font-bold text-purple-500">{userData.totalPlays}</div>
            </div>
          </div>

          <div className="mt-8 text-center flex justify-center gap-4">
            <Button 
              onClick={handleSettings}
              className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-6 py-2 rounded-full"
            >
              ⚙️ 设置
            </Button>
            {!isLoggedIn && (
              <Button 
                onClick={() => {
                  SoundManager.playClick();
                  navigate('/login');
                }}
                className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-full"
              >
                🔐 登录
              </Button>
            )}
          </div>
        </div>
      </div>
      <HomeBannerAd />
    </div>
  );
}