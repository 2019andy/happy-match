import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../user/entities/user.entity';
import { UserProgress } from '../user/entities/user-progress.entity';

@Injectable()
export class GameService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(UserProgress)
    private progressRepository: Repository<UserProgress>,
  ) {}

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
        highestScore: score,
        stars,
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

      if (score > progress.highestScore) {
        progress.highestScore = score;
      }

      if (stars > progress.stars) {
        progress.stars = stars;
      }
    }

    await this.progressRepository.save(progress);

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

  async getProgress(userId: string, levelId: number) {
    const progress = await this.progressRepository.findOne({
      where: { userId, levelId },
    });
    return progress || null;
  }

  async getAllProgress(userId: string) {
    const progresses = await this.progressRepository.find({
      where: { userId },
      order: { levelId: 'ASC' },
    });
    return progresses;
  }
}