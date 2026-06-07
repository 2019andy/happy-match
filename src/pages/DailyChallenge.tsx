import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { StorageSystem } from '../game/utils/StorageSystem';
import { DailyChallenge as DailyChallengeType, UserData } from '../game/types';
import { SoundManager } from '../game/utils/SoundManager';

export function DailyChallengePage() {
  const navigate = useNavigate();
  const [challenge, setChallenge] = useState<DailyChallengeType | null>(null);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showClaim, setShowClaim] = useState(false);

  useEffect(() => {
    const data = StorageSystem.getUserData();
    setUserData(data);
    
    if (data.dailyChallenge) {
      const today = new Date().toDateString();
      if (data.dailyChallenge.date !== today) {
        data.dailyChallenge = StorageSystem.generateDailyChallenge();
        StorageSystem.saveUserData(data);
      }
      setChallenge(data.dailyChallenge);
    }
  }, []);

  const getChallengeIcon = (type: string) => {
    switch (type) {
      case 'score': return '⭐';
      case 'stars': return '🌟';
      case 'levels': return '🎯';
      default: return '📋';
    }
  };

  const getChallengeTitle = (type: string) => {
    switch (type) {
      case 'score': return '得分挑战';
      case 'stars': return '星星收集';
      case 'levels': return '关卡通关';
      default: return '每日挑战';
    }
  };

  const getChallengeDescription = (type: string, target: number) => {
    switch (type) {
      case 'score': return `今日获得 ${target} 分`;
      case 'stars': return `今日收集 ${target} 颗星星`;
      case 'levels': return `今日通关 ${target} 个关卡`;
      default: return '完成每日挑战';
    }
  };

  const handleClaimReward = () => {
    if (!userData || !challenge) return;

    const newUserData = { ...userData };
    newUserData.coins += challenge.reward.coins;
    newUserData.diamonds += challenge.reward.diamonds;
    
    StorageSystem.saveUserData(newUserData);
    setUserData(newUserData);
    setShowClaim(false);
    SoundManager.playWin();
  };

  const progress = challenge ? Math.min(100, (challenge.progress / challenge.target) * 100) : 0;

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <Button 
            onClick={() => navigate('/')}
            className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-full shadow-md"
          >
            ← 返回
          </Button>
          <h1 className="text-3xl font-bold text-pink-400">🎯 每日挑战</h1>
          <div className="w-20"></div>
        </div>

        {challenge && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
            <div className="text-center mb-6">
              <div className="text-6xl mb-3">{getChallengeIcon(challenge.type)}</div>
              <h2 className="text-2xl font-bold text-gray-800 mb-1">
                {getChallengeTitle(challenge.type)}
              </h2>
              <p className="text-gray-500">
                {getChallengeDescription(challenge.type, challenge.target)}
              </p>
            </div>

            <div className="bg-gray-100 rounded-xl p-4 mb-4">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-gray-700">当前进度</span>
                <span className="font-bold text-pink-500">
                  {challenge.progress} / {challenge.target}
                </span>
              </div>
              <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-pink-400 to-purple-400 rounded-full transition-all duration-500"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="bg-yellow-50 rounded-xl p-4">
              <h3 className="font-bold text-lg text-gray-800 mb-3">🎁 奖励</h3>
              <div className="flex justify-around">
                <div className="text-center">
                  <div className="text-3xl mb-1">💰</div>
                  <div className="font-bold text-yellow-600">+{challenge.reward.coins}</div>
                  <div className="text-sm text-gray-500">金币</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">💎</div>
                  <div className="font-bold text-purple-600">+{challenge.reward.diamonds}</div>
                  <div className="text-sm text-gray-500">钻石</div>
                </div>
              </div>
            </div>

            {challenge.completed ? (
              <div className="mt-4 text-center p-4 bg-green-50 rounded-xl">
                <div className="text-2xl mb-2">✅</div>
                <div className="font-bold text-green-600">挑战已完成！</div>
              </div>
            ) : (
              <div className="mt-4 text-center text-gray-500">
                继续加油完成挑战吧！
              </div>
            )}
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-lg text-gray-800 mb-4">💡 小贴士</h3>
          <ul className="space-y-2 text-gray-600">
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              <span>每日0点刷新新挑战</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              <span>完成挑战后记得领取奖励</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-pink-400">•</span>
              <span>奖励可以在商店购买道具</span>
            </li>
          </ul>
        </div>

        {showClaim && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 text-center shadow-2xl animate-scaleIn">
              <div className="text-6xl mb-4">🎊</div>
              <h3 className="text-2xl font-bold text-gray-800 mb-2">恭喜完成挑战！</h3>
              <div className="flex justify-around mb-6">
                <div className="text-center">
                  <div className="text-3xl mb-1">💰</div>
                  <div className="font-bold text-yellow-600">+{challenge?.reward.coins}</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl mb-1">💎</div>
                  <div className="font-bold text-purple-600">+{challenge?.reward.diamonds}</div>
                </div>
              </div>
              <Button
                onClick={handleClaimReward}
                className="bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white px-8 py-3 rounded-full font-bold"
              >
                领取奖励
              </Button>
            </div>
          </div>
        )}

        <style>{`
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.9);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}