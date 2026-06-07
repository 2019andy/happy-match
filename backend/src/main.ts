import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as compression from 'compression';
import * as helmet from 'helmet';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // 获取配置服务
  const configService = app.get(ConfigService);
  
  // 安全中间件
  app.use(helmet());
  app.use(compression());
  
  // CORS配置
  app.enableCors({
    origin: configService.get('CORS_ORIGINS', '*'),
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    credentials: true,
  });
  
  // 全局验证管道
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );
  
  // API前缀
  app.setGlobalPrefix('api/v1');
  
  // Swagger API文档
  if (configService.get('ENABLE_SWAGGER', 'true') === 'true') {
    const config = new DocumentBuilder()
      .setTitle('甜趣点点消 API')
      .setDescription('甜趣点点消游戏后端API文档')
      .setVersion('1.0')
      .addBearerAuth()
      .addTag('用户', '用户相关接口')
      .addTag('游戏', '游戏核心接口')
      .addTag('关卡', '关卡管理接口')
      .addTag('商城', '商城相关接口')
      .addTag('活动', '活动管理接口')
      .addTag('支付', '支付相关接口')
      .addTag('广告', '广告管理接口')
      .addTag('社交', '社交功能接口')
      .addTag('数据', '数据分析接口')
      .addTag('管理', '管理后台接口')
      .build();
    
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document);
  }
  
  // 启动服务
  const port = configService.get('PORT', 3000);
  await app.listen(port);
  
  console.log(`🚀 后端服务已启动: http://localhost:${port}`);
  console.log(`📚 API文档地址: http://localhost:${port}/api/docs`);
}

bootstrap();