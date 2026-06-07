# 甜趣点点消数据库设计文档

## 一、MySQL数据库设计

### 1. 用户相关表

#### 1.1 用户表 (users)
```sql
CREATE TABLE `users` (
  `id` VARCHAR(36) PRIMARY KEY,
  `wechat_open_id` VARCHAR(100) UNIQUE,
  `wechat_union_id` VARCHAR(100) UNIQUE,
  `nickname` VARCHAR(50) NOT NULL,
  `avatar` VARCHAR(255),
  `current_level` INT DEFAULT 1,
  `total_stars` INT DEFAULT 0,
  `total_score` INT DEFAULT 0,
  `highest_score` INT DEFAULT 0,
  `coins` INT DEFAULT 0,
  `diamonds` INT DEFAULT 0,
  `energy` INT DEFAULT 30,
  `max_energy` INT DEFAULT 30,
  `powerups` JSON,
  `settings` JSON,
  `completed_levels` TEXT,
  `failed_attempts` JSON,
  `achievements` JSON,
  `owned_skins` TEXT,
  `active_skin` VARCHAR(50) DEFAULT 'default',
  `total_plays` INT DEFAULT 0,
  `total_eliminations` INT DEFAULT 0,
  `ads_watched` INT DEFAULT 0,
  `total_play_time` INT DEFAULT 0,
  `last_login_date` DATE,
  `last_active_time` DATETIME,
  `energy_last_update` DATETIME,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_vip` BOOLEAN DEFAULT FALSE,
  `vip_expire_time` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_wechat_open_id` (`wechat_open_id`),
  INDEX `idx_last_active` (`last_active_time`)
);
```

#### 1.2 用户进度表 (user_progress)
```sql
CREATE TABLE `user_progress` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `level_id` INT NOT NULL,
  `stars` INT DEFAULT 0,
  `highest_score` INT DEFAULT 0,
  `attempts` INT DEFAULT 0,
  `completions` INT DEFAULT 0,
  `avg_moves` INT DEFAULT 0,
  `avg_time` INT DEFAULT 0,
  `first_completed_at` DATETIME,
  `last_played_at` DATETIME,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_user_level` (`user_id`, `level_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
```

#### 1.3 用户能量表 (user_energy)
```sql
CREATE TABLE `user_energy` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `current_energy` INT DEFAULT 30,
  `max_energy` INT DEFAULT 30,
  `last_update` DATETIME NOT NULL,
  `pending_recovery` INT DEFAULT 0,
  `energy_history` JSON,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
```

### 2. 关卡相关表

#### 2.1 关卡配置表 (levels)
```sql
CREATE TABLE `levels` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `name` VARCHAR(50) NOT NULL,
  `type` ENUM('score', 'obstacle', 'collect') DEFAULT 'score',
  `target_score` INT DEFAULT 500,
  `target_obstacles` INT DEFAULT 0,
  `target_collect` INT DEFAULT 0,
  `collect_type` VARCHAR(20),
  `moves` INT DEFAULT 20,
  `board_width` INT DEFAULT 7,
  `board_height` INT DEFAULT 7,
  `obstacles` JSON,
  `rewards` JSON,
  `difficulty` INT DEFAULT 1,
  `is_active` BOOLEAN DEFAULT TRUE,
  `is_festival` BOOLEAN DEFAULT FALSE,
  `festival_id` VARCHAR(50),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_difficulty` (`difficulty`)
);
```

#### 2.2 关卡统计表 (level_stats)
```sql
CREATE TABLE `level_stats` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `level_id` INT NOT NULL,
  `total_attempts` INT DEFAULT 0,
  `total_completions` INT DEFAULT 0,
  `avg_score` INT DEFAULT 0,
  `avg_moves` INT DEFAULT 0,
  `avg_time` INT DEFAULT 0,
  `drop_off_rate` DECIMAL(5,2) DEFAULT 0,
  `last_updated` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_level_id` (`level_id`),
  FOREIGN KEY (`level_id`) REFERENCES `levels`(`id`)
);
```

### 3. 商城相关表

#### 3.1 商城商品表 (shop_items)
```sql
CREATE TABLE `shop_items` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255),
  `icon` VARCHAR(50),
  `price` INT NOT NULL,
  `currency` ENUM('coins', 'diamonds') DEFAULT 'coins',
  `type` ENUM('powerup', 'energy', 'skin', 'special') DEFAULT 'powerup',
  `amount` INT,
  `is_active` BOOLEAN DEFAULT TRUE,
  `sort_order` INT DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 3.2 用户购买记录表 (purchase_records)
```sql
CREATE TABLE `purchase_records` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `item_id` VARCHAR(36) NOT NULL,
  `price` INT NOT NULL,
  `currency` VARCHAR(20) NOT NULL,
  `amount` INT,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
```

### 4. 活动相关表

#### 4.1 活动配置表 (activities)
```sql
CREATE TABLE `activities` (
  `id` VARCHAR(36) PRIMARY KEY,
  `name` VARCHAR(50) NOT NULL,
  `description` VARCHAR(255),
  `type` ENUM('festival', 'limited', 'daily', 'special') DEFAULT 'daily',
  `icon` VARCHAR(50),
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `theme` JSON,
  `levels` JSON,
  `rewards` JSON,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_time_range` (`start_time`, `end_time`)
);
```

#### 4.2 用户活动参与表 (user_activities)
```sql
CREATE TABLE `user_activities` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `activity_id` VARCHAR(36) NOT NULL,
  `progress` INT DEFAULT 0,
  `completed` BOOLEAN DEFAULT FALSE,
  `rewards_claimed` JSON,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_user_activity` (`user_id`, `activity_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
```

### 5. 广告相关表

#### 5.1 广告配置表 (ad_configs)
```sql
CREATE TABLE `ad_configs` (
  `id` VARCHAR(36) PRIMARY KEY,
  `ad_type` ENUM('rewarded', 'banner', 'interstitial', 'native') NOT NULL,
  `position` VARCHAR(50),
  `ad_unit_id` VARCHAR(100) NOT NULL,
  `frequency` INT DEFAULT 3,
  `max_daily` INT DEFAULT 15,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 5.2 广告统计表 (ad_stats)
```sql
CREATE TABLE `ad_stats` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `date` DATE NOT NULL,
  `ad_type` VARCHAR(20) NOT NULL,
  `impressions` INT DEFAULT 0,
  `clicks` INT DEFAULT 0,
  `revenue` DECIMAL(10,2) DEFAULT 0,
  `fill_rate` DECIMAL(5,2) DEFAULT 100,
  `ecpm` DECIMAL(10,2) DEFAULT 0,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_date_type` (`date`, `ad_type`)
);
```

### 6. 社交相关表

#### 6.1 好友关系表 (friendships)
```sql
CREATE TABLE `friendships` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `friend_id` VARCHAR(36) NOT NULL,
  `status` ENUM('pending', 'accepted', 'blocked') DEFAULT 'pending',
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE INDEX `idx_friendship` (`user_id`, `friend_id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`friend_id`) REFERENCES `users`(`id`)
);
```

#### 6.2 礼物赠送表 (gifts)
```sql
CREATE TABLE `gifts` (
  `id` VARCHAR(36) PRIMARY KEY,
  `from_user_id` VARCHAR(36) NOT NULL,
  `to_user_id` VARCHAR(36) NOT NULL,
  `gift_type` ENUM('energy', 'coin', 'hint') DEFAULT 'energy',
  `amount` INT DEFAULT 5,
  `claimed` BOOLEAN DEFAULT FALSE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_to_user` (`to_user_id`),
  FOREIGN KEY (`from_user_id`) REFERENCES `users`(`id`),
  FOREIGN KEY (`to_user_id`) REFERENCES `users`(`id`)
);
```

### 7. 排行榜相关表

#### 7.1 排行榜表 (leaderboards)
```sql
CREATE TABLE `leaderboards` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `user_id` VARCHAR(36) NOT NULL,
  `rank_type` ENUM('total_score', 'highest_score', 'level', 'stars') DEFAULT 'total_score',
  `score` INT DEFAULT 0,
  `rank` INT DEFAULT 0,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_rank_type` (`rank_type`, `rank`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
```

### 8. 支付相关表

#### 8.1 订单表 (orders)
```sql
CREATE TABLE `orders` (
  `id` VARCHAR(36) PRIMARY KEY,
  `user_id` VARCHAR(36) NOT NULL,
  `product_id` VARCHAR(50) NOT NULL,
  `amount` DECIMAL(10,2) NOT NULL,
  `currency` VARCHAR(10) DEFAULT 'CNY',
  `status` ENUM('pending', 'paid', 'failed', 'refunded') DEFAULT 'pending',
  `payment_method` VARCHAR(20),
  `transaction_id` VARCHAR(100),
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX `idx_user_id` (`user_id`),
  INDEX `idx_status` (`status`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
);
```

### 9. 管理后台相关表

#### 9.1 管理员表 (admins)
```sql
CREATE TABLE `admins` (
  `id` VARCHAR(36) PRIMARY KEY,
  `username` VARCHAR(50) UNIQUE NOT NULL,
  `password` VARCHAR(255) NOT NULL,
  `role` ENUM('super_admin', 'admin', 'operator') DEFAULT 'operator',
  `permissions` JSON,
  `last_login` DATETIME,
  `is_active` BOOLEAN DEFAULT TRUE,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

#### 9.2 操作日志表 (admin_logs)
```sql
CREATE TABLE `admin_logs` (
  `id` INT PRIMARY KEY AUTO_INCREMENT,
  `admin_id` VARCHAR(36) NOT NULL,
  `action` VARCHAR(50) NOT NULL,
  `target_type` VARCHAR(50),
  `target_id` VARCHAR(36),
  `details` JSON,
  `created_at` DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX `idx_admin_id` (`admin_id`),
  INDEX `idx_created_at` (`created_at`),
  FOREIGN KEY (`admin_id`) REFERENCES `admins`(`id`)
);
```

---

## 二、MongoDB数据库设计

### 1. 游戏日志集合 (game_logs)
```javascript
{
  _id: ObjectId,
  userId: String,
  levelId: Number,
  action: String, // 'start', 'move', 'match', 'powerup', 'complete', 'fail'
  score: Number,
  moves: Number,
  tiles: Array,
  timestamp: Date,
  sessionId: String,
  deviceInfo: {
    platform: String,
    version: String,
    model: String
  }
}
```

### 2. 用户行为日志集合 (behavior_logs)
```javascript
{
  _id: ObjectId,
  userId: String,
  eventType: String, // 'login', 'logout', 'purchase', 'ad_watch', 'share', 'click'
  eventData: Object,
  timestamp: Date,
  sessionId: String,
  page: String,
  referrer: String
}
```

### 3. 错误日志集合 (error_logs)
```javascript
{
  _id: ObjectId,
  userId: String,
  errorType: String,
  errorMessage: String,
  stackTrace: String,
  deviceInfo: Object,
  timestamp: Date,
  resolved: Boolean
}
```

---

## 三、Redis缓存设计

### 1. 缓存Key设计

| Key模式 | 说明 | TTL |
|---------|------|-----|
| `user:{userId}` | 用户基本信息 | 1小时 |
| `user:energy:{userId}` | 用户能量 | 6分钟 |
| `user:progress:{userId}` | 用户进度 | 30分钟 |
| `leaderboard:{type}` | 排行榜数据 | 5分钟 |
| `level:{levelId}` | 关卡配置 | 1天 |
| `activity:active` | 当前活动 | 1小时 |
| `session:{sessionId}` | 会话信息 | 7天 |
| `rate_limit:{ip}` | 限流计数 | 1分钟 |
| `ad:daily:{userId}` | 今日广告计数 | 1天 |

### 2. 排行榜使用ZSET
```
Key: leaderboard:total_score
Type: ZSET
Members: userId
Score: totalScore
```

---

## 四、数据索引策略

### 1. MySQL索引
- 用户表：wechat_open_id, last_active_time
- 进度表：user_id + level_id 组合索引
- 订单表：user_id, status, created_at
- 广告统计：date + ad_type 组合索引

### 2. MongoDB索引
- 游戏日志：userId + timestamp
- 行为日志：userId + eventType + timestamp
- 错误日志：errorType + timestamp

---

## 五、数据备份策略

### 1. MySQL备份
- 全量备份：每天凌晨2点
- 增量备份：每4小时一次
- 保留周期：30天

### 2. MongoDB备份
- 全量备份：每天凌晨3点
- 保留周期：7天

### 3. Redis备份
- RDB快照：每6小时
- AOF日志：实时写入