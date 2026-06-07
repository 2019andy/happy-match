import { useState } from 'react';
import { adsManager, InterstitialCallbacks } from '../game/utils/AdsManager';

interface InterstitialAdProps {
  triggerAfterLevel?: number;
  onAdShown?: () => void;
  onAdClosed?: () => void;
  onAdFailed?: (error: string) => void;
}

export function useInterstitialAd({
  triggerAfterLevel = 3,
  onAdShown,
  onAdClosed,
  onAdFailed
}: InterstitialAdProps = {}) {
  const [canShow, setCanShow] = useState(false);
  const [levelCount, setLevelCount] = useState(0);
  
  const recordLevelComplete = () => {
    const newCount = levelCount + 1;
    setLevelCount(newCount);
    
    if (newCount >= triggerAfterLevel) {
      setCanShow(true);
      setLevelCount(0);
    }
  };
  
  const showAd = async (): Promise<boolean> => {
    if (!canShow) return false;
    
    const callbacks: InterstitialCallbacks = {
      onAdLoaded: () => {
        console.log('插屏广告加载成功');
      },
      onAdFailed: (error: string) => {
        console.error('插屏广告加载失败:', error);
        onAdFailed?.(error);
        setCanShow(false);
      },
      onAdShown: () => {
        console.log('插屏广告已展示');
        onAdShown?.();
      },
      onAdClicked: () => {
        console.log('插屏广告被点击');
      },
      onAdClosed: () => {
        console.log('插屏广告已关闭');
        onAdClosed?.();
        setCanShow(false);
      }
    };
    
    try {
      await adsManager.showInterstitial(callbacks);
      return true;
    } catch (error) {
      console.error('插屏广告展示失败:', error);
      setCanShow(false);
      return false;
    }
  };
  
  return {
    canShow,
    showAd,
    recordLevelComplete
  };
}

export function InterstitialAdModal({ 
  isVisible, 
  onClose 
}: { 
  isVisible: boolean; 
  onClose: () => void 
}) {
  const [canClose, setCanClose] = useState(false);
  
  useState(() => {
    const timer = setTimeout(() => {
      setCanClose(true);
    }, 3000);
    
    return () => clearTimeout(timer);
  });
  
  if (!isVisible) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 max-w-sm w-full mx-4 shadow-2xl animate-scaleIn">
        <div className="text-center mb-6">
          <div className="text-5xl mb-4">🎬</div>
          <div className="text-2xl font-bold text-gray-800 mb-2">插屏广告</div>
          <div className="text-gray-500">
            广告将在3秒后可关闭
          </div>
        </div>
        
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 mb-4">
          <div className="text-gray-400 text-sm mb-2">广告展示区域</div>
          <div className="text-gray-600">
            300×250 标准插屏广告位
          </div>
        </div>
        
        <button
          onClick={onClose}
          disabled={!canClose}
          className={`
            w-full py-3 rounded-full font-bold transition-all
            ${canClose 
              ? 'bg-gradient-to-r from-pink-400 to-purple-400 text-white hover:from-pink-500 hover:to-purple-500' 
              : 'bg-gray-300 text-gray-500 cursor-not-allowed'
            }
          `}
        >
          {canClose ? '关闭广告' : `请等待 ${3} 秒`}
        </button>
      </div>
      
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
  );
}