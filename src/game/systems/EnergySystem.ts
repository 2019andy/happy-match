import { GameConfig } from '../config/GameConfig';

export class EnergySystem {
  private energy: number;
  private maxEnergy: number;
  private lastRecoveryTime: number;
  private recoveryInterval: number;
  
  constructor() {
    this.maxEnergy = GameConfig.MAX_ENERGY;
    this.recoveryInterval = GameConfig.ENERGY_RECOVERY_TIME;
    this.loadFromStorage();
    this.startAutoRecovery();
  }
  
  private loadFromStorage(): void {
    const saved = localStorage.getItem('energyData');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.energy = data.energy;
        this.lastRecoveryTime = data.lastRecoveryTime;
        
        this.calculateRecoveredEnergy();
      } catch {
        this.energy = GameConfig.INITIAL_ENERGY;
        this.lastRecoveryTime = Date.now();
      }
    } else {
      this.energy = GameConfig.INITIAL_ENERGY;
      this.lastRecoveryTime = Date.now();
    }
  }
  
  private saveToStorage(): void {
    localStorage.setItem('energyData', JSON.stringify({
      energy: this.energy,
      lastRecoveryTime: this.lastRecoveryTime
    }));
  }
  
  private calculateRecoveredEnergy(): void {
    const now = Date.now();
    const timePassed = now - this.lastRecoveryTime;
    const recovered = Math.floor(timePassed / this.recoveryInterval);
    
    if (recovered > 0) {
      this.energy = Math.min(this.maxEnergy, this.energy + recovered);
      this.lastRecoveryTime = now - (timePassed % this.recoveryInterval);
      this.saveToStorage();
    }
  }
  
  private startAutoRecovery(): void {
    setInterval(() => {
      if (this.energy < this.maxEnergy) {
        this.energy++;
        this.lastRecoveryTime = Date.now();
        this.saveToStorage();
      }
    }, this.recoveryInterval);
  }
  
  public getEnergy(): number {
    this.calculateRecoveredEnergy();
    return this.energy;
  }
  
  public getMaxEnergy(): number {
    return this.maxEnergy;
  }
  
  public consumeEnergy(amount: number = GameConfig.ENERGY_COST_PER_LEVEL): boolean {
    this.calculateRecoveredEnergy();
    
    if (this.energy >= amount) {
      this.energy -= amount;
      this.saveToStorage();
      return true;
    }
    
    return false;
  }
  
  public addEnergy(amount: number): void {
    this.calculateRecoveredEnergy();
    this.energy = Math.min(this.maxEnergy, this.energy + amount);
    this.saveToStorage();
  }
  
  public fillEnergy(): void {
    this.energy = this.maxEnergy;
    this.lastRecoveryTime = Date.now();
    this.saveToStorage();
  }
  
  public getRemainingRecoveryTime(): number {
    if (this.energy >= this.maxEnergy) {
      return 0;
    }
    
    this.calculateRecoveredEnergy();
    const now = Date.now();
    const timeSinceLast = now - this.lastRecoveryTime;
    return this.recoveryInterval - timeSinceLast;
  }
  
  public getRecoveryProgress(): number {
    if (this.energy >= this.maxEnergy) {
      return 1;
    }
    
    const timeSinceLast = Date.now() - this.lastRecoveryTime;
    return timeSinceLast / this.recoveryInterval;
  }
}
