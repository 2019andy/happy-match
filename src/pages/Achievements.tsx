import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { StorageSystem } from '../game/utils/StorageSystem';
import { Achievement, UserData } from '../game/types';

export function Achievements() {
  const navigate = useNavigate();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);

  useEffect(() => {
    const data = StorageSystem.getUserData();
    setUserData(data);
    setAchievements(data.achievements);
  }, []);

  const unlockedCount = achievements.filter(a => a.unlocked).length;
  const totalCount = achievements.length;

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
          <h1 className="text-3xl font-bold text-pink-400">🏆 成就</h1>
          <div className="w-20"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 mb-6 shadow-xl">
          <div className="text-center">
            <div className="text-5xl mb-2">
              {unlockedCount === totalCount ? '🎉' : '🎯'}
            </div>
            <div className="text-2xl font-bold text-gray-700 mb-1">
              {unlockedCount} / {totalCount}
            </div>
            <div className="text-gray-500">
              已解锁成就
            </div>
            <div className="mt-4 h-3 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full transition-all duration-300"
                style={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {achievements.map((achievement, index) => (
            <div
              key={achievement.id}
              className={`
                relative p-5 rounded-2xl shadow-md transition-all
                ${achievement.unlocked 
                  ? 'bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-200' 
                  : 'bg-gray-100 opacity-60'
                }
              `}
              style={{
                animationDelay: `${index * 0.1}s`,
                animation: 'fadeInUp 0.5s ease forwards',
                opacity: 0
              }}
            >
              <div className="flex items-start gap-4">
                <div className={`
                  text-4xl
                  ${achievement.unlocked ? '' : 'grayscale'}
                `}>
                  {achievement.icon}
                </div>
                <div className="flex-1">
                  <div className={`
                    font-bold text-lg mb-1
                    ${achievement.unlocked ? 'text-gray-800' : 'text-gray-400'}
                  `}>
                    {achievement.name}
                  </div>
                  <div className={`
                    text-sm
                    ${achievement.unlocked ? 'text-gray-600' : 'text-gray-400'}
                  `}>
                    {achievement.description}
                  </div>
                </div>
                {achievement.unlocked && (
                  <div className="text-2xl text-green-500">✅</div>
                )}
              </div>
            </div>
          ))}
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(20px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}</style>
      </div>
    </div>
  );
}