import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Button } from '../components/Button';
import { StorageSystem } from '../game/utils/StorageSystem';
import { ShopItem, UserData } from '../game/types';
import { SoundManager } from '../game/utils/SoundManager';

export function Shop() {
  const navigate = useNavigate();
  const [shopItems, setShopItems] = useState<ShopItem[]>([]);
  const [userData, setUserData] = useState<UserData | null>(null);
  const [showMessage, setShowMessage] = useState<string | null>(null);

  useEffect(() => {
    const data = StorageSystem.getUserData();
    setUserData(data);
    setShopItems(StorageSystem.getShopItems());
  }, []);

  const handlePurchase = (item: ShopItem) => {
    if (!userData) return;

    const canAfford = item.currency === 'coins' 
      ? userData.coins >= item.price
      : userData.diamonds >= item.price;

    if (!canAfford) {
      setShowMessage('金币/钻石不足！');
      setTimeout(() => setShowMessage(null), 2000);
      return;
    }

    const newUserData = { ...userData };
    
    if (item.currency === 'coins') {
      newUserData.coins -= item.price;
    } else {
      newUserData.diamonds -= item.price;
    }

    switch (item.type) {
      case 'powerup':
        if (item.id === 'extra_moves') {
          newUserData.powerups.moves += item.amount || 0;
        } else if (item.id === 'refresh') {
          newUserData.powerups.refresh += item.amount || 0;
        } else if (item.id === 'hammer') {
          newUserData.powerups.hammer += item.amount || 0;
        }
        break;
      case 'energy':
        newUserData.energy = Math.min(newUserData.maxEnergy, newUserData.energy + (item.amount || 0));
        break;
    }

    StorageSystem.saveUserData(newUserData);
    setUserData(newUserData);
    setShowMessage(`购买成功！获得 ${item.name}`);
    SoundManager.playClick();
    setTimeout(() => setShowMessage(null), 2000);
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
          <h1 className="text-3xl font-bold text-pink-400">🏪 商店</h1>
          <div className="w-20"></div>
        </div>

        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-4 mb-6 shadow-xl">
          <div className="flex justify-around">
            <div className="flex items-center gap-2">
              <span className="text-2xl">💰</span>
              <span className="font-bold text-yellow-600 text-xl">
                {userData?.coins || 0}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">💎</span>
              <span className="font-bold text-purple-600 text-xl">
                {userData?.diamonds || 0}
              </span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {shopItems.map((item, index) => {
            const canAfford = item.currency === 'coins'
              ? (userData?.coins || 0) >= item.price
              : (userData?.diamonds || 0) >= item.price;

            return (
              <div
                key={item.id}
                className="bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-md"
                style={{
                  animationDelay: `${index * 0.1}s`,
                  animation: 'fadeInUp 0.5s ease forwards',
                  opacity: 0
                }}
              >
                <div className="flex items-start gap-4">
                  <div className="text-4xl">{item.icon}</div>
                  <div className="flex-1">
                    <div className="font-bold text-lg text-gray-800 mb-1">
                      {item.name}
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      {item.description}
                    </div>
                    <Button
                      onClick={() => handlePurchase(item)}
                      disabled={!canAfford}
                      className={`
                        px-4 py-2 rounded-full font-bold transition-all
                        ${canAfford
                          ? 'bg-gradient-to-r from-yellow-300 to-orange-300 hover:from-yellow-400 hover:to-orange-400 text-white'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                        }
                      `}
                    >
                      {item.currency === 'coins' ? '💰' : '💎'} {item.price}
                    </Button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-8 bg-white/80 backdrop-blur-sm rounded-2xl p-5 shadow-xl">
          <h3 className="font-bold text-lg text-gray-800 mb-4">📦 我的道具</h3>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center p-4 bg-pink-50 rounded-xl">
              <div className="text-3xl mb-1">👣</div>
              <div className="text-sm text-gray-600">额外步数</div>
              <div className="font-bold text-lg text-gray-800">
                {userData?.powerups.moves || 0}
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-xl">
              <div className="text-3xl mb-1">🔄</div>
              <div className="text-sm text-gray-600">刷新棋盘</div>
              <div className="font-bold text-lg text-gray-800">
                {userData?.powerups.refresh || 0}
              </div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-xl">
              <div className="text-3xl mb-1">🔨</div>
              <div className="text-sm text-gray-600">小锤子</div>
              <div className="font-bold text-lg text-gray-800">
                {userData?.powerups.hammer || 0}
              </div>
            </div>
          </div>
        </div>

        {showMessage && (
          <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
            <div className="bg-black/70 text-white px-6 py-3 rounded-full text-lg animate-bounce">
              {showMessage}
            </div>
          </div>
        )}

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