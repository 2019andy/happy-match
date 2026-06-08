import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameService } from './game.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../user/entities/user.entity';
import { UserProgress } from '../user/entities/user-progress.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, UserProgress])],
  controllers: [GameController],
  providers: [GameService],
})
export class GameModule {}