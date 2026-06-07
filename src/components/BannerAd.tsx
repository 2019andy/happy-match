import { useEffect } from 'react';
import { adsManager, AdPosition, BannerCallbacks } from '../game/utils/AdsManager';

interface BannerAdProps {
  position: AdPosition;
  className?: string;
}

export function BannerAd({ position, className = '' }: BannerAdProps) {
  useEffect(() => {
    const callbacks: BannerCallbacks = {
      onAdLoaded: () => {
        console.log('Banner广告加载成功');
      },
      onAdFailed: (error: string) => {
        console.error('Banner广告加载失败:', error);
      },
      onAdClicked: () => {
        console.log('Banner广告被点击');
      }
    };
    
    adsManager.loadBanner(position, callbacks);
    adsManager.showBanner(position);
    
    return () => {
      adsManager.hideBanner();
    };
  }, [position]);
  
  return (
    <div className={`w-full ${className}`}>
      <div className="bg-gradient-to-r from-gray-100 to-gray-200 border border-gray-300 rounded-t-lg p-4 flex items-center justify-center min-h-[50px] sm:min-h-[70px]">
        <div className="text-center">
          <div className="text-gray-400 text-xs sm:text-sm mb-1">广告</div>
          <div className="text-gray-500 text-sm sm:text-base font-medium">
            腾讯优量汇广告位
          </div>
          <div className="text-gray-400 text-xs mt-1">
            7×3 广告位
          </div>
        </div>
      </div>
    </div>
  );
}

export function HomeBannerAd() {
  return (
    <BannerAd 
      position={AdPosition.HOME_BOTTOM} 
      className="fixed bottom-0 left-0 right-0 z-40"
    />
  );
}

export function GameBannerAd() {
  return (
    <BannerAd 
      position={AdPosition.GAME_BOTTOM}
      className="mt-4"
    />
  );
}

export function ShopBannerAd() {
  return (
    <BannerAd 
      position={AdPosition.SHOP_PAGE}
      className="mt-6"
    />
  );
}