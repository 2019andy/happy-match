import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { UserProgress } from './entities/user-progress.entity';
import { UserEnergy } from './entities/user-energy.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
    @InjectRepository(UserEnergy)
    private energyRepository: Repository<UserEnergy>,
    private jwtService: JwtService,
  ) {}

  // 微信登录 - 通过code获取用户信息
  async wechatLogin(code: string, openId?: string, unionId?: string, nickname?: string, avatar?: string) {
    let user: User | null = null;

    if (openId) {
      user = await this.userRepository.findOne({
        where: { wechatOpenId: openId },
      });
    } else if (code) {
      user = await this.userRepository.findOne({
        where: { wechatOpenId: `code_${code}` },
      });
    }

    const finalOpenId = openId || `code_${code}`;
    const finalNickname = nickname || `用户_${Date.now().toString(36)}`;
    const finalAvatar = avatar || '👤';

    if (!user) {
      user = this.userRepository.create({
        wechatOpenId: finalOpenId,
        wechatUnionId: unionId,
        nickname: finalNickname,
        avatar: finalAvatar,
        currentLevel: 1,
        energy: 30,
        maxEnergy: 30,
        coins: 100,
        diamonds: 10,
        powerups: { refresh: 1, hammer: 1, moves: 1 },
        settings: { isEyeCareMode: false, soundEnabled: true, vibrationEnabled: true },
        completedLevels: [],
        failedAttempts: {},
        achievements: [],
        ownedSkins: ['default'],
        activeSkin: 'default',
        lastLoginDate: new Date(),
        lastActiveTime: new Date(),
        energyLastUpdate: new Date(),
      });
      await this.userRepository.save(user);

      const energyRecord = this.energyRepository.create({
        userId: user.id,
        currentEnergy: 30,
        maxEnergy: 30,
        lastUpdate: new Date(),
        energyHistory: [],
      });
      await this.energyRepository.save(energyRecord);
    } else {
      if (nickname) user.nickname = nickname;
      if (avatar) user.avatar = avatar;
      user.lastLoginDate = new Date();
      user.lastActiveTime = new Date();
      await this.userRepository.save(user);
    }

    const payload = { userId: user.id, openId: user.wechatOpenId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.toUserResponse(user),
    };
  }

  // 游客登录
  async guestLogin(deviceId: string) {
    let user = await this.userRepository.findOne({
      where: { wechatOpenId: `guest_${deviceId}` },
    });

    if (!user) {
      user = this.userRepository.create({
        wechatOpenId: `guest_${deviceId}`,
        nickname: `游客_${Date.now().toString(36)}`,
        avatar: '👤',
        currentLevel: 1,
        energy: 30,
        maxEnergy: 30,
        coins: 50,
        diamonds: 5,
        powerups: { refresh: 1, hammer: 0, moves: 0 },
        settings: { isEyeCareMode: false, soundEnabled: true, vibrationEnabled: true },
        completedLevels: [],
        failedAttempts: {},
        achievements: [],
        ownedSkins: ['default'],
        activeSkin: 'default',
        lastLoginDate: new Date(),
        lastActiveTime: new Date(),
        energyLastUpdate: new Date(),
      });
      await this.userRepository.save(user);
    }

    const payload = { userId: user.id, openId: user.wechatOpenId };
    const accessToken = this.jwtService.sign(payload);

    return {
      accessToken,
      user: this.toUserResponse(user),
    };
  }

  // 获取用户信息
  async getUserById(userId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }
    return this.toUserResponse(user);
  }

  // 更新用户设置
  async updateSettings(userId: string, settings: Partial<User['settings']>) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    user.settings = { ...user.settings, ...settings };
    await this.userRepository.save(user);

    return user.settings;
  }

  // 更换皮肤
  async changeSkin(userId: string, skinId: string) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.ownedSkins.includes(skinId)) {
      throw new BadRequestException('未拥有该皮肤');
    }

    user.activeSkin = skinId;
    await this.userRepository.save(user);

    return { skinId };
  }

  // 更新游戏进度
  async updateProgress(
    userId: string,
    levelId: number,
    score: number,
    stars: number,
    moves: number,
    time: number,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    let progress = await this.progressRepository.findOne({
      where: { userId, levelId },
    });

    if (!progress) {
      progress = this.progressRepository.create({
        userId,
        levelId,
        attempts: 1,
        completions: 1,
        avgMoves: moves,
        avgTime: time,
        firstCompletedAt: new Date(),
        lastPlayedAt: new Date(),
      });
    } else {
      progress.attempts++;
      progress.completions++;
      progress.avgMoves = Math.round((progress.avgMoves * (progress.completions - 1) + moves) / progress.completions);
      progress.avgTime = Math.round((progress.avgTime * (progress.completions - 1) + time) / progress.completions);
      progress.lastPlayedAt = new Date();
    }

    if (score > progress.highestScore) {
      progress.highestScore = score;
    }

    if (stars > progress.stars) {
      progress.stars = stars;
    }

    await this.progressRepository.save(progress);

    // 更新用户总数据
    user.totalScore += score;
    if (score > user.highestScore) {
      user.highestScore = score;
    }
    user.totalStars += stars;
    if (levelId > user.currentLevel) {
      user.currentLevel = levelId;
    }
    if (!user.completedLevels.includes(levelId)) {
      user.completedLevels.push(levelId);
    }
    user.totalPlays++;
    user.totalEliminations += Math.floor(score / 50);
    user.lastActiveTime = new Date();

    await this.userRepository.save(user);

    return progress;
  }

  // 记录失败
  async recordFailure(userId: string, levelId: number) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new UnauthorizedException('用户不存在');
    }

    if (!user.failedAttempts) {
      user.failedAttempts = {};
    }
    user.failedAttempts[levelId] = (user.failedAttempts[levelId] || 0) + 1;
    user.totalPlays++;
    user.lastActiveTime = new Date();

    await this.userRepository.save(user);

    return { failedAttempts: user.failedAttempts[levelId] };
  }

  // 消耗能量
  async consumeEnergy(userId: string, amount: number = 5) {
    const energyRecord = await this.energyRepository.findOne({
      where: { userId },
    });

    if (!energyRecord) {
      throw new BadRequestException('能量记录不存在');
    }

    // 先恢复能量
    await this.recoverEnergy(userId);

    if (energyRecord.currentEnergy < amount) {
      throw new BadRequestException('能量不足');
    }

    energyRecord.currentEnergy -= amount;
    energyRecord.lastUpdate = new Date();
    energyRecord.energyHistory.push({
      timestamp: new Date(),
      action: 'consume',
      amount: -amount,
      balance: energyRecord.currentEnergy,
    });

    await this.energyRepository.save(energyRecord);

    // 同步更新用户表
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (user) {
      user.energy = energyRecord.currentEnergy;
      user.energyLastUpdate = new Date();
      await this.userRepository.save(user);
    }

    return { energy: energyRecord.currentEnergy };
  }

  // 恢复能量
  async recoverEnergy(userId: string) {
    const energyRecord = await this.energyRepository.findOne({
      where: { userId },
    });

    if (!energyRecord) {
      return;
    }

    const now = new Date();
    const lastUpdate = new Date(energyRecord.lastUpdate);
    const minutesPassed = Math.floor((now.getTime() - lastUpdate.getTime()) / 60000);
    const energyToRecover = Math.min(minutesPassed, energyRecord.maxEnergy - energyRecord.currentEnergy);

    if (energyToRecover > 0) {
      energyRecord.currentEnergy += energyToRecover;
      energyRecord.lastUpdate = now;
      energyRecord.energyHistory.push({
        timestamp: now,
        action: 'recover',
        amount: energyToRecover,
        balance: energyRecord.currentEnergy,
      });

      await this.energyRepository.save(energyRecord);

      // 同步更新用户表
      const user = await this.userRepository.findOne({ where: { id: userId } });
      if (user) {
        user.energy = energyRecord.currentEnergy;
        user.energyLastUpdate = now;
        await this.userRepository.save(user);
      }
    }

    return { energy: energyRecord.currentEnergy };
  }

  // 转换为响应格式
  private toUserResponse(user: User) {
    return {
      id: user.id,
      nickname: user.nickname,
      avatar: user.avatar,
      currentLevel: user.currentLevel,
      totalStars: user.totalStars,
      totalScore: user.totalScore,
      highestScore: user.highestScore,
      energy: user.energy,
      maxEnergy: user.maxEnergy,
      coins: user.coins,
      diamonds: user.diamonds,
      powerups: user.powerups,
      settings: user.settings,
      completedLevels: user.completedLevels,
      achievements: user.achievements,
      ownedSkins: user.ownedSkins,
      activeSkin: user.activeSkin,
      isVip: user.isVip,
      lastLoginDate: user.lastLoginDate,
    };
  }
}