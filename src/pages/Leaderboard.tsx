import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { StorageSystem } from '../game/utils/StorageSystem';
import { LeaderboardEntry, UserData } from '../game/types';

export function Leaderboard() {
  const navigate = useNavigate();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [userRank, setUserRank] = useState<number>(0);

  useEffect(() => {
    const data = StorageSystem.getUserData();
    setUserData(data);
    
    const entries = StorageSystem.getLeaderboard();
    setLeaderboard(entries);
    
    const userEntry = entries.find(e => e.id === data.id);
    if (userEntry) {
      setUserRank(userEntry.rank);
    } else if (data.totalScore > 0) {
      setUserRank(entries.length + 1);
    }
  }, []);

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'text-yellow-500';
      case 2: return 'text-gray-400';
      case 3: return 'text-orange-600';
      default: return 'text-gray-600';
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return rank;
    }
  };

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
          <h1 className="text-3xl font-bold text-pink-400">🏆 排行榜</h1>
          <div className="w-20"></div>
        </div>

        {userData && (
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 mb-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className={`text-3xl font-bold ${getRankColor(userRank)}`}>
                  {getRankIcon(userRank)}
                </div>
                <div>
                  <div className="font-bold text-lg text-gray-800">
                    {userData.nickname}
                  </div>
                  <div className="text-sm text-gray-500">我的排名</div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-xl text-yellow-600">
                  {userData.totalScore}
                </div>
                <div className="text-sm text-gray-500">总分</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-xl">
          <div className="space-y-3">
            {leaderboard.map((entry, index) => (
              <div
                key={entry.id}
                className={`
                  flex items-center justify-between p-4 rounded-xl transition-all
                  ${userData?.id === entry.id 
                    ? 'bg-gradient-to-r from-yellow-100 to-orange-100 border-2 border-yellow-300' 
                    : 'bg-gray-50 hover:bg-gray-100'
                  }
                `}
                style={{
                  animationDelay: `${index * 0.05}s`,
                  animation: 'fadeInUp 0.4s ease forwards',
                  opacity: 0
                }}
              >
                <div className="flex items-center gap-4">
                  <div className={`text-2xl font-bold ${getRankColor(entry.rank)}`}>
                    {getRankIcon(entry.rank)}
                  </div>
                  <div className="w-10 h-10 bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center text-xl">
                    {entry.avatar || '👤'}
                  </div>
                  <div>
                    <div className="font-bold text-gray-800">
                      {entry.nickname}
                    </div>
                    {userData?.id === entry.id && (
                      <div className="text-xs text-yellow-600">就是你！</div>
                    )}
                  </div>
                </div>
                <div className="font-bold text-lg text-yellow-600">
                  {entry.score.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        <style>{`
          @keyframes fadeInUp {
            from {
              opacity: 0;
              transform: translateY(15px);
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