import { useNavigate } from 'react-router-dom';
import { Button } from '../components/Button';
import { StorageSystem } from '../game/utils/StorageSystem';
import { SoundManager } from '../game/utils/SoundManager';

export function LevelSelect() {
  const navigate = useNavigate();
  const userData = StorageSystem.getUserData();
  const currentLevel = userData.currentLevel;

  const levels = Array.from({ length: 50 }, (_, i) => {
    const levelId = i + 1;
    const isCompleted = userData.completedLevels.includes(levelId);
    const failedAttempts = userData.failedAttempts[levelId] || 0;
    
    let stars = 0;
    if (isCompleted) {
      stars = Math.min(3, Math.max(1, 3 - Math.floor(failedAttempts / 2)));
    }
    
    return {
      id: levelId,
      isCompleted,
      stars,
      isLocked: levelId > currentLevel
    };
  });

  const handleLevelClick = (levelId: number) => {
    SoundManager.playClick();
    if (levelId <= currentLevel) {
      navigate(`/game/${levelId}`);
    }
  };

  const handleBack = () => {
    SoundManager.playClick();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent mb-2">
            关卡选择
          </h1>
          <p className="text-lg text-purple-300">
            当前关卡: {currentLevel}
          </p>
        </div>

        <div className="grid grid-cols-5 gap-3 max-w-2xl mx-auto">
          {levels.map((level) => (
            <div
              key={level.id}
              onClick={() => handleLevelClick(level.id)}
              className={`
                relative flex flex-col items-center justify-center w-16 h-16 rounded-full cursor-pointer transition-all
                ${level.isLocked
                  ? 'bg-gray-200 text-gray-400'
                  : level.isCompleted
                    ? 'bg-gradient-to-br from-green-200 to-green-300 text-white shadow-md'
                    : level.id === currentLevel
                      ? 'bg-gradient-to-br from-pink-300 to-pink-400 text-white shadow-lg animate-pulse'
                      : 'bg-gradient-to-br from-purple-200 to-purple-300 text-white shadow-md hover:shadow-lg transform hover:scale-105'
                }
              `}
            >
              {level.isLocked ? (
                <span className="text-xl">🔒</span>
              ) : (
                <span className="text-xl font-bold">{level.id}</span>
              )}
              
              {level.isCompleted && (
                <div className="absolute -bottom-1 text-yellow-400 text-xs flex gap-0.5">
                  {[...Array(3)].map((_, i) => (
                    <span key={i} className={i < level.stars ? '' : 'opacity-30'}>⭐</span>
                  ))}
                </div>
              )}
              
              {level.id === currentLevel && !level.isLocked && (
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 rounded-full flex items-center justify-center">
                  <span className="text-xs">▶</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="text-center mt-8">
          <Button 
            onClick={handleBack}
            className="bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-white text-lg px-8 py-3 rounded-full shadow-lg"
          >
            ← 返回首页
          </Button>
        </div>
      </div>
    </div>
  );
}