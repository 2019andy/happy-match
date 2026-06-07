import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column({ length: 100, nullable: true })
  wechatOpenId: string;

  @Index({ unique: true })
  @Column({ length: 100, nullable: true })
  wechatUnionId: string;

  @Column({ length: 50 })
  nickname: string;

  @Column({ length: 255, nullable: true })
  avatar: string;

  @Column({ type: 'int', default: 1 })
  currentLevel: number;

  @Column({ type: 'int', default: 0 })
  totalStars: number;

  @Column({ type: 'int', default: 0 })
  totalScore: number;

  @Column({ type: 'int', default: 0 })
  highestScore: number;

  @Column({ type: 'int', default: 0 })
  coins: number;

  @Column({ type: 'int', default: 0 })
  diamonds: number;

  @Column({ type: 'int', default: 30 })
  energy: number;

  @Column({ type: 'int', default: 30 })
  maxEnergy: number;

  @Column({ type: 'json', nullable: true })
  powerups: {
    refresh: number;
    hammer: number;
    moves: number;
  };

  @Column({ type: 'json', nullable: true })
  settings: {
    isEyeCareMode: boolean;
    soundEnabled: boolean;
    vibrationEnabled: boolean;
  };

  @Column({ type: 'simple-array', nullable: true })
  completedLevels: number[];

  @Column({ type: 'json', nullable: true })
  failedAttempts: Record<number, number>;

  @Column({ type: 'json', nullable: true })
  achievements: {
    id: string;
    unlocked: boolean;
    unlockDate: number;
  }[];

  @Column({ type: 'simple-array', nullable: true })
  ownedSkins: string[];

  @Column({ length: 50, nullable: true })
  activeSkin: string;

  @Column({ type: 'int', default: 0 })
  totalPlays: number;

  @Column({ type: 'int', default: 0 })
  totalEliminations: number;

  @Column({ type: 'int', default: 0 })
  adsWatched: number;

  @Column({ type: 'int', default: 0 })
  totalPlayTime: number; // 总游戏时长（秒）

  @Column({ type: 'date', nullable: true })
  lastLoginDate: Date;

  @Column({ type: 'datetime', nullable: true })
  lastActiveTime: Date;

  @Column({ type: 'datetime', nullable: true })
  energyLastUpdate: Date;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: false })
  isVip: boolean;

  @Column({ type: 'datetime', nullable: true })
  vipExpireTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}