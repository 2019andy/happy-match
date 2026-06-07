type EventCallback = (...args: any[]) => void;

interface EventListeners {
  [eventName: string]: EventCallback[];
}

export class GameEventManager {
  private listeners: EventListeners = {};
  
  public on(eventName: string, callback: EventCallback): void {
    if (!this.listeners[eventName]) {
      this.listeners[eventName] = [];
    }
    this.listeners[eventName].push(callback);
  }
  
  public off(eventName: string, callback: EventCallback): void {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName] = this.listeners[eventName].filter(cb => cb !== callback);
  }
  
  public emit(eventName: string, ...args: any[]): void {
    if (!this.listeners[eventName]) {
      return;
    }
    this.listeners[eventName].forEach(callback => callback(...args));
  }
  
  public once(eventName: string, callback: EventCallback): void {
    const onceCallback = (...args: any[]) => {
      callback(...args);
      this.off(eventName, onceCallback);
    };
    this.on(eventName, onceCallback);
  }
  
  public clear(eventName?: string): void {
    if (eventName) {
      this.listeners[eventName] = [];
    } else {
      this.listeners = {};
    }
  }
}

export const GAME_EVENTS = {
  MATCH_FOUND: 'match_found',
  MATCH_EXECUTED: 'match_executed',
  POWERUP_USED: 'powerup_used',
  SCORE_UPDATE: 'score_update',
  MOVES_UPDATE: 'moves_update',
  GAME_WIN: 'game_win',
  GAME_LOSE: 'game_lose',
  LEVEL_COMPLETE: 'level_complete',
  TILE_SWAPPED: 'tile_swapped',
  TILE_DROPPED: 'tile_dropped',
  CHAIN_REACTION: 'chain_reaction',
  ENERGY_CHANGE: 'energy_change',
  THEME_CHANGE: 'theme_change'
};
