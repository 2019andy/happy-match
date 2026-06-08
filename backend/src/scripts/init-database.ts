import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';
import { getRepository, getConnection } from 'typeorm';
import { User } from '../modules/user/entities/user.entity';
import { UserProgress } from '../modules/user/entities/user-progress.entity';
import { UserEnergy } from '../modules/user/entities/user-energy.entity';

async function clearAndInitDatabase() {
  console.log('🚀 开始初始化数据库...');

  const app = await NestFactory.createApplicationContext(AppModule);

  try {
    // 获取实体仓库
    const userRepository = getRepository(User);
    const userProgressRepository = getRepository(UserProgress);
    const userEnergyRepository = getRepository(UserEnergy);

    console.log('🧹 清除现有数据...');
    
    // 清除所有数据（注意：生产环境请谨慎！）
    await userProgressRepository.delete({});
    await userEnergyRepository.delete({});
    await userRepository.delete({});

    console.log('✅ 数据清除完成！');

    console.log('🎯 数据库初始化完成！');

  } catch (error) {
    console.error('❌ 数据库初始化失败:', error);
    throw error;
  } finally {
    await app.close();
    console.log('👋 应用已关闭');
  }
}

clearAndInitDatabase().catch(console.error);
