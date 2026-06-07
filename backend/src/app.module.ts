import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard } from '@nestjs/throttler';

// 业务模块
import { UserModule } from './modules/user/user.module';
import { GameModule } from './modules/game/game.module';
import { LevelModule } from './modules/level/level.module';
import { ShopModule } from './modules/shop/shop.module';
import { ActivityModule } from './modules/activity/activity.module';
import { PaymentModule } from './modules/payment/payment.module';
import { AdModule } from './modules/ad/ad.module';
import { SocialModule } from './modules/social/social.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { AdminModule } from './modules/admin/admin.module';
import { NotificationModule } from './modules/notification/notification.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    
    // 数据库连接 - MySQL
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST', 'localhost'),
        port: configService.get<number>('DB_PORT', 3306),
        username: configService.get('DB_USERNAME', 'root'),
        password: configService.get('DB_PASSWORD', ''),
        database: configService.get('DB_DATABASE', 'sweet_match'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: configService.get('DB_SYNC', 'false') === 'true',
        logging: configService.get('DB_LOGGING', 'false') === 'true',
        poolSize: 10,
        retryAttempts: 3,
        retryDelay: 3000,
      }),
    }),
    
    // 限流模块
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1分钟
        limit: 100, // 每分钟100次请求
      },
    ]),
    
    // 业务模块
    UserModule,
    GameModule,
    LevelModule,
    ShopModule,
    ActivityModule,
    PaymentModule,
    AdModule,
    SocialModule,
    AnalyticsModule,
    AdminModule,
    NotificationModule,
  ],
  providers: [
    // 全局限流守卫
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}