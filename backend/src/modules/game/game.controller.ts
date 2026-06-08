import { Controller, Post, Body, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GameService } from './game.service';
import { JwtAuthGuard } from '../user/guards/jwt-auth.guard';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { RecordFailureDto } from './dto/record-failure.dto';

@ApiTags('游戏')
@Controller('game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新游戏进度' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProgress(@Request() req, @Body() dto: UpdateProgressDto) {
    return this.gameService.updateProgress(
      req.user.userId,
      dto.levelId,
      dto.score,
      dto.stars,
      dto.moves,
      dto.time,
    );
  }

  @Post('failure')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '记录失败' })
  @ApiResponse({ status: 200, description: '记录成功' })
  async recordFailure(@Request() req, @Body() dto: RecordFailureDto) {
    return this.gameService.recordFailure(req.user.userId, dto.levelId);
  }
}