import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';

@Entity('user_energy')
@Index(['userId'])
export class UserEnergy {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  userId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ type: 'int', default: 30 })
  currentEnergy: number;

  @Column({ type: 'int', default: 30 })
  maxEnergy: number;

  @Column({ type: 'datetime' })
  lastUpdate: Date;

  @Column({ type: 'int', default: 0 })
  pendingRecovery: number; // 待恢复的能量点数

  @Column({ type: 'json', nullable: true })
  energyHistory: {
    timestamp: Date;
    action: 'consume' | 'recover' | 'gift' | 'purchase' | 'ad_reward';
    amount: number;
    balance: number;
  }[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}