import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';
import { Button } from '../components/Button';
import { Game as GameLogic } from '../game/Game';
import { TileType, ObstacleType, PowerUpType } from '../game/types';
import { GameConfig } from '../game/config/GameConfig';
import { StorageSystem } from '../game/utils/StorageSystem';
import { SoundManager } from '../game/utils/SoundManager';

const TILE_ICONS: Record<TileType, string> = {
  [TileType.STRAWBERRY]: '🍓',
  [TileType.CREAM]: '🍦',
  [TileType.DAISY]: '🌸',
  [TileType.BOW]: '🎀',
  [TileType.PEARL]: '💎',
  [TileType.CANDY]: '🍬'
};

const OBSTACLE_ICONS: Record<ObstacleType, string> = {
  [ObstacleType.FROST]: '❄️',
  [ObstacleType.VINE]: '🌿',
  [ObstacleType.GIFT]: '🎁',
  [ObstacleType.BUBBLE]: '🫧'
};

const POWERUP_OVERLAYS: Record<PowerUpType, string> = {
  [PowerUpType.SWEET_RAY_H]: '➡️',
  [PowerUpType.SWEET_RAY_V]: '⬇️',
  [PowerUpType.FLOWER_BOMB]: '💥',
  [PowerUpType.RAINBOW_CANDY]: '🌈'
};

export function Game() {
  const { levelId } = useParams();
  const navigate = useNavigate();
  const [game, setGame] = useState<GameLogic | null>(null);
  const [selectedTile, setSelectedTile] = useState<{ x: number; y: number } | null>(null);
  const [gameState, setGameState] = useState({ score: 0, moves: 30, targetScore: 1000 });
  const [canUndo, setCanUndo] = useState(false);
  const [showWinModal, setShowWinModal] = useState(false);
  const [showLoseModal, setShowLoseModal] = useState(false);
  const [stars, setStars] = useState(0);
  const [comboLevel, setComboLevel] = useState(0);
  const [showComboAnimation, setShowComboAnimation] = useState(false);
  const [powerUpEffect, setPowerUpEffect] = useState<{ type: string; x: number; y: number } | null>(null);
  const [energyState, setEnergyState] = useState({ current: 30, max: 30, spent: 0 });

  useEffect(() => {
    const levelNum = levelId ? parseInt(levelId) : 1;
    const newGame = new GameLogic(levelNum);
    
    // 初始化体力状态
    const initialMax = newGame.getMaxEnergy();
    const initialCurrent = newGame.getEnergy();
    setEnergyState({
      current: initialCurrent,
      max: initialMax,
      spent: initialMax - initialCurrent
    });
    
    const canStart = newGame.consumeEnergy();
    if (!canStart) {
      alert('体力不足，请先补充体力~');
      navigate('/');
      return;
    }

    setGame(newGame);
    setGameState({
      score: newGame.getGameState().score,
      moves: newGame.getGameState().moves,
      targetScore: newGame.getLevelConfig().targetScore
    });
    
    // 更新消费后的体力状态
    const afterConsume = newGame.getEnergy();
    setEnergyState(prev => ({
      ...prev,
      current: afterConsume,
      spent: prev.max - afterConsume
    }));

    newGame.on('score_update', (score: number) => {
      setGameState(prev => ({ ...prev, score }));
    });

    newGame.on('moves_update', (moves: number) => {
      setGameState(prev => ({ ...prev, moves }));
    });

    newGame.on('match_found', () => {
      SoundManager.playMatch();
      setComboLevel(prev => {
        const newLevel = prev + 1;
        if (newLevel > 1) {
          setShowComboAnimation(true);
          setTimeout(() => setShowComboAnimation(false), 500);
        }
        return newLevel;
      });
    });

    newGame.on('chain_reaction', () => {
      if (comboLevel > 1) {
        SoundManager.playCombo(comboLevel);
        setShowComboAnimation(true);
        setTimeout(() => setShowComboAnimation(false), 500);
      }
    });

    newGame.on('powerup_activated', (type: string, x: number, y: number) => {
      SoundManager.playPowerUp();
      setPowerUpEffect({ type, x, y });
      setTimeout(() => setPowerUpEffect(null), 800);
    });

    newGame.on('game_win', (finalScore: number) => {
      SoundManager.resetCombo();
      SoundManager.playWin();
      const ratio = finalScore / newGame.getLevelConfig().targetScore;
      let earnedStars = 1;
      if (ratio >= 2) earnedStars = 3;
      else if (ratio >= 1.5) earnedStars = 2;
      setStars(earnedStars);
      setShowWinModal(true);
    });

    newGame.on('game_lose', () => {
      SoundManager.resetCombo();
      SoundManager.playLose();
      setShowLoseModal(true);
    });

    return () => {
      newGame.off('score_update', () => {});
      newGame.off('moves_update', () => {});
      newGame.off('match_found', () => {});
      newGame.off('chain_reaction', () => {});
      newGame.off('powerup_activated', () => {});
      newGame.off('game_win', () => {});
      newGame.off('game_lose', () => {});
    };
  }, [levelId, navigate]);

  const handleTileClick = useCallback((x: number, y: number) => {
    if (!game || !game.getGameState().isPlaying) return;

    SoundManager.playClick();

    if (!selectedTile) {
      setSelectedTile({ x, y });
    } else if (selectedTile.x === x && selectedTile.y === y) {
      setSelectedTile(null);
    } else {
      const swapped = game.swapTiles(selectedTile.x, selectedTile.y, x, y);
      if (swapped) {
        setSelectedTile(null);
        SoundManager.resetCombo();
        setComboLevel(0);
        setTimeout(() => {
          setCanUndo(game?.canUndoAction() || false);
        }, 300);
      } else {
        setSelectedTile({ x, y });
      }
    }
  }, [game, selectedTile]);

  const handleUndo = useCallback(() => {
    if (game && game.canUndoAction()) {
      SoundManager.playClick();
      game.undo();
      setCanUndo(false);
      setGameState({
        score: game.getGameState().score,
        moves: game.getGameState().moves,
        targetScore: game.getLevelConfig().targetScore
      });
    }
  }, [game]);

  const handleRetry = useCallback(() => {
    setShowLoseModal(false);
    SoundManager.playClick();
    const levelNum = levelId ? parseInt(levelId) : 1;
    const newGame = new GameLogic(levelNum);
    newGame.consumeEnergy();
    setGame(newGame);
    setSelectedTile(null);
    setCanUndo(false);
    setComboLevel(0);
    setGameState({
      score: newGame.getGameState().score,
      moves: newGame.getGameState().moves,
      targetScore: newGame.getLevelConfig().targetScore
    });
  }, [levelId]);

  const handleNextLevel = useCallback(() => {
    setShowWinModal(false);
    SoundManager.playClick();
    const currentLevel = levelId ? parseInt(levelId) : 1;
    const nextLevel = currentLevel + 1;
    navigate(`/game/${nextLevel}`);
  }, [levelId, navigate]);

  const handleBackToHome = useCallback(() => {
    SoundManager.playClick();
    navigate('/');
  }, [navigate]);

  const handleLevelSelect = useCallback(() => {
    SoundManager.playClick();
    navigate('/level-select');
  }, [navigate]);

  const renderTile = (tile: any, x: number, y: number) => {
    if (!tile) return null;

    const isSelected = selectedTile?.x === x && selectedTile?.y === y;
    const isObstacle = tile.isObstacle;
    const isPowerUp = tile.isPowerUp;

    let icon = '';
    let bgColor = 'bg-white';
    
    if (isObstacle && tile.obstacleType) {
      icon = OBSTACLE_ICONS[tile.obstacleType] || '❓';
      bgColor = 'bg-gray-100';
    } else if (tile.type) {
      icon = TILE_ICONS[tile.type] || '❓';
      bgColor = 'bg-white';
    }

    return (
      <button
        key={`${x}-${y}`}
        onClick={() => !isObstacle && handleTileClick(x, y)}
        disabled={isObstacle || !game?.getGameState().isPlaying}
        className={`
          relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl flex items-center justify-center text-2xl sm:text-3xl
          transition-all duration-200 shadow-md
          ${isSelected ? 'ring-4 ring-pink-400 scale-110 z-10 shadow-lg' : ''}
          ${isObstacle ? 'cursor-not-allowed opacity-70' : 'cursor-pointer hover:scale-105 hover:shadow-lg'}
          ${isPowerUp ? 'animate-pulse shadow-lg' : ''}
          ${bgColor}
        `}
      >
        <span className={isPowerUp ? 'drop-shadow-lg' : ''}>{icon}</span>
        {isPowerUp && tile.powerUpType && (
          <span className="absolute -top-1 -right-1 text-xs opacity-80 drop-shadow-md">
            {POWERUP_OVERLAYS[tile.powerUpType]}
          </span>
        )}
      </button>
    );
  };

  const progressPercentage = Math.min(100, (gameState.score / gameState.targetScore) * 100);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 via-white to-purple-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between mb-4">
          <Button 
            onClick={handleBackToHome}
            className="bg-white/80 hover:bg-white text-gray-700 px-4 py-2 rounded-full shadow-md transition-all"
          >
            ← 返回
          </Button>
          <div className="text-center">
            <div className="text-lg font-bold text-pink-400">第 {levelId} 关</div>
            {showComboAnimation && comboLevel > 1 && (
              <div className="text-sm text-yellow-500 animate-bounce">
                🔥 连击 x{comboLevel}!
              </div>
            )}
          </div>
          <div className="w-20"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-500">⭐</span>
              <span className="font-bold text-gray-700">{gameState.score}</span>
              <span className="text-gray-400">/ {gameState.targetScore}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-blue-500">👣</span>
              <span className="font-bold text-gray-700">{gameState.moves}</span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-yellow-300 to-orange-300 rounded-full transition-all duration-300"
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-4 shadow-xl">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-2">
              <span className="text-pink-400">💖</span>
              <span className="font-bold text-gray-700">已消耗</span>
              <span className="text-gray-400">
                {energyState.spent} / {energyState.max}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-500">
                {energyState.current}</span>
              <span className="font-bold text-gray-700">剩余</span>
            </div>
          </div>
          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-pink-300 to-rose-400 rounded-full transition-all duration-300"
              style={{ width: `${(energyState.spent / energyState.max) * 100}%` }}
            />
          </div>
        </div>

        <div className="flex justify-center mb-4">
          <div className="relative bg-white/60 backdrop-blur-sm rounded-2xl p-4 shadow-lg">
            <div className="grid gap-1" style={{ gridTemplateColumns: `repeat(${GameConfig.BOARD_WIDTH}, 1fr)` }}>
              {game?.getBoard().getGrid().map((row, y) =>
                row.map((tile, x) => renderTile(tile, x, y))
              )}
            </div>
            
            {powerUpEffect && (
              <div 
                className="absolute inset-0 flex items-center justify-center pointer-events-none"
              >
                <div className={`
                  text-6xl animate-ping
                  ${powerUpEffect.type === 'sweet_ray' ? 'text-cyan-400' : ''}
                  ${powerUpEffect.type === 'flower_bomb' ? 'text-pink-400' : ''}
                  ${powerUpEffect.type === 'rainbow_candy' ? 'text-yellow-400' : ''}
                `}>
                  {powerUpEffect.type === 'sweet_ray' && '✨'}
                  {powerUpEffect.type === 'flower_bomb' && '🌸'}
                  {powerUpEffect.type === 'rainbow_candy' && '🌈'}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="flex justify-center gap-4">
          <Button
            onClick={handleUndo}
            disabled={!canUndo}
            className={`
              px-6 py-3 rounded-full font-semibold transition-all
              ${canUndo 
                ? 'bg-gradient-to-r from-purple-300 to-purple-400 hover:from-purple-400 hover:to-purple-500 text-white shadow-lg transform hover:scale-105' 
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
              }
            `}
          >
            ↩️ 撤回
          </Button>
          <Button
            onClick={handleLevelSelect}
            className="bg-white hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full font-semibold shadow-md transition-all transform hover:scale-105"
          >
            📋 选关
          </Button>
        </div>

        <div className="mt-6 text-center">
          <div className="inline-flex items-center gap-4 text-sm text-gray-500">
            <span>🍓草莓</span>
            <span>🍦奶油</span>
            <span>🌸雏菊</span>
            <span>🎀蝴蝶结</span>
            <span>💎珍珠</span>
            <span>🍬糖果</span>
          </div>
        </div>
      </div>

      {showWinModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform animate-scaleIn">
            <div className="text-6xl mb-4 animate-bounce">🎉</div>
            <h2 className="text-2xl font-bold text-pink-400 mb-2">恭喜通关!</h2>
            <div className="flex justify-center gap-1 mb-4">
              {[...Array(3)].map((_, i) => (
                <span 
                  key={i} 
                  className={`text-3xl ${i < stars ? 'animate-popIn' : 'opacity-30'}`}
                  style={{ animationDelay: `${i * 0.2}s` }}
                >⭐</span>
              ))}
            </div>
            <div className="text-gray-600 mb-6">
              <p>得分: <span className="font-bold text-yellow-500">{gameState.score}</span></p>
              <p>剩余步数奖励: <span className="font-bold text-blue-500">+{gameState.moves * 300}</span></p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleNextLevel}
                className="bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all"
              >
                下一关 →
              </Button>
              <Button
                onClick={handleBackToHome}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold transition-all"
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      )}

      {showLoseModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl p-8 max-w-sm w-full text-center shadow-2xl transform animate-scaleIn">
            <div className="text-6xl mb-4">😢</div>
            <h2 className="text-2xl font-bold text-gray-600 mb-2">步数用完了</h2>
            <p className="text-gray-500 mb-6">别灰心，再试一次吧~</p>
            <div className="text-gray-600 mb-6">
              <p>当前得分: <span className="font-bold text-yellow-500">{gameState.score}</span></p>
              <p>目标分数: <span className="font-bold text-gray-700">{gameState.targetScore}</span></p>
            </div>
            <div className="flex flex-col gap-3">
              <Button
                onClick={handleRetry}
                className="bg-gradient-to-r from-pink-300 to-pink-400 hover:from-pink-400 hover:to-pink-500 text-white px-8 py-3 rounded-full font-semibold shadow-lg transform hover:scale-105 transition-all"
              >
                🔄 再来一次
              </Button>
              <Button
                onClick={handleBackToHome}
                className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-8 py-3 rounded-full font-semibold transition-all"
              >
                返回首页
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}