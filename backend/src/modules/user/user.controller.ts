import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  UseGuards,
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { WechatLoginDto } from './dto/wechat-login.dto';
import { GuestLoginDto } from './dto/guest-login.dto';
import { UpdateSettingsDto } from './dto/update-settings.dto';
import { ChangeSkinDto } from './dto/change-skin.dto';
import { UpdateProgressDto } from './dto/update-progress.dto';
import { RecordFailureDto } from './dto/record-failure.dto';

@ApiTags('用户')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post('wechat-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '微信登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async wechatLogin(@Body() dto: WechatLoginDto) {
    return this.userService.wechatLogin(dto.code, dto.openId, dto.unionId, dto.nickname, dto.avatar);
  }

  @Post('guest-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '游客登录' })
  @ApiResponse({ status: 200, description: '登录成功' })
  async guestLogin(@Body() dto: GuestLoginDto) {
    return this.userService.guestLogin(dto.deviceId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取用户信息' })
  @ApiResponse({ status: 200, description: '获取成功' })
  async getProfile(@Request() req) {
    return this.userService.getUserById(req.user.userId);
  }

  @Put('settings')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新用户设置' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateSettings(@Request() req, @Body() dto: UpdateSettingsDto) {
    return this.userService.updateSettings(req.user.userId, dto);
  }

  @Put('skin')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更换皮肤' })
  @ApiResponse({ status: 200, description: '更换成功' })
  async changeSkin(@Request() req, @Body() dto: ChangeSkinDto) {
    return this.userService.changeSkin(req.user.userId, dto.skinId);
  }

  @Post('progress')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新游戏进度' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateProgress(@Request() req, @Body() dto: UpdateProgressDto) {
    return this.userService.updateProgress(
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
    return this.userService.recordFailure(req.user.userId, dto.levelId);
  }

  @Post('energy/consume')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '消耗能量' })
  @ApiResponse({ status: 200, description: '消耗成功' })
  async consumeEnergy(@Request() req, @Body('amount') amount: number = 5) {
    return this.userService.consumeEnergy(req.user.userId, amount);
  }

  @Post('energy/recover')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '恢复能量' })
  @ApiResponse({ status: 200, description: '恢复成功' })
  async recoverEnergy(@Request() req) {
    return this.userService.recoverEnergy(req.user.userId);
  }
}