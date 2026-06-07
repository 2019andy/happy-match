// 音效管理器 - 使用Web Audio API生成柔和治愈系音效

type SoundType = 'click' | 'match' | 'combo' | 'powerup' | 'win' | 'lose' | 'drop';

class SoundManagerInstance {
  private audioContext: AudioContext | null = null;
  private soundEnabled: boolean = true;
  private vibrationEnabled: boolean = true;
  private comboLevel: number = 0;
  private masterVolume: number = 0.3;
  
  constructor() {
    this.loadSettings();
  }
  
  private loadSettings(): void {
    const saved = localStorage.getItem('sweetMatch_soundSettings');
    if (saved) {
      try {
        const settings = JSON.parse(saved);
        this.soundEnabled = settings.soundEnabled ?? true;
        this.vibrationEnabled = settings.vibrationEnabled ?? true;
        this.masterVolume = settings.masterVolume ?? 0.3;
      } catch {
        // 默认设置
      }
    }
  }
  
  private saveSettings(): void {
    localStorage.setItem('sweetMatch_soundSettings', JSON.stringify({
      soundEnabled: this.soundEnabled,
      vibrationEnabled: this.vibrationEnabled,
      masterVolume: this.masterVolume
    }));
  }
  
  private getAudioContext(): AudioContext {
    if (!this.audioContext) {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
    }
    return this.audioContext;
  }
  
  // 柔和的点击音效 - 短促轻柔
  public playClick(): void {
    if (!this.soundEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(480, ctx.currentTime + 0.05);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(this.masterVolume * 0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.08);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.08);
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }
  
  // 消除音效 - 柔和上升音
  public playMatch(): void {
    if (!this.soundEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const baseFreq = 400 + this.comboLevel * 50;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(baseFreq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(baseFreq * 1.5, ctx.currentTime + 0.15);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(this.masterVolume * 0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.2);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.2);
      
      this.comboLevel++;
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }
  
  // 连击音效 - 渐变上升，愈来愈高
  public playCombo(level: number): void {
    if (!this.soundEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const baseFreq = 300 + level * 80;
      
      // 播放两个音符，形成和弦感
      const frequencies = [baseFreq, baseFreq * 1.25];
      
      frequencies.forEach((freq, i) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, ctx.currentTime);
        osc.type = 'sine';
        
        const volume = this.masterVolume * (0.15 - i * 0.03);
        gain.gain.setValueAtTime(volume, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
        
        osc.start(ctx.currentTime + i * 0.03);
        osc.stop(ctx.currentTime + 0.25);
      });
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }
  
  // 道具音效 - 特殊魔法感
  public playPowerUp(): void {
    if (!this.soundEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      
      // 闪烁般的音效序列
      const notes = [600, 800, 1000, 1200];
      let time = ctx.currentTime;
      
      notes.forEach((freq) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, time);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.masterVolume * 0.12, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);
        
        osc.start(time);
        osc.stop(time + 0.15);
        time += 0.06;
      });
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }
  
  // 通关音效 - 欢快庆祝
  public playWin(): void {
    if (!this.soundEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      
      // 欢快的上升旋律
      const melody = [
        { freq: 523.25, dur: 0.15 },  // C5
        { freq: 659.25, dur: 0.15 },  // E5
        { freq: 783.99, dur: 0.15 },  // G5
        { freq: 1046.50, dur: 0.3 },  // C6
      ];
      
      let time = ctx.currentTime;
      
      melody.forEach(({ freq, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, time);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.masterVolume * 0.25, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        
        osc.start(time);
        osc.stop(time + dur);
        time += dur * 0.8;
      });
      
      // 添加震动反馈
      this.vibrate([100, 50, 100]);
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }
  
  // 失败音效 - 温柔安慰，不刺耳
  public playLose(): void {
    if (!this.soundEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      
      // 温柔下降的安慰音
      const melody = [
        { freq: 392, dur: 0.25 },   // G4
        { freq: 330, dur: 0.25 },   // E4
        { freq: 262, dur: 0.35 },   // C4
      ];
      
      let time = ctx.currentTime;
      
      melody.forEach(({ freq, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        
        osc.connect(gain);
        gain.connect(ctx.destination);
        
        osc.frequency.setValueAtTime(freq, time);
        osc.type = 'sine';
        
        gain.gain.setValueAtTime(this.masterVolume * 0.18, time);
        gain.gain.exponentialRampToValueAtTime(0.001, time + dur);
        
        osc.start(time);
        osc.stop(time + dur);
        time += dur * 0.7;
      });
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }
  
  // 下落音效 - 轻柔滴落感
  public playDrop(): void {
    if (!this.soundEnabled) return;
    
    try {
      const ctx = this.getAudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(300, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(200, ctx.currentTime + 0.1);
      osc.type = 'sine';
      
      gain.gain.setValueAtTime(this.masterVolume * 0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      console.warn('音效播放失败:', e);
    }
  }
  
  // 重置连击等级
  public resetCombo(): void {
    this.comboLevel = 0;
  }
  
  // 震动反馈
  public vibrate(pattern: number[] = [50]): void {
    if (!this.vibrationEnabled) return;
    
    if ('vibrate' in navigator) {
      navigator.vibrate(pattern);
    }
  }
  
  // 消除成功震动
  public vibrateMatch(): void {
    this.vibrate([30]);
  }
  
  // 连击震动
  public vibrateCombo(level: number): void {
    const duration = 30 + level * 10;
    this.vibrate([duration]);
  }
  
  // 开启/关闭音效
  public toggleSound(): boolean {
    this.soundEnabled = !this.soundEnabled;
    this.saveSettings();
    return this.soundEnabled;
  }
  
  // 开启/关闭震动
  public toggleVibration(): boolean {
    this.vibrationEnabled = !this.vibrationEnabled;
    this.saveSettings();
    return this.vibrationEnabled;
  }
  
  // 设置音量
  public setVolume(volume: number): void {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    this.saveSettings();
  }
  
  // 获取音效状态
  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }
  
  // 获取震动状态
  public isVibrationEnabled(): boolean {
    return this.vibrationEnabled;
  }
  
  // 获取音量
  public getVolume(): number {
    return this.masterVolume;
  }
  
  // 播放指定类型音效
  public play(type: SoundType): void {
    switch (type) {
      case 'click':
        this.playClick();
        break;
      case 'match':
        this.playMatch();
        this.vibrateMatch();
        break;
      case 'combo':
        this.playCombo(this.comboLevel);
        this.vibrateCombo(this.comboLevel);
        break;
      case 'powerup':
        this.playPowerUp();
        this.vibrate([80, 40, 80]);
        break;
      case 'win':
        this.playWin();
        break;
      case 'lose':
        this.playLose();
        break;
      case 'drop':
        this.playDrop();
        break;
    }
  }
}

// 导出单例实例
export const SoundManager = new SoundManagerInstance();