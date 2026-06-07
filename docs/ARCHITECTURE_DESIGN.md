# 甜趣点点消 - 系统架构重构设计文档

> 版本：v2.0  
> 日期：2026-06-07  
> 作者：架构设计师-刘一手

---

## 目录

1. [项目概述](#1-项目概述)
2. [系统架构设计](#2-系统架构设计)
3. [技术选型方案](#3-技术选型方案)
4. [数据库设计方案](#4-数据库设计方案)
5. [API接口设计](#5-api接口设计)
6. [营销功能规划](#6-营销功能规划)
7. [市场运营功能](#7-市场运营功能)
8. [部署方案清单](#8-部署方案清单)
9. [安全架构设计](#9-安全架构设计)
10. [性能优化方案](#10-性能优化方案)

---

## 1. 项目概述

### 1.1 项目背景

「甜趣点点消」是一款休闲三消游戏，当前采用纯前端架构（React + TypeScript + Vite + Phaser），数据存储在浏览器本地。为支持微信生态多端部署、实现完整的用户系统、营销功能和数据分析能力，需要进行全面的架构重构。

### 1.2 现有技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 前端框架 | React 18.3 + TypeScript | 组件化开发 |
| 游戏引擎 | Phaser 4.1 | 游戏核心渲染 |
| 状态管理 | Zustand 5.0 | 轻量级状态管理 |
| 样式方案 | Tailwind CSS | 原子化CSS |
| 构建工具 | Vite 6.3 | 快速开发构建 |
| 后端服务 | Express 4.21 | 简单API服务 |
| 实时通信 | Socket.io 4.8 | WebSocket通信 |

### 1.3 重构目标

- 支持微信小程序、H5、App多端部署
- 构建完整的后端服务体系
- 实现用户数据云端同步
- 支持营销活动和运营分析
- 提供PC端管理后台
- 确保系统高可用、可扩展

---

## 2. 系统架构设计

### 2.1 整体架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              客户端层 (Client Layer)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐         │
│  │  微信小程序   │  │    H5 Web    │  │   iOS App   │  │ Android App  │         │
│  │   (Taro)     │  │    (Taro)    │  │  (Taro/RN)  │  │  (Taro/RN)   │         │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘         │
│         │                 │                 │                 │                 │
│         └─────────────────┴─────────────────┴─────────────────┘                 │
│                                    │                                             │
│                           ┌────────▼────────┐                                   │
│                           │  统一SDK适配层   │                                   │
│                           │  (Platform SDK) │                                   │
│                           └────────┬────────┘                                   │
└────────────────────────────────────┼────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────────┐
│                           API网关层 (Gateway Layer)                              │
├────────────────────────────────────┼────────────────────────────────────────────┤
│                           ┌────────▼────────┐                                   │
│                           │   Nginx / Kong   │                                   │
│                           │  (API Gateway)   │                                   │
│                           └────────┬────────┘                                   │
│                                    │                                             │
│  ┌─────────────────────────────────┼─────────────────────────────────────────┐  │
│  │          功能职责：负载均衡 / SSL终止 / 限流 / 路由 / 认证转发            │  │
│  └─────────────────────────────────┬─────────────────────────────────────────┘  │
└────────────────────────────────────┼────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────────┐
│                           服务层 (Service Layer)                                 │
├────────────────────────────────────┼────────────────────────────────────────────┤
│                                    │                                             │
│  ┌─────────────┬─────────────┬─────▼─────┬─────────────┬─────────────┐          │
│  │  用户服务   │  游戏服务   │  支付服务  │  活动服务   │  数据服务   │          │
│  │ (User Svc)  │ (Game Svc)  │ (Pay Svc) │(Activity Svc)│ (Data Svc) │          │
│  └──────┬──────┴──────┬──────┴─────┬─────┴──────┬──────┴──────┬──────┘          │
│         │             │            │            │             │                 │
│  ┌──────▼──────┬──────▼──────┬─────▼─────┬──────▼──────┬──────▼──────┐          │
│  │  通知服务   │  广告服务   │  社交服务  │  排行榜服务 │  管理后台   │          │
│  │(Notify Svc) │ (Ad Svc)   │(Social Svc)│(Rank Svc) │(Admin API) │          │
│  └─────────────┴─────────────┴───────────┴────────────┴─────────────┘          │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                     消息队列 (Message Queue)                              │   │
│  │                     RabbitMQ / Kafka                                      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────────┐
│                           数据层 (Data Layer)                                    │
├────────────────────────────────────┼────────────────────────────────────────────┤
│                                    │                                             │
│  ┌─────────────┬─────────────┬─────▼─────┬─────────────┬─────────────┐          │
│  │   MySQL     │   MongoDB   │   Redis   │    OSS      │   ES        │          │
│  │  (主数据库)  │  (游戏日志) │  (缓存)   │  (静态资源)  │ (日志搜索)  │          │
│  └─────────────┴─────────────┴───────────┴────────────┴─────────────┘          │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                     数据同步 / 备份 / 归档                                │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────────────────┘
                                     │
┌────────────────────────────────────┼────────────────────────────────────────────┐
│                           基础设施层 (Infrastructure Layer)                      │
├────────────────────────────────────┼────────────────────────────────────────────┤
│                                    │                                             │
│  ┌─────────────┬─────────────┬─────▼─────┬─────────────┬─────────────┐          │
│  │   Docker    │ Kubernetes  │  监控系统  │   CI/CD     │   日志系统  │          │
│  │  (容器化)   │  (编排)     │Prometheus │ GitHub/GitLab│   ELK      │          │
│  └─────────────┴─────────────┴───────────┴────────────┴─────────────┘          │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.2 客户端架构

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              客户端应用架构                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          Taro 跨端框架层                                  │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌────────────┐         │   │
│  │  │ 微信小程序  │  │  H5 Web    │  │  支付宝小程序 │  │  字节小程序  │         │   │
│  │  └────────────┘  └────────────┘  └────────────┘  └────────────┘         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                            │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐   │
│  │                          业务逻辑层 (Business Layer)                      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  游戏核心   │  │  用户系统   │  │  商城系统   │  │  活动系统   │      │   │
│  │  │ (Game Core) │  │ (User Sys)  │  │ (Shop Sys)  │  │(Activity Sys)│     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │  社交系统   │  │  排行榜    │  │  成就系统   │  │  通知系统   │      │   │
│  │  │(Social Sys) │  │(Leaderboard)│  │(Achievement)│  │(Notify Sys) │     │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                            │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐   │
│  │                          游戏引擎层 (Game Engine Layer)                    │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    Phaser 游戏引擎 (保留现有核心逻辑)                 │ │   │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │ │   │
│  │  │  │  Board    │  │ MatchSys  │  │ScoreSys   │  │ EnergySys │        │ │   │
│  │  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │ │   │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │ │   │
│  │  │  │LevelGen   │  │ SoundMgr  │  │ Storage   │  │ EventMgr  │        │ │   │
│  │  │  └───────────┘  └───────────┘  └───────────┘  └───────────┘        │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                            │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐   │
│  │                          平台适配层 (Platform Adapter Layer)               │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 微信SDK适配  │  │ 广告SDK适配  │  │ 支付SDK适配  │  │ 分享SDK适配  │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 存储适配    │  │ 网络适配    │  │ 推送适配    │  │ 设备适配    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                            │
│  ┌───────────────────────────────────▼──────────────────────────────────────┐   │
│  │                          状态管理层 (State Management)                     │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                    Zustand (全局状态) + React Query (服务端状态)      │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.3 后端服务架构

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              微服务架构设计                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          API Gateway (Kong / Nginx)                      │   │
│  │  职责：路由转发、限流熔断、认证鉴权、日志记录、监控统计                    │   │
│  └───────────────────────────────────┬──────────────────────────────────────┘   │
│                                      │                                           │
│         ┌────────────────────────────┼────────────────────────────┐             │
│         │                            │                            │             │
│         ▼                            ▼                            ▼             │
│  ┌─────────────┐             ┌─────────────┐             ┌─────────────┐       │
│  │ 用户服务    │             │ 游戏服务     │             │ 支付服务     │       │
│  │ user-svc    │             │ game-svc     │             │ payment-svc  │       │
│  ├─────────────┤             ├─────────────┤             ├─────────────┤       │
│  │ 用户注册登录 │             │ 关卡数据管理 │             │ 订单管理     │       │
│  │ 用户信息管理 │             │ 游戏进度同步 │             │ 支付回调     │       │
│  │ 用户认证授权 │             │ 成就系统     │             │ 退款处理     │       │
│  │ 用户关系链   │             │ 排行榜       │             │ 账单管理     │       │
│  │ 第三方登录   │             │ 能量系统     │             │ 对账系统     │       │
│  └──────┬──────┘             └──────┬──────┘             └──────┬──────┘       │
│         │                           │                           │               │
│         └───────────────────────────┼───────────────────────────┘               │
│                                     │                                           │
│         ┌───────────────────────────┼───────────────────────────┐               │
│         │                           │                           │               │
│         ▼                           ▼                           ▼               │
│  ┌─────────────┐             ┌─────────────┐             ┌─────────────┐       │
│  │ 活动服务     │             │ 数据服务     │             │ 通知服务     │       │
│  │activity-svc  │             │ data-svc     │             │ notify-svc   │       │
│  ├─────────────┤             ├─────────────┤             ├─────────────┤       │
│  │ 活动配置管理 │             │ 数据统计     │             │ 消息推送     │       │
│  │ 奖励发放     │             │ 用户行为分析 │             │ 模板消息     │       │
│  │ 任务系统     │             │ 留存分析     │             │ 邮件通知     │       │
│  │ 签到系统     │             │ 转化漏斗     │             │ 站内信       │       │
│  │ 限时活动     │             │ A/B测试      │             │ 短信通知     │       │
│  └──────┬──────┘             └──────┬──────┘             └──────┬──────┘       │
│         │                           │                           │               │
│         └───────────────────────────┼───────────────────────────┘               │
│                                     │                                           │
│         ┌───────────────────────────┼───────────────────────────┐               │
│         │                           │                           │               │
│         ▼                           ▼                           ▼               │
│  ┌─────────────┐             ┌─────────────┐             ┌─────────────┐       │
│  │ 广告服务     │             │ 社交服务     │             │ 管理后台API  │       │
│  │ ad-svc       │             │ social-svc   │             │ admin-svc    │       │
│  ├─────────────┤             ├─────────────┤             ├─────────────┤       │
│  │ 广告位管理   │             │ 好友系统     │             │ 用户管理     │       │
│  │ 广告投放策略 │             │ 分享系统     │             │ 内容管理     │       │
│  │ 收益统计     │             │ 裂变系统     │             │ 数据看板     │       │
│  │ A/B测试     │             │ 互动消息     │             │ 运营配置     │       │
│  │ 激励广告     │             │ 举报系统     │             │ 权限管理     │       │
│  └──────┬──────┘             └──────┬──────┘             └──────┬──────┘       │
│         │                           │                           │               │
│         └───────────────────────────┼───────────────────────────┘               │
│                                     │                                           │
│  ┌──────────────────────────────────▼──────────────────────────────────────────┐ │
│  │                          消息队列 (RabbitMQ / Kafka)                        │ │
│  │  职责：异步处理、削峰填谷、服务解耦、事件驱动                                │ │
│  └──────────────────────────────────────────────────────────────────────────────┘ │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 2.4 管理后台架构

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              管理后台架构设计                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          前端应用 (React + TypeScript)                    │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                          Ant Design Pro                             │ │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │   │
│  │  │  │ 仪表盘   │  │ 用户管理  │  │ 关卡管理  │  │ 活动管理  │            │ │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │ │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │   │
│  │  │  │ 数据分析  │  │ 广告管理  │  │ 商城管理  │  │ 系统设置  │            │ │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                     │                                            │
│                                     ▼                                            │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          后端服务 (Node.js + Express)                     │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │                          Admin API Service                           │ │   │
│  │  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │ │   │
│  │  │  │ 认证授权  │  │ 权限管理  │  │ 操作日志  │  │ 文件上传  │            │ │   │
│  │  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  功能模块清单：                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  1. 数据仪表盘                                                            │   │
│  │     - DAU/MAU/新增用户趋势                                                │   │
│  │     - 收入趋势（广告+内购）                                                │   │
│  │     - 关卡通过率/流失率                                                   │   │
│  │     - 实时在线人数                                                        │   │
│  │                                                                           │   │
│  │  2. 用户管理                                                              │   │
│  │     - 用户列表/搜索/筛选                                                  │   │
│  │     - 用户详情（游戏数据、消费记录）                                       │   │
│  │     - 用户封禁/解封                                                       │   │
│  │     - 用户标签管理                                                        │   │
│  │                                                                           │   │
│  │  3. 关卡管理                                                              │   │
│  │     - 关卡配置（难度、目标、障碍物）                                       │   │
│  │     - 关卡测试工具                                                        │   │
│  │     - 关卡发布/下架                                                       │   │
│  │     - 关卡数据分析                                                        │   │
│  │                                                                           │   │
│  │  4. 活动管理                                                              │   │
│  │     - 活动创建/编辑/删除                                                   │   │
│  │     - 活动排期                                                            │   │
│  │     - 奖励配置                                                            │   │
│  │     - 活动数据统计                                                        │   │
│  │                                                                           │   │
│  │  5. 广告管理                                                              │   │
│  │     - 广告位配置                                                          │   │
│  │     - 广告策略配置                                                        │   │
│  │     - 收益统计                                                            │   │
│  │     - A/B测试配置                                                         │   │
│  │                                                                           │   │
│  │  6. 商城管理                                                              │   │
│  │     - 商品上架/下架                                                       │   │
│  │     - 价格配置                                                            │   │
│  │     - 促销活动                                                            │   │
│  │     - 销售数据                                                            │   │
│  │                                                                           │   │
│  │  7. 数据分析                                                              │   │
│  │     - 用户留存分析                                                        │   │
│  │     - 关卡流失分析                                                        │   │
│  │     - 付费转化漏斗                                                        │   │
│  │     - 自定义报表                                                          │   │
│  │                                                                           │   │
│  │  8. 系统设置                                                              │   │
│  │     - 管理员账号管理                                                      │   │
│  │     - 角色权限配置                                                        │   │
│  │     - 操作日志                                                            │   │
│  │     - 系统配置                                                            │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 技术选型方案

### 3.1 客户端技术栈

| 技术领域 | 选型方案 | 选型理由 | 备选方案 |
|---------|---------|---------|---------|
| **跨端框架** | Taro 3.x | 微信生态支持最好，社区活跃，支持多端 | uni-app |
| **游戏引擎** | Phaser 4.x (保留) | 现有代码基于Phaser，迁移成本低 | Cocos Creator |
| **状态管理** | Zustand (保留) + React Query | 轻量高效，服务端状态管理优秀 | Redux Toolkit |
| **UI组件库** | Taro UI / NutUI | 适配Taro，组件丰富 | Taroify |
| **样式方案** | Tailwind CSS (保留) | 原子化CSS，开发效率高 | Sass/Less |
| **网络请求** | Axios + React Query | 请求缓存、自动重试、状态管理 | SWR |
| **本地存储** | Taro.Storage | 跨端统一存储API | - |

### 3.2 后端服务技术栈

| 技术领域 | 选型方案 | 选型理由 | 备选方案 |
|---------|---------|---------|---------|
| **开发语言** | TypeScript + Node.js | 前后端统一语言，开发效率高 | Go / Java |
| **Web框架** | NestJS | 企业级框架，依赖注入，模块化 | Express / Koa |
| **API规范** | RESTful + GraphQL | RESTful简单直接，GraphQL灵活查询 | gRPC |
| **数据库ORM** | TypeORM / Prisma | TypeScript原生支持，类型安全 | Sequelize |
| **数据库** | MySQL 8.0 + MongoDB | MySQL存核心业务，MongoDB存游戏日志 | PostgreSQL |
| **缓存** | Redis 7.x | 高性能缓存，支持多种数据结构 | Memcached |
| **消息队列** | RabbitMQ | 可靠性高，支持复杂路由 | Kafka |
| **搜索引擎** | Elasticsearch | 日志搜索，数据分析 | - |
| **对象存储** | 阿里云OSS / 腾讯云COS | 静态资源存储，CDN加速 | MinIO |

### 3.3 基础设施技术栈

| 技术领域 | 选型方案 | 选型理由 | 备选方案 |
|---------|---------|---------|---------|
| **容器化** | Docker | 标准化部署环境 | - |
| **编排工具** | Kubernetes (K8s) | 容器编排，自动扩缩容 | Docker Swarm |
| **API网关** | Kong / APISIX | 高性能，插件丰富 | Nginx |
| **服务发现** | Nacos / Consul | 服务注册与发现 | Etcd |
| **配置中心** | Nacos / Apollo | 动态配置管理 | Spring Cloud Config |
| **监控告警** | Prometheus + Grafana | 监控指标采集与可视化 | Zabbix |
| **日志系统** | ELK Stack | 日志收集、存储、分析 | Loki |
| **链路追踪** | Jaeger / SkyWalking | 分布式链路追踪 | Zipkin |
| **CI/CD** | GitHub Actions / GitLab CI | 自动化构建部署 | Jenkins |

### 3.4 管理后台技术栈

| 技术领域 | 选型方案 | 选型理由 | 备选方案 |
|---------|---------|---------|---------|
| **前端框架** | React 18 + TypeScript | 与客户端技术栈统一 | Vue 3 |
| **UI框架** | Ant Design Pro | 企业级解决方案，开箱即用 | Arco Design Pro |
| **状态管理** | Zustand + React Query | 与客户端统一 | Redux Toolkit |
| **图表库** | ECharts / AntV | 数据可视化 | Chart.js |
| **富文本编辑** | TinyMCE / Quill | 内容编辑 | - |

### 3.5 第三方服务选型

| 服务类型 | 选型方案 | 说明 |
|---------|---------|------|
| **云服务商** | 阿里云 / 腾讯云 | 国内访问优化 |
| **CDN** | 阿里云CDN / 腾讯云CDN | 静态资源加速 |
| **短信服务** | 阿里云短信 / 腾讯云短信 | 验证码、通知 |
| **推送服务** | 极光推送 / 个推 | App消息推送 |
| **微信登录** | 微信开放平台 | OAuth授权 |
| **支付服务** | 微信支付 | 内购支付 |
| **广告平台** | 微信广告 / 穿山甲 | 广告变现 |
| **数据分析** | 神策数据 / 友盟+ | 用户行为分析 |
| **错误监控** | Sentry | 异常监控 |

---

## 4. 数据库设计方案

### 4.1 数据库架构

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              数据库架构设计                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          MySQL 主从集群 (核心业务数据)                     │   │
│  │  ┌─────────────────────┐         ┌─────────────────────┐                 │   │
│  │  │    Master (写)      │ ──────▶ │    Slave (读)       │                 │   │
│  │  │  用户、订单、支付    │         │  数据查询、报表     │                 │   │
│  │  └─────────────────────┘         └─────────────────────┘                 │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          MongoDB 分片集群 (游戏日志)                       │   │
│  │  ┌─────────────────────┐         ┌─────────────────────┐                 │   │
│  │  │    Shard 1         │         │    Shard 2         │                 │   │
│  │  │  游戏日志、行为数据  │         │  游戏日志、行为数据  │                 │   │
│  │  └─────────────────────┘         └─────────────────────┘                 │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          Redis 集群 (缓存与会话)                           │   │
│  │  ┌─────────────────────┐         ┌─────────────────────┐                 │   │
│  │  │    Redis Cluster    │         │    Redis Sentinel   │                 │   │
│  │  │  会话、排行榜、缓存  │         │  高可用保障         │                 │   │
│  │  └─────────────────────┘         └─────────────────────┘                 │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          Elasticsearch (日志搜索)                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  系统日志、错误日志、用户行为日志索引                                  │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 4.2 MySQL 数据表设计

#### 4.2.1 用户相关表

```sql
-- 用户基础信息表
CREATE TABLE users (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(128) NOT NULL COMMENT '微信openid',
    unionid VARCHAR(128) COMMENT '微信unionid',
    nickname VARCHAR(64) NOT NULL COMMENT '昵称',
    avatar VARCHAR(512) COMMENT '头像URL',
    gender TINYINT DEFAULT 0 COMMENT '性别 0未知 1男 2女',
    phone VARCHAR(20) COMMENT '手机号',
    status TINYINT DEFAULT 1 COMMENT '状态 1正常 2封禁',
    vip_level TINYINT DEFAULT 0 COMMENT 'VIP等级',
    vip_expire_time DATETIME COMMENT 'VIP过期时间',
    last_login_time DATETIME COMMENT '最后登录时间',
    last_login_ip VARCHAR(64) COMMENT '最后登录IP',
    register_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    register_channel VARCHAR(32) COMMENT '注册渠道',
    device_id VARCHAR(128) COMMENT '设备ID',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_openid (openid),
    UNIQUE KEY uk_unionid (unionid),
    INDEX idx_phone (phone),
    INDEX idx_register_time (register_time),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户基础信息表';

-- 用户游戏数据表
CREATE TABLE user_game_data (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    current_level INT DEFAULT 1 COMMENT '当前关卡',
    total_stars INT DEFAULT 0 COMMENT '总星星数',
    total_score BIGINT DEFAULT 0 COMMENT '总分',
    highest_score BIGINT DEFAULT 0 COMMENT '最高分',
    total_plays INT DEFAULT 0 COMMENT '总游戏次数',
    total_eliminations BIGINT DEFAULT 0 COMMENT '总消除次数',
    energy INT DEFAULT 5 COMMENT '当前能量',
    max_energy INT DEFAULT 5 COMMENT '最大能量',
    energy_recover_time DATETIME COMMENT '能量恢复时间',
    coins INT DEFAULT 0 COMMENT '金币',
    diamonds INT DEFAULT 0 COMMENT '钻石',
    powerups JSON COMMENT '道具数量',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_id (user_id),
    INDEX idx_current_level (current_level),
    INDEX idx_total_score (total_score)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户游戏数据表';

-- 用户关卡进度表
CREATE TABLE user_level_progress (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    level_id INT NOT NULL COMMENT '关卡ID',
    stars TINYINT DEFAULT 0 COMMENT '星星数 1-3',
    highest_score INT DEFAULT 0 COMMENT '最高分',
    completed_times INT DEFAULT 0 COMMENT '完成次数',
    failed_times INT DEFAULT 0 COMMENT '失败次数',
    first_complete_time DATETIME COMMENT '首次完成时间',
    last_play_time DATETIME COMMENT '最后游戏时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_level (user_id, level_id),
    INDEX idx_level_id (level_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户关卡进度表';

-- 用户成就表
CREATE TABLE user_achievements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    achievement_id VARCHAR(32) NOT NULL COMMENT '成就ID',
    unlocked TINYINT DEFAULT 0 COMMENT '是否解锁',
    unlock_time DATETIME COMMENT '解锁时间',
    progress INT DEFAULT 0 COMMENT '进度',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_achievement (user_id, achievement_id),
    INDEX idx_unlocked (unlocked)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户成就表';

-- 用户皮肤表
CREATE TABLE user_skins (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    skin_id VARCHAR(32) NOT NULL COMMENT '皮肤ID',
    owned TINYINT DEFAULT 0 COMMENT '是否拥有',
    active TINYINT DEFAULT 0 COMMENT '是否使用中',
    acquire_time DATETIME COMMENT '获取时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_skin (user_id, skin_id),
    INDEX idx_active (active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户皮肤表';

-- 用户签到表
CREATE TABLE user_sign_in (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    sign_date DATE NOT NULL COMMENT '签到日期',
    continuous_days INT DEFAULT 1 COMMENT '连续签到天数',
    total_days INT DEFAULT 1 COMMENT '累计签到天数',
    reward_claimed TINYINT DEFAULT 0 COMMENT '奖励是否已领取',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_date (user_id, sign_date),
    INDEX idx_sign_date (sign_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户签到表';
```

#### 4.2.2 关卡配置表

```sql
-- 关卡配置表
CREATE TABLE levels (
    id INT PRIMARY KEY AUTO_INCREMENT,
    level_id INT NOT NULL COMMENT '关卡ID',
    name VARCHAR(64) NOT NULL COMMENT '关卡名称',
    type VARCHAR(16) NOT NULL COMMENT '关卡类型 score/obstacle/collect',
    target_score INT NOT NULL COMMENT '目标分数',
    target_obstacles INT DEFAULT 0 COMMENT '目标障碍物数',
    target_collect INT DEFAULT 0 COMMENT '目标收集数',
    collect_type VARCHAR(16) COMMENT '收集类型',
    moves INT NOT NULL COMMENT '步数',
    board_width INT NOT NULL COMMENT '棋盘宽度',
    board_height INT NOT NULL COMMENT '棋盘高度',
    obstacles JSON COMMENT '障碍物配置',
    rewards JSON COMMENT '奖励配置',
    difficulty TINYINT DEFAULT 1 COMMENT '难度 1-5',
    status TINYINT DEFAULT 1 COMMENT '状态 1上线 2下线',
    version INT DEFAULT 1 COMMENT '版本号',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_level_id (level_id),
    INDEX idx_status (status),
    INDEX idx_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关卡配置表';

-- 关卡统计数据表
CREATE TABLE level_statistics (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    level_id INT NOT NULL COMMENT '关卡ID',
    stat_date DATE NOT NULL COMMENT '统计日期',
    play_count INT DEFAULT 0 COMMENT '游戏次数',
    pass_count INT DEFAULT 0 COMMENT '通过次数',
    fail_count INT DEFAULT 0 COMMENT '失败次数',
    pass_rate DECIMAL(5,2) DEFAULT 0 COMMENT '通过率',
    avg_score INT DEFAULT 0 COMMENT '平均分',
    avg_moves INT DEFAULT 0 COMMENT '平均步数',
    avg_time INT DEFAULT 0 COMMENT '平均用时(秒)',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_level_date (level_id, stat_date),
    INDEX idx_stat_date (stat_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='关卡统计数据表';
```

#### 4.2.3 商城相关表

```sql
-- 商品配置表
CREATE TABLE shop_items (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    item_id VARCHAR(32) NOT NULL COMMENT '商品ID',
    name VARCHAR(64) NOT NULL COMMENT '商品名称',
    description VARCHAR(256) COMMENT '商品描述',
    icon VARCHAR(512) COMMENT '商品图标',
    type VARCHAR(16) NOT NULL COMMENT '商品类型 powerup/energy/skin/special',
    price INT NOT NULL COMMENT '价格',
    currency VARCHAR(16) NOT NULL COMMENT '货币类型 coins/diamonds/cny',
    amount INT COMMENT '数量',
    original_price INT COMMENT '原价(用于折扣显示)',
    discount TINYINT DEFAULT 100 COMMENT '折扣(百分比)',
    stock INT DEFAULT -1 COMMENT '库存 -1无限',
    daily_limit INT DEFAULT -1 COMMENT '每日限购 -1无限',
    status TINYINT DEFAULT 1 COMMENT '状态 1上架 2下架',
    sort_order INT DEFAULT 0 COMMENT '排序',
    start_time DATETIME COMMENT '开始时间',
    end_time DATETIME COMMENT '结束时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_item_id (item_id),
    INDEX idx_status (status),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='商品配置表';

-- 用户购买记录表
CREATE TABLE user_purchases (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    item_id VARCHAR(32) NOT NULL COMMENT '商品ID',
    order_no VARCHAR(64) NOT NULL COMMENT '订单号',
    price INT NOT NULL COMMENT '价格',
    currency VARCHAR(16) NOT NULL COMMENT '货币类型',
    status TINYINT DEFAULT 1 COMMENT '状态 1成功 2失败',
    purchase_time DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '购买时间',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_purchase_time (purchase_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户购买记录表';
```

#### 4.2.4 活动相关表

```sql
-- 活动配置表
CREATE TABLE activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    activity_id VARCHAR(32) NOT NULL COMMENT '活动ID',
    name VARCHAR(64) NOT NULL COMMENT '活动名称',
    type VARCHAR(16) NOT NULL COMMENT '活动类型 festival/limited/daily/weekly',
    description TEXT COMMENT '活动描述',
    icon VARCHAR(512) COMMENT '活动图标',
    banner VARCHAR(512) COMMENT '活动横幅',
    start_time DATETIME NOT NULL COMMENT '开始时间',
    end_time DATETIME NOT NULL COMMENT '结束时间',
    config JSON COMMENT '活动配置',
    rewards JSON COMMENT '奖励配置',
    status TINYINT DEFAULT 1 COMMENT '状态 1启用 2禁用',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_activity_id (activity_id),
    INDEX idx_status_time (status, start_time, end_time)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='活动配置表';

-- 用户活动参与表
CREATE TABLE user_activities (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    activity_id VARCHAR(32) NOT NULL COMMENT '活动ID',
    progress INT DEFAULT 0 COMMENT '进度',
    completed TINYINT DEFAULT 0 COMMENT '是否完成',
    reward_claimed TINYINT DEFAULT 0 COMMENT '奖励是否已领取',
    extra_data JSON COMMENT '额外数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_activity (user_id, activity_id),
    INDEX idx_activity_id (activity_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户活动参与表';

-- 每日挑战配置表
CREATE TABLE daily_challenges (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    challenge_date DATE NOT NULL COMMENT '挑战日期',
    type VARCHAR(16) NOT NULL COMMENT '挑战类型 score/stars/levels',
    target INT NOT NULL COMMENT '目标值',
    reward_coins INT DEFAULT 0 COMMENT '金币奖励',
    reward_diamonds INT DEFAULT 0 COMMENT '钻石奖励',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_date (challenge_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='每日挑战配置表';
```

#### 4.2.5 支付相关表

```sql
-- 订单表
CREATE TABLE orders (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL COMMENT '订单号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    product_id VARCHAR(32) NOT NULL COMMENT '商品ID',
    product_name VARCHAR(64) COMMENT '商品名称',
    amount INT NOT NULL COMMENT '金额(分)',
    currency VARCHAR(16) DEFAULT 'CNY' COMMENT '货币',
    status TINYINT DEFAULT 1 COMMENT '状态 1待支付 2已支付 3已取消 4已退款',
    pay_channel VARCHAR(16) COMMENT '支付渠道 wechat/alipay',
    pay_time DATETIME COMMENT '支付时间',
    transaction_id VARCHAR(128) COMMENT '第三方交易号',
    extra_data JSON COMMENT '额外数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 支付流水表
CREATE TABLE payment_transactions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    order_no VARCHAR(64) NOT NULL COMMENT '订单号',
    transaction_id VARCHAR(128) COMMENT '第三方交易号',
    user_id BIGINT NOT NULL COMMENT '用户ID',
    amount INT NOT NULL COMMENT '金额(分)',
    currency VARCHAR(16) DEFAULT 'CNY' COMMENT '货币',
    pay_channel VARCHAR(16) NOT NULL COMMENT '支付渠道',
    status TINYINT DEFAULT 1 COMMENT '状态 1成功 2失败',
    callback_data JSON COMMENT '回调数据',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_order_no (order_no),
    INDEX idx_user_id (user_id),
    INDEX idx_transaction_id (transaction_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='支付流水表';
```

#### 4.2.6 广告相关表

```sql
-- 广告位配置表
CREATE TABLE ad_placements (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    placement_id VARCHAR(32) NOT NULL COMMENT '广告位ID',
    name VARCHAR(64) NOT NULL COMMENT '广告位名称',
    type VARCHAR(16) NOT NULL COMMENT '广告类型 banner/interstitial/rewarded',
    position VARCHAR(32) COMMENT '位置',
    status TINYINT DEFAULT 1 COMMENT '状态 1启用 2禁用',
    config JSON COMMENT '配置',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_placement_id (placement_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告位配置表';

-- 广告展示记录表
CREATE TABLE ad_impressions (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    placement_id VARCHAR(32) NOT NULL COMMENT '广告位ID',
    ad_type VARCHAR(16) NOT NULL COMMENT '广告类型',
    ad_network VARCHAR(32) COMMENT '广告网络',
    action VARCHAR(16) NOT NULL COMMENT '动作 show/click/close/reward',
    revenue DECIMAL(10,6) DEFAULT 0 COMMENT '收益',
    device_id VARCHAR(128) COMMENT '设备ID',
    ip VARCHAR(64) COMMENT 'IP地址',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_placement_id (placement_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='广告展示记录表';
```

#### 4.2.7 社交相关表

```sql
-- 用户好友关系表
CREATE TABLE user_friends (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    friend_id BIGINT NOT NULL COMMENT '好友ID',
    status TINYINT DEFAULT 1 COMMENT '状态 1正常 2删除',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uk_user_friend (user_id, friend_id),
    INDEX idx_friend_id (friend_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户好友关系表';

-- 排行榜表
CREATE TABLE leaderboards (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    leaderboard_type VARCHAR(16) NOT NULL COMMENT '排行榜类型 global/weekly/daily',
    score BIGINT NOT NULL COMMENT '分数',
    rank INT COMMENT '排名',
    season VARCHAR(16) COMMENT '赛季',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uk_type_user_season (leaderboard_type, user_id, season),
    INDEX idx_score (score DESC)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='排行榜表';

-- 分享记录表
CREATE TABLE share_records (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    user_id BIGINT NOT NULL COMMENT '用户ID',
    share_type VARCHAR(16) NOT NULL COMMENT '分享类型',
    share_platform VARCHAR(16) COMMENT '分享平台',
    share_content VARCHAR(512) COMMENT '分享内容',
    reward_claimed TINYINT DEFAULT 0 COMMENT '奖励是否已领取',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='分享记录表';
```

### 4.3 MongoDB 集合设计

```javascript
// 游戏日志集合
db.game_logs.createIndex({ "user_id": 1, "created_at": -1 })
db.game_logs.createIndex({ "level_id": 1, "created_at": -1 })

// 文档结构
{
    "_id": ObjectId,
    "user_id": NumberLong,
    "level_id": NumberInt,
    "session_id": String,
    "action": String,  // start, end, move, match, use_powerup, etc.
    "data": {
        "score": NumberInt,
        "moves": NumberInt,
        "tiles_matched": NumberInt,
        "powerups_used": NumberInt,
        "duration": NumberInt,  // 游戏时长(秒)
        "result": String  // win, lose, quit
    },
    "device": {
        "platform": String,
        "model": String,
        "os_version": String,
        "app_version": String
    },
    "created_at": ISODate
}

// 用户行为日志集合
db.user_behavior_logs.createIndex({ "user_id": 1, "created_at": -1 })
db.user_behavior_logs.createIndex({ "event_type": 1, "created_at": -1 })

// 文档结构
{
    "_id": ObjectId,
    "user_id": NumberLong,
    "session_id": String,
    "event_type": String,  // page_view, button_click, ad_watch, purchase, etc.
    "event_name": String,
    "properties": {
        // 自定义属性
    },
    "device": {
        "platform": String,
        "model": String,
        "os_version": String,
        "app_version": String
    },
    "created_at": ISODate
}

// 错误日志集合
db.error_logs.createIndex({ "created_at": -1 })
db.error_logs.createIndex({ "user_id": 1, "created_at": -1 })

// 文档结构
{
    "_id": ObjectId,
    "user_id": NumberLong,
    "error_type": String,
    "error_message": String,
    "error_stack": String,
    "context": {
        "page": String,
        "action": String
    },
    "device": {
        "platform": String,
        "model": String,
        "os_version": String,
        "app_version": String
    },
    "created_at": ISODate
}
```

### 4.4 Redis 缓存设计

```
# 用户会话
session:{session_id} -> JSON.stringify(user_info)
TTL: 7天

# 用户数据缓存
user:data:{user_id} -> JSON.stringify(user_game_data)
TTL: 1小时

# 能量恢复队列
user:energy:recover -> ZSET (score: 恢复时间戳, member: user_id)

# 排行榜
leaderboard:global -> ZSET (score: 分数, member: user_id)
leaderboard:weekly:{week} -> ZSET
leaderboard:daily:{date} -> ZSET

# 好友排行榜
leaderboard:friends:{user_id} -> ZSET

# 每日挑战
daily:challenge:{date} -> JSON.stringify(challenge_config)
TTL: 1天

# 活动缓存
activity:{activity_id} -> JSON.stringify(activity_config)
TTL: 1小时

# 关卡配置缓存
level:config:{level_id} -> JSON.stringify(level_config)
TTL: 1天

# 商品库存
shop:item:stock:{item_id} -> INT

# 用户每日购买限制
user:daily:purchase:{user_id}:{item_id}:{date} -> INT
TTL: 1天

# 广告展示频率限制
ad:limit:{user_id}:{placement_id}:{date} -> INT
TTL: 1天

# 分布式锁
lock:order:{order_no} -> 1
TTL: 30秒

# 接口限流
ratelimit:{api}:{user_id}:{minute} -> INT
TTL: 1分钟
```

---

## 5. API接口设计

### 5.1 API设计规范

#### 5.1.1 基础规范

```
基础URL: https://api.sweetmatch.com/v1

请求头:
  Authorization: Bearer {token}
  Content-Type: application/json
  X-Platform: wechat|h5|ios|android
  X-Version: 1.0.0
  X-Device-Id: {device_id}

响应格式:
{
    "code": 0,           // 0成功，非0失败
    "message": "success",
    "data": {},          // 业务数据
    "timestamp": 1717747200000
}

错误码规范:
  0: 成功
  1000-1999: 客户端错误
  2000-2999: 服务端错误
  3000-3999: 业务错误
  4000-4999: 第三方服务错误
```

#### 5.1.2 接口版本管理

```
URL路径版本: /v1/users, /v2/users
向后兼容: 新版本保留旧版本接口
废弃策略: 废弃接口返回警告头，6个月后下线
```

### 5.2 核心API接口清单

#### 5.2.1 用户模块

```yaml
# 用户认证
POST   /v1/auth/wechat/login          # 微信登录
POST   /v1/auth/refresh-token         # 刷新Token
POST   /v1/auth/logout                # 登出

# 用户信息
GET    /v1/users/me                   # 获取当前用户信息
PUT    /v1/users/me                   # 更新用户信息
GET    /v1/users/me/game-data         # 获取游戏数据
PUT    /v1/users/me/game-data         # 更新游戏数据(离线同步)

# 用户设置
GET    /v1/users/me/settings          # 获取用户设置
PUT    /v1/users/me/settings          # 更新用户设置
```

#### 5.2.2 游戏模块

```yaml
# 关卡
GET    /v1/levels                     # 获取关卡列表
GET    /v1/levels/{levelId}           # 获取关卡详情
POST   /v1/levels/{levelId}/start     # 开始关卡
POST   /v1/levels/{levelId}/end       # 结束关卡

# 游戏进度
GET    /v1/progress                   # 获取游戏进度
POST   /v1/progress/sync              # 同步游戏进度

# 成就
GET    /v1/achievements               # 获取成就列表
POST   /v1/achievements/{id}/claim    # 领取成就奖励

# 排行榜
GET    /v1/leaderboards/{type}        # 获取排行榜
GET    /v1/leaderboards/{type}/me     # 获取我的排名

# 每日挑战
GET    /v1/daily-challenge            # 获取每日挑战
POST   /v1/daily-challenge/claim      # 领取每日挑战奖励
```

#### 5.2.3 商城模块

```yaml
# 商品
GET    /v1/shop/items                 # 获取商品列表
GET    /v1/shop/items/{itemId}        # 获取商品详情

# 购买
POST   /v1/shop/purchase              # 购买商品(虚拟货币)
POST   /v1/orders                     # 创建订单(真实货币)
GET    /v1/orders/{orderNo}           # 获取订单详情
POST   /v1/orders/{orderNo}/pay       # 支付订单
```

#### 5.2.4 活动模块

```yaml
# 活动
GET    /v1/activities                 # 获取活动列表
GET    /v1/activities/{activityId}    # 获取活动详情
POST   /v1/activities/{activityId}/join    # 参加活动
POST   /v1/activities/{activityId}/claim   # 领取活动奖励

# 签到
GET    /v1/sign-in                    # 获取签到状态
POST   /v1/sign-in                    # 签到
POST   /v1/sign-in/claim              # 领取签到奖励
```

#### 5.2.5 社交模块

```yaml
# 好友
GET    /v1/friends                    # 获取好友列表
POST   /v1/friends/request            # 发送好友请求
PUT    /v1/friends/request/{id}       # 处理好友请求
DELETE /v1/friends/{friendId}         # 删除好友

# 分享
POST   /v1/share                      # 记录分享
POST   /v1/share/claim                # 领取分享奖励
```

#### 5.2.6 广告模块

```yaml
# 广告
GET    /v1/ads/placements             # 获取广告位配置
POST   /v1/ads/impression             # 记录广告展示
POST   /v1/ads/click                  # 记录广告点击
POST   /v1/ads/reward                 # 记录激励广告完成
```

#### 5.2.7 通知模块

```yaml
# 通知
GET    /v1/notifications              # 获取通知列表
PUT    /v1/notifications/{id}/read   # 标记已读
PUT    /v1/notifications/read-all    # 全部标记已读
```

### 5.3 管理后台API接口

```yaml
# 仪表盘
GET    /admin/dashboard/stats         # 获取统计数据
GET    /admin/dashboard/trends        # 获取趋势数据

# 用户管理
GET    /admin/users                   # 获取用户列表
GET    /admin/users/{id}              # 获取用户详情
PUT    /admin/users/{id}/status       # 更新用户状态
GET    /admin/users/{id}/game-data   # 获取用户游戏数据

# 关卡管理
GET    /admin/levels                  # 获取关卡列表
POST   /admin/levels                  # 创建关卡
PUT    /admin/levels/{id}             # 更新关卡
DELETE /admin/levels/{id}             # 删除关卡
PUT    /admin/levels/{id}/status      # 更新关卡状态

# 活动管理
GET    /admin/activities              # 获取活动列表
POST   /admin/activities              # 创建活动
PUT    /admin/activities/{id}         # 更新活动
DELETE /admin/activities/{id}         # 删除活动

# 商品管理
GET    /admin/shop/items              # 获取商品列表
POST   /admin/shop/items              # 创建商品
PUT    /admin/shop/items/{id}         # 更新商品
DELETE /admin/shop/items/{id}         # 删除商品

# 广告管理
GET    /admin/ads/placements          # 获取广告位列表
PUT    /admin/ads/placements/{id}     # 更新广告位配置
GET    /admin/ads/statistics          # 获取广告统计

# 数据分析
GET    /admin/analytics/retention     # 留存分析
GET    /admin/analytics/conversion    # 转化分析
GET    /admin/analytics/level         # 关卡分析
GET    /admin/analytics/revenue       # 收入分析

# 系统设置
GET    /admin/settings               # 获取系统设置
PUT    /admin/settings               # 更新系统设置
GET    /admin/administrators         # 获取管理员列表
POST   /admin/administrators         # 创建管理员
DELETE /admin/administrators/{id}    # 删除管理员
```

### 5.4 WebSocket 事件设计

```javascript
// 连接
ws://api.sweetmatch.com/ws?token={token}

// 客户端事件
{
    "event": "game:start",
    "data": { "level_id": 1 }
}

{
    "event": "game:move",
    "data": { "x1": 0, "y1": 0, "x2": 1, "y2": 0 }
}

{
    "event": "game:end",
    "data": { "score": 1000, "result": "win" }
}

// 服务端事件
{
    "event": "energy:recover",
    "data": { "energy": 5 }
}

{
    "event": "friend:request",
    "data": { "from_user": {...} }
}

{
    "event": "activity:start",
    "data": { "activity": {...} }
}

{
    "event": "notification",
    "data": { "type": "system", "content": "..." }
}
```

---

## 6. 营销功能规划

### 6.1 用户留存分析系统

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              用户留存分析系统                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          留存指标体系                                     │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 次日留存率   │  │ 7日留存率   │  │ 30日留存率  │  │ LTV分析     │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          留存影响因素分析                                  │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 关卡难度    │  │ 奖励机制    │  │ 社交互动    │  │ 活动参与    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 广告频率    │  │ 能量系统    │  │ 推送策略    │  │ 新手引导    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          留存提升策略                                      │   │
│  │  1. 新手引导优化                                                          │   │
│  │     - 前3关难度动态调整                                                    │   │
│  │     - 新手礼包引导                                                        │   │
│  │     - 首次登录奖励                                                        │   │
│  │                                                                           │   │
│  │  2. 召回机制                                                              │   │
│  │     - 流失用户识别(3/7/14天未登录)                                        │   │
│  │     - 召回推送策略                                                        │   │
│  │     - 召回奖励配置                                                        │   │
│  │                                                                           │   │
│  │  3. 签到系统                                                              │   │
│  │     - 连续签到奖励递增                                                    │   │
│  │     - 断签补签机制                                                        │   │
│  │     - 周期性签到活动                                                      │   │
│  │                                                                           │   │
│  │  4. 推送策略                                                              │   │
│  │     - 能量恢复提醒                                                        │   │
│  │     - 活动开始提醒                                                        │   │
│  │     - 好友互动提醒                                                        │   │
│  │     - 个性化推送(基于用户行为)                                            │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.2 活动管理系统

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              活动管理系统                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          活动类型                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 节日活动    │  │ 限时活动    │  │ 日常活动    │  │ 周常活动    │      │   │
│  │  │ 春节/情人节 │  │ 限时折扣    │  │ 每日任务    │  │ 周赛排行    │      │   │
│  │  │ 中秋/国庆   │  │ 限时关卡    │  │ 签到奖励    │  │ 周常任务    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          活动配置系统                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  活动基础信息                                                         │ │   │
│  │  │  - 活动ID、名称、描述、图标、横幅                                      │ │   │
│  │  │  - 开始时间、结束时间、状态                                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  活动规则配置                                                         │ │   │
│  │  │  - 参与条件(等级、VIP、新用户等)                                      │ │   │
│  │  │  - 任务目标(分数、关卡、消除等)                                       │ │   │
│  │  │  - 进度计算规则                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  奖励配置                                                             │ │   │
│  │  │  - 阶段奖励(进度里程碑)                                              │ │   │
│  │  │  - 完成奖励                                                           │ │   │
│  │  │  - 排名奖励(排行榜活动)                                              │ │   │
│  │  │  - 奖励类型(金币、钻石、道具、皮肤)                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          活动示例                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  春节活动                                                             │ │   │
│  │  │  - 时间: 2026-01-29 ~ 2026-02-12                                    │ │   │
│  │  │  - 任务: 每日完成3关、累计消除1000个糖果、分享3次                     │ │   │
│  │  │  - 奖励: 金币x500/天、限定皮肤(累计7天)、钻石x100(完成全部任务)       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  限时挑战赛                                                           │ │   │
│  │  │  - 时间: 每周六 20:00-22:00                                          │ │   │
│  │  │  - 规则: 限时内完成指定关卡，按分数排名                               │ │   │
│  │  │  - 奖励: 前100名获得钻石奖励                                         │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.3 优惠券/礼包系统

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              优惠券/礼包系统                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          礼包类型                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 新手礼包    │  │ 签到礼包    │  │ 活动礼包    │  │ 兑换码礼包  │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ VIP礼包     │  │ 召回礼包    │  │ 节日礼包    │  │ 分享礼包    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          礼包配置                                          │   │
│  │  {                                                                         │   │
│  │    "gift_id": "newbie_pack_001",                                          │   │
│  │    "name": "新手礼包",                                                     │   │
│  │    "type": "newbie",                                                       │   │
│  │    "description": "欢迎来到甜趣点点消！",                                  │   │
│  │    "icon": "https://xxx.com/gift/newbie.png",                             │   │
│  │    "rewards": [                                                            │   │
│  │      { "type": "coins", "amount": 1000 },                                 │   │
│  │      { "type": "energy", "amount": 10 },                                  │   │
│  │      { "type": "powerups", "item": "hammer", "amount": 3 }                │   │
│  │    ],                                                                      │   │
│  │    "conditions": {                                                         │   │
│  │      "register_days": 7,  // 注册7天内可领取                              │   │
│  │      "max_claim": 1        // 最多领取1次                                  │   │
│  │    },                                                                      │   │
│  │    "valid_from": "2026-01-01T00:00:00Z",                                  │   │
│  │    "valid_to": "2026-12-31T23:59:59Z"                                     │   │
│  │  }                                                                         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          兑换码系统                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  兑换码类型                                                           │ │   │
│  │  │  - 通用码: 所有用户可兑换                                            │ │   │
│  │  │  - 限量码: 限制兑换次数                                               │ │   │
│  │  │  - 专属码: 指定用户可兑换                                             │ │   │
│  │  │  - 渠道码: 指定渠道用户可兑换                                         │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  兑换码配置                                                           │ │   │
│  │  │  - 兑换码前缀/长度                                                   │ │   │
│  │  │  - 有效期                                                            │ │   │
│  │  │  - 使用限制(每用户/总次数)                                           │ │   │
│  │  │  - 关联礼包                                                          │ │   │
│  │  │  - 批量生成数量                                                      │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          优惠券系统                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  优惠券类型                                                           │ │   │
│  │  │  - 满减券: 满100减20                                                 │ │   │
│  │  │  - 折扣券: 8折优惠券                                                 │ │   │
│  │  │  - 免费券: 免费获得指定商品                                          │ │   │
│  │  │  - 能量券: 免费恢复能量                                              │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  发放策略                                                             │ │   │
│  │  │  - 自动发放(新注册、签到、活动)                                      │ │   │
│  │  │  - 手动发放(运营活动)                                                │ │   │
│  │  │  - 条件触发(流失召回、首充)                                          │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.4 推送通知系统

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              推送通知系统                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          推送渠道                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 小程序订阅  │  │ 模板消息    │  │ App推送     │  │ 站内信      │      │   │
│  │  │ 消息       │  │             │  │ (极光/个推) │  │             │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          推送场景                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  系统通知                                                             │ │   │
│  │  │  - 能量恢复提醒                                                       │ │   │
│  │  │  - 活动开始提醒                                                       │ │   │
│  │  │  - 好友请求通知                                                       │ │   │
│  │  │  - 排行榜变化通知                                                     │ │   │
│  │  │  - 成就达成通知                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  运营推送                                                             │ │   │
│  │  │  - 新活动上线                                                        │ │   │
│  │  │  - 限时优惠                                                           │ │   │
│  │  │  - 节日祝福                                                           │ │   │
│  │  │  - 版本更新                                                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  召回推送                                                             │ │   │
│  │  │  - 流失用户召回(3/7/14天未登录)                                      │ │   │
│  │  │  - 专属奖励推送                                                       │ │   │
│  │  │  - 好友互动提醒                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          推送策略                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  时间策略                                                             │ │   │
│  │  │  - 允许推送时段: 09:00-22:00                                         │ │   │
│  │  │  - 用户活跃时段优先                                                   │ │   │
│  │  │  - 避免深夜打扰                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  频率策略                                                             │ │   │
│  │  │  - 同类型推送间隔: 最少4小时                                         │ │   │
│  │  │  - 每日推送上限: 5条                                                  │ │   │
│  │  │  - 用户可自定义设置                                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  个性化策略                                                           │ │   │
│  │  │  - 基于用户行为分析                                                   │ │   │
│  │  │  - 基于用户偏好设置                                                   │ │   │
│  │  │  - A/B测试推送内容                                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 6.5 分享裂变系统

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              分享裂变系统                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          分享场景                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 通关分享    │  │ 排行榜分享  │  │ 活动分享    │  │ 邀请好友    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          邀请奖励机制                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  邀请人奖励                                                           │ │   │
│  │  │  - 首次邀请成功: 金币x200                                            │ │   │
│  │  │  - 邀请好友达到指定等级: 额外奖励                                    │ │   │
│  │  │  - 累计邀请奖励: 邀请越多奖励越丰厚                                  │ │   │
│  │  │    - 邀请3人: 钻石x50                                                │ │   │
│  │  │    - 邀请10人: 限定皮肤                                              │ │   │
│  │  │    - 邀请50人: VIP特权                                               │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  被邀请人奖励                                                         │ │   │
│  │  │  - 通过邀请链接注册: 新手大礼包                                      │ │   │
│  │  │  - 额外金币/能量                                                      │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          分享内容配置                                       │   │
│  │  {                                                                         │   │
│  │    "share_type": "level_complete",                                        │   │
│  │    "title": "我在甜趣点点消第{level}关获得了{score}分！",                 │   │
│  │    "description": "快来挑战我吧！",                                        │   │
│  │    "image": "https://xxx.com/share/level.png",                            │   │
│  │    "path": "/pages/game/index?level={level}&inviter={user_id}",           │   │
│  │    "rewards": [                                                            │   │
│  │      { "type": "coins", "amount": 50, "daily_limit": 3 }                  │   │
│  │    ]                                                                       │   │
│  │  }                                                                         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          裂变效果追踪                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  追踪指标                                                             │ │   │
│  │  │  - 分享次数、分享人数                                                │ │   │
│  │  │  - 点击次数、点击人数                                                │ │   │
│  │  │  - 注册转化率                                                        │ │   │
│  │  │  - 邀请成功率                                                        │ │   │
│  │  │  - K因子(病毒系数)                                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  渠道分析                                                             │ │   │
│  │  │  - 微信好友会话                                                      │ │   │
│  │  │  - 微信朋友圈                                                        │ │   │
│  │  │  - 微信群聊                                                          │ │   │
│  │  │  - 其他平台                                                          │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. 市场运营功能

### 7.1 数据统计仪表盘

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              数据统计仪表盘                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          核心指标                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ DAU         │  │ MAU         │  │ 新增用户    │  │ 付费率      │      │   │
│  │  │ 12,345      │  │ 234,567     │  │ 1,234       │  │ 3.5%        │      │   │
│  │  │ ↑5.2%       │  │ ↑8.1%       │  │ ↑12.3%      │  │ ↑0.2%       │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ ARPU        │  │ ARPPU       │  │ LTV(7日)    │  │ 在线人数    │      │   │
│  │  │ ¥0.85       │  │ ¥24.5       │  │ ¥3.2        │  │ 1,234       │      │   │
│  │  │ ↑3.1%       │  │ ↑5.6%       │  │ ↑8.9%       │  │ 实时       │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          趋势图表                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  用户增长趋势 (折线图)                                               │ │   │
│  │  │  - 新增用户、活跃用户、累计用户                                      │ │   │
│  │  │  - 时间维度: 今日/7日/30日/自定义                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  收入趋势 (柱状图+折线图)                                            │ │   │
│  │  │  - 广告收入、内购收入、总收入                                        │ │   │
│  │  │  - 时间维度: 今日/7日/30日/自定义                                    │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  留存趋势 (折线图)                                                   │ │   │
│  │  │  - 次日留存、7日留存、30日留存                                       │ │   │
│  │  │  - 时间维度: 今日/7日/30日/自定义                                    │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          实时数据                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 实时在线    │  │ 今日新增    │  │ 今日收入    │  │ 今日游戏局数│      │   │
│  │  │ 1,234       │  │ 456         │  │ ¥1,234.5    │  │ 12,345      │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 用户行为分析

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              用户行为分析                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          用户画像                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 年龄分布    │  │ 性别比例    │  │ 地区分布    │  │ 设备分布    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 游戏时长    │  │ 付费能力    │  │ 活跃时段    │  │ 游戏偏好    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          行为漏斗                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  注册 → 完成新手引导 → 完成第1关 → 完成第5关 → 首次付费 → 持续付费  │ │   │
│  │  │  100%    85%            70%          45%          5%          2%      │ │   │
│  │  │  ─────────────────────────────────────────────────────────────────── │ │   │
│  │  │  分析各环节转化率，识别流失节点                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          行为路径                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  用户行为路径追踪                                                     │ │   │
│  │  │  - 启动 → 首页 → 关卡选择 → 游戏 → 结算 → 分享                      │ │   │
│  │  │  - 启动 → 商城 → 浏览 → 购买 → 支付                                  │ │   │
│  │  │  - 启动 → 活动页 → 参与活动 → 领奖                                   │ │   │
│  │  │  - 识别关键路径和流失点                                               │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          用户分群                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 高价值用户  │  │ 活跃用户    │  │ 流失风险用户│  │ 新用户      │      │   │
│  │  │ (高付费)    │  │ (高频)      │  │ (低活跃)    │  │ (注册7天内) │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 付费用户    │  │ 免费用户    │  │ 召回用户    │  │ 沉默用户    │      │   │
│  │  │ (有付费)    │  │ (无付费)    │  │ (回归)      │  │ (长期未活跃)│      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │                                                                           │   │
│  │  分群应用：                                                                │   │
│  │  - 精准推送：针对不同用户群体推送不同内容                                  │   │
│  │  - 活动定向：为特定用户群体定制活动                                       │   │
│  │  - 广告定向：优化广告投放策略                                             │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.3 广告收益分析

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              广告收益分析                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          广告指标                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 展示量      │  │ 点击率(CTR) │  │ eCPM       │  │ 广告收入    │      │   │
│  │  │ 1,234,567   │  │ 2.5%        │  │ ¥15.8      │  │ ¥19,523.4   │      │   │
│  │  │ ↑10.2%      │  │ ↑0.3%       │  │ ↑5.1%      │  │ ↑15.8%      │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 激励广告    │  │ 插屏广告    │  │ Banner广告  │  │ 人均广告收入│      │   │
│  │  │ ¥12,345.6   │  │ ¥5,678.9    │  │ ¥1,498.9   │  │ ¥0.45       │      │   │
│  │  │ 63%         │  │ 29%         │  │ 8%         │  │ ↑8.2%       │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          广告位分析                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  广告位         展示量      点击率    eCPM    收入      占比        │ │   │
│  │  │  ─────────────────────────────────────────────────────────────────── │ │   │
│  │  │  通关奖励       500,000     3.2%     ¥18.5   ¥9,250    47%         │ │   │
│  │  │  能量恢复       300,000     2.8%     ¥16.2   ¥4,860    25%         │ │   │
│  │  │  首页插屏       200,000     2.1%     ¥12.3   ¥2,460    13%         │ │   │
│  │  │  商城Banner     150,000     1.5%     ¥8.5    ¥1,275    7%          │ │   │
│  │  │  其他           84,567      1.8%     ¥10.2   ¥862      8%          │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          广告优化策略                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  展示频率控制                                                         │ │   │
│  │  │  - 激励广告: 无限制(用户主动触发)                                     │ │   │
│  │  │  - 插屏广告: 每局结束后最多1次，间隔至少3分钟                         │ │   │
│  │  │  - Banner广告: 持续展示，不影响游戏体验                               │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  场景化投放                                                           │ │   │
│  │  │  - 通关失败: 推荐激励广告获取额外步数                                 │ │   │
│  │  │  - 能量不足: 推荐激励广告恢复能量                                     │ │   │
│  │  │  - 商城购买: 推荐激励广告获取折扣                                     │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  A/B测试                                                              │ │   │
│  │  │  - 广告位位置测试                                                     │ │   │
│  │  │  - 广告频率测试                                                       │ │   │
│  │  │  - 广告样式测试                                                       │ │   │
│  │  │  - 激励金额测试                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.4 关卡流失分析

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              关卡流失分析                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          关卡漏斗                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  关卡  到达人数  通过人数  通过率  平均步数  平均分  流失率         │ │   │
│  │  │  ─────────────────────────────────────────────────────────────────── │ │   │
│  │  │  1     10,000    9,500     95%     12        1,200   5%             │ │   │
│  │  │  2     9,500     8,800     93%     15        1,500   7%             │ │   │
│  │  │  3     8,800     7,900     90%     18        1,800   10%            │ │   │
│  │  │  ...                                                                  │ │   │
│  │  │  15    5,000      3,500     70%     25        2,500   30%  ⚠️       │ │   │
│  │  │  ...                                                                  │ │   │
│  │  │  30    2,000      1,200     60%     30        3,000   40%  🔴       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          流失原因分析                                       │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  流失节点分析 (以第15关为例)                                         │ │   │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐│ │   │
│  │  │  │  失败原因分布:                                                  ││ │   │
│  │  │  │  - 步数用尽: 45%                                                ││ │   │
│  │  │  │  - 分数不够: 35%                                                ││ │   │
│  │  │  │  - 障碍物未清除: 15%                                            ││ │   │
│  │  │  │  - 收集目标未完成: 5%                                           ││ │   │
│  │  │  └─────────────────────────────────────────────────────────────────┘│ │   │
│  │  │  ┌─────────────────────────────────────────────────────────────────┐│ │   │
│  │  │  │  尝试次数分布:                                                  ││ │   │
│  │  │  │  - 1次失败后流失: 20%                                           ││ │   │
│  │  │  │  - 2-3次失败后流失: 35%                                         ││ │   │
│  │  │  │  - 4-5次失败后流失: 25%                                         ││ │   │
│  │  │  │  - 5次以上失败后流失: 20%                                       ││ │   │
│  │  │  └─────────────────────────────────────────────────────────────────┘│ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          优化建议                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  针对高流失关卡:                                                       │ │   │
│  │  │  1. 动态难度调整: 根据失败次数降低难度                                │ │   │
│  │  │  2. 增加道具提示: 失败后推荐使用道具                                  │ │   │
│  │  │  3. 观看广告复活: 提供额外步数或生命                                  │ │   │
│  │  │  4. 好友求助: 分享给好友获得帮助                                      │ │   │
│  │  │  5. 关卡重设计: 调整障碍物位置或目标分数                             │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 7.5 A/B测试系统

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              A/B测试系统                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          测试场景                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 关卡难度    │  │ 广告策略    │  │ UI设计      │  │ 活动奖励    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 新手引导    │  │ 付费定价    │  │ 推送内容    │  │ 功能入口    │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          测试配置                                          │   │
│  │  {                                                                         │   │
│  │    "test_id": "level_15_difficulty_001",                                  │   │
│  │    "name": "第15关难度调整测试",                                          │   │
│  │    "description": "测试降低第15关难度对留存的影响",                        │   │
│  │    "status": "running",                                                    │   │
│  │    "start_time": "2026-06-01T00:00:00Z",                                  │   │
│  │    "end_time": "2026-06-15T23:59:59Z",                                     │   │
│  │    "target": {                                                             │   │
│  │      "user_group": "new_users",  // 新用户                                │   │
│  │      "sample_rate": 0.1,         // 10%流量                               │   │
│  │      "min_sample_size": 1000    // 最小样本量                            │   │
│  │    },                                                                      │   │
│  │    "variants": [                                                           │   │
│  │      {                                                                     │   │
│  │        "id": "control",                                                    │   │
│  │        "name": "对照组",                                                   │   │
│  │        "ratio": 0.5,                                                       │   │
│  │        "config": { "level_15_moves": 20 }                                  │   │
│  │      },                                                                    │   │
│  │      {                                                                     │   │
│  │        "id": "variant_a",                                                  │   │
│  │        "name": "实验组A",                                                  │   │
│  │        "ratio": 0.5,                                                       │   │
│  │        "config": { "level_15_moves": 25 }                                  │   │
│  │      }                                                                     │   │
│  │    ],                                                                      │   │
│  │    "metrics": [                                                            │   │
│  │      "level_15_pass_rate",                                                │   │
│  │      "day_1_retention",                                                    │   │
│  │      "day_7_retention",                                                    │   │
│  │      "ad_revenue_per_user"                                                 │   │
│  │    ]                                                                       │   │
│  │  }                                                                         │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          测试结果                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  指标              对照组      实验组A    变化      显著性            │ │   │
│  │  │  ─────────────────────────────────────────────────────────────────── │ │   │
│  │  │  第15关通过率      70%        78%        +8%      ✅ 显著             │ │   │
│  │  │  次日留存率        45%        48%        +3%      ✅ 显著             │ │   │
│  │  │  7日留存率         25%        27%        +2%      ⚠️ 接近显著        │ │   │
│  │  │  人均广告收入      ¥0.45      ¥0.42      -7%      ❌ 不显著           │ │   │
│  │  │  样本量           5,000      5,000                                  │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │                                                                           │   │
│  │  结论: 实验组A通过率和留存率显著提升，建议全量发布                        │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. 部署方案清单

### 8.1 服务器配置清单

#### 8.1.1 生产环境配置

| 服务 | 配置 | 数量 | 用途 |
|------|------|------|------|
| **API网关** | 4核8G | 2 | 负载均衡、路由转发 |
| **应用服务器** | 8核16G | 4 | 业务逻辑处理 |
| **游戏服务器** | 8核16G | 2 | 游戏核心服务 |
| **管理后台** | 4核8G | 2 | 后台管理服务 |
| **MySQL主库** | 8核32G + 500G SSD | 1 | 核心数据存储 |
| **MySQL从库** | 8核32G + 500G SSD | 2 | 读写分离 |
| **MongoDB** | 8核16G + 1T SSD | 3 | 游戏日志存储(分片) |
| **Redis** | 8核32G | 3 | 缓存、会话、排行榜 |
| **RabbitMQ** | 4核8G | 3 | 消息队列 |
| **Elasticsearch** | 8核16G + 500G SSD | 3 | 日志搜索 |
| **对象存储** | OSS 1T | 1 | 静态资源存储 |
| **CDN** | 按流量 | - | 静态资源加速 |

#### 8.1.2 测试环境配置

| 服务 | 配置 | 数量 | 用途 |
|------|------|------|------|
| **应用服务器** | 4核8G | 2 | 业务逻辑处理 |
| **MySQL** | 4核8G + 100G SSD | 1 | 数据存储 |
| **MongoDB** | 4核8G + 100G SSD | 1 | 日志存储 |
| **Redis** | 4核8G | 1 | 缓存 |

### 8.2 云服务推荐方案

#### 8.2.1 阿里云方案

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          阿里云部署方案                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  计算资源:                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  ECS云服务器 (包年包月)                                                   │   │
│  │  - 应用服务器: ecs.c6.2xlarge (8vCPU 16GB) x 4 = ¥1,200/月               │   │
│  │  - 游戏服务器: ecs.c6.2xlarge (8vCPU 16GB) x 2 = ¥600/月                 │   │
│  │  - 管理后台: ecs.c6.xlarge (4vCPU 8GB) x 2 = ¥400/月                    │   │
│  │  - 测试环境: ecs.c6.xlarge (4vCPU 8GB) x 2 = ¥400/月                    │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  数据库:                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  RDS MySQL (高可用版)                                                     │   │
│  │  - 主实例: rds.mysql.c6.2xlarge (8vCPU 32GB) + 500G SSD = ¥2,500/月     │   │
│  │  - 只读实例: rds.mysql.c6.2xlarge x 2 = ¥3,000/月                        │   │
│  │                                                                           │   │
│  │  MongoDB (分片集群版)                                                     │   │
│  │  - 3分片 x 3节点 = ¥3,000/月                                              │   │
│  │                                                                           │   │
│  │  Redis (集群版)                                                           │   │
│  │  - 8G集群版 x 3节点 = ¥1,500/月                                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  中间件:                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  消息队列 RabbitMQ                                                        │   │
│  │  - 标准版 x 3节点 = ¥800/月                                               │   │
│  │                                                                           │   │
│  │  Elasticsearch                                                            │   │
│  │  - 8vCPU 16GB x 3节点 + 500G SSD = ¥2,000/月                             │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  存储与CDN:                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  OSS对象存储                                                               │   │
│  │  - 标准存储 1TB = ¥120/月                                                 │   │
│  │  - CDN流量 10TB = ¥1,500/月                                               │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  其他服务:                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  负载均衡 SLB = ¥300/月                                                   │   │
│  │  云监控 = ¥200/月                                                          │   │
│  │  日志服务 = ¥300/月                                                        │   │
│  │  短信服务 = 按量付费                                                        │   │
│  │  CDN = 按流量付费                                                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  月度费用预估: ¥17,000 - ¥20,000                                                 │
│  年度费用预估: ¥200,000 - ¥240,000                                               │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

#### 8.2.2 腾讯云方案

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                          腾讯云部署方案                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  计算资源:                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  CVM云服务器 (包年包月)                                                   │   │
│  │  - 应用服务器: S5.2XLARGE16 (8vCPU 16GB) x 4 = ¥1,100/月                │   │
│  │  - 游戏服务器: S5.2XLARGE16 (8vCPU 16GB) x 2 = ¥550/月                   │   │
│  │  - 管理后台: S5.XLARGE8 (4vCPU 8GB) x 2 = ¥380/月                        │   │
│  │  - 测试环境: S5.XLARGE8 (4vCPU 8GB) x 2 = ¥380/月                        │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  数据库:                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  TDSQL MySQL (高可用版)                                                   │   │
│  │  - 主实例: 8vCPU 32GB + 500G SSD = ¥2,300/月                             │   │
│  │  - 只读实例: 8vCPU 32GB x 2 = ¥2,800/月                                  │   │
│  │                                                                           │   │
│  │  MongoDB (分片集群版)                                                     │   │
│  │  - 3分片 x 3节点 = ¥2,800/月                                              │   │
│  │                                                                           │   │
│  │  Redis (集群版)                                                           │   │
│  │  - 8G集群版 x 3节点 = ¥1,400/月                                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  中间件:                                                                         │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  消息队列 TDMQ                                                            │   │
│  │  - 标准版 x 3节点 = ¥750/月                                               │   │
│  │                                                                           │   │
│  │  Elasticsearch                                                            │   │
│  │  - 8vCPU 16GB x 3节点 + 500G SSD = ¥1,900/月                             │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  存储与CDN:                                                                      │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  COS对象存储                                                               │   │
│  │  - 标准存储 1TB = ¥110/月                                                 │   │
│  │  - CDN流量 10TB = ¥1,400/月                                               │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  其他服务:                                                                       │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │  负载均衡 CLB = ¥280/月                                                   │   │
│  │  云监控 = ¥180/月                                                          │   │
│  │  日志服务 = ¥280/月                                                        │   │
│  │  短信服务 = 按量付费                                                        │   │
│  │  CDN = 按流量付费                                                           │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  月度费用预估: ¥16,000 - ¥19,000                                                 │
│  年度费用预估: ¥190,000 - ¥230,000                                               │
│                                                                                  │
│  腾讯云优势: 微信生态集成更便捷，小程序相关服务更完善                              │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 8.3 成本预估

#### 8.3.1 初期成本 (月度)

| 项目 | 阿里云 | 腾讯云 | 说明 |
|------|--------|--------|------|
| 计算资源 | ¥2,600 | ¥2,410 | 应用+游戏+后台服务器 |
| 数据库 | ¥7,000 | ¥6,500 | MySQL+MongoDB+Redis |
| 中间件 | ¥2,800 | ¥2,650 | RabbitMQ+ES |
| 存储CDN | ¥1,620 | ¥1,510 | OSS/COS+CDN |
| 其他服务 | ¥500 | ¥460 | 监控、日志等 |
| **小计** | **¥14,520** | **¥13,530** | - |

#### 8.3.2 扩展成本 (按需)

| 项目 | 单价 | 说明 |
|------|------|------|
| 短信服务 | ¥0.045/条 | 验证码、通知 |
| CDN流量 | ¥0.24/GB | 超出套餐后 |
| 对象存储 | ¥0.12/GB/月 | 超出套餐后 |
| 带宽扩展 | ¥0.8/Mbps/小时 | 弹性带宽 |

#### 8.3.3 第三方服务成本

| 服务 | 月度费用 | 说明 |
|------|----------|------|
| 极光推送 | ¥500起 | 消息推送 |
| 神策数据 | ¥3,000起 | 数据分析 |
| Sentry | ¥200起 | 错误监控 |
| 微信支付 | 0.6%手续费 | 支付手续费 |
| 广告平台 | 分成 | 广告收入分成 |

#### 8.3.4 总成本预估

| 阶段 | 月度成本 | 年度成本 | 说明 |
|------|----------|----------|------|
| 初期 (DAU < 1万) | ¥15,000 - ¥18,000 | ¥180,000 - ¥220,000 | 基础配置 |
| 发展期 (DAU 1-10万) | ¥30,000 - ¥50,000 | ¥360,000 - ¥600,000 | 扩容配置 |
| 成长期 (DAU > 10万) | ¥80,000 - ¥150,000 | ¥960,000 - ¥1,800,000 | 集群扩展 |

### 8.4 部署架构图

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              生产环境部署架构                                     │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│                              ┌─────────────┐                                    │
│                              │   用户端    │                                    │
│                              │ (小程序/H5) │                                    │
│                              └──────┬──────┘                                    │
│                                     │                                           │
│                              ┌──────▼──────┐                                    │
│                              │    CDN     │                                    │
│                              │ (静态资源)  │                                    │
│                              └──────┬──────┘                                    │
│                                     │                                           │
│  ┌──────────────────────────────────┼──────────────────────────────────────┐   │
│  │                          阿里云/腾讯云                                  │   │
│  │                              ┌──────▼──────┐                            │   │
│  │                              │    SLB     │                            │   │
│  │                              │ (负载均衡)  │                            │   │
│  │                              └──────┬──────┘                            │   │
│  │                                     │                                    │   │
│  │              ┌──────────────────────┼──────────────────────┐            │   │
│  │              │                      │                      │            │   │
│  │       ┌──────▼──────┐        ┌──────▼──────┐       ┌──────▼──────┐     │   │
│  │       │   Nginx    │        │   Nginx    │       │   Nginx    │     │   │
│  │       │  (网关1)   │        │  (网关2)   │       │  (网关3)   │     │   │
│  │       └──────┬──────┘        └──────┬──────┘       └──────┬──────┘     │   │
│  │              │                      │                      │            │   │
│  │              └──────────────────────┼──────────────────────┘            │   │
│  │                                     │                                    │   │
│  │              ┌──────────────────────┼──────────────────────┐            │   │
│  │              │                      │                      │            │   │
│  │       ┌──────▼──────┐        ┌──────▼──────┐       ┌──────▼──────┐     │   │
│  │       │  App Svc   │        │  App Svc   │       │  App Svc   │     │   │
│  │       │  (应用1)   │        │  (应用2)   │       │  (应用3)   │     │   │
│  │       └──────┬──────┘        └──────┬──────┘       └──────┬──────┘     │   │
│  │              │                      │                      │            │   │
│  │              └──────────────────────┼──────────────────────┘            │   │
│  │                                     │                                    │   │
│  │    ┌────────────────────────────────┼────────────────────────────────┐  │   │
│  │    │                                │                                │  │   │
│  │ ┌──▼──┐  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐  │  ┌──▼──┐  ┌──▼──┐  ┌──▼──┐  │  │   │
│  │ │MySQL│  │MySQL│  │Mongo│  │Redis│  │  │Rabbit│  │ ES │  │ OSS │  │  │   │
│  │ │主库 │  │从库 │  │ DB │  │集群 │  │  │ MQ │  │    │  │    │  │  │   │
│  │ └─────┘  └─────┘  └─────┘  └─────┘  │  └─────┘  └────┘  └────┘  │  │   │
│  │                                     │                                │  │   │
│  │    └────────────────────────────────┴────────────────────────────────┘  │   │
│  │                                                                         │   │
│  └─────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. 安全架构设计

### 9.1 认证授权

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              认证授权架构                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          认证方式                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 微信登录    │  │ 手机号登录  │  │ 游客登录    │  │ 管理员登录  │      │   │
│  │  │ (OAuth2.0)  │  │ (短信验证)  │  │ (设备ID)   │  │ (账号密码)  │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          Token策略                                         │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  JWT Token                                                            │ │   │
│  │  │  - Access Token: 有效期2小时                                         │ │   │
│  │  │  - Refresh Token: 有效期7天                                          │ │   │
│  │  │  - Token刷新: Access Token过期后使用Refresh Token刷新                │ │   │
│  │  │  - Token撤销: 用户登出、修改密码时撤销                                │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  安全措施                                                             │ │   │
│  │  │  - Token签名验证                                                     │ │   │
│  │  │  - Token黑名单机制                                                   │ │   │
│  │  │  - 异地登录检测                                                      │ │   │
│  │  │  - 设备绑定验证                                                      │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          权限控制                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  RBAC权限模型                                                         │ │   │
│  │  │  - 角色: 超级管理员、运营、客服、财务等                              │ │   │
│  │  │  - 权限: 用户管理、内容管理、数据查看等                              │ │   │
│  │  │  - 资源: API接口、菜单、按钮等                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  权限校验                                                             │ │   │
│  │  │  - API级别权限校验                                                   │ │   │
│  │  │  - 数据级别权限校验(只能操作自己的数据)                              │ │   │
│  │  │  - 操作日志记录                                                      │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 9.2 数据安全

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              数据安全架构                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          数据加密                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ 传输加密    │  │ 存储加密    │  │ 敏感数据    │  │ 密码加密    │      │   │
│  │  │ (HTTPS)    │  │ (AES-256)  │  │ (脱敏)      │  │ (bcrypt)   │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          数据备份                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  备份策略                                                             │ │   │
│  │  │  - MySQL: 每日全量备份 + 实时binlog备份                               │ │   │
│  │  │  - MongoDB: 每日增量备份                                              │ │   │
│  │  │  - Redis: AOF持久化 + 定期RDB快照                                    │ │   │
│  │  │  - 备份保留: 30天                                                     │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  恢复机制                                                             │ │   │
│  │  │  - 灾备切换: 主从自动切换                                             │ │   │
│  │  │  - 数据恢复: 支持时间点恢复                                           │ │   │
│  │  │  - 跨区域备份: 异地容灾备份                                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          数据合规                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  隐私保护                                                             │ │   │
│  │  │  - 用户隐私协议                                                       │ │   │
│  │  │  - 数据收集最小化                                                     │ │   │
│  │  │  - 用户数据删除权利                                                   │ │   │
│  │  │  - 数据导出功能                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  安全审计                                                             │ │   │
│  │  │  - 操作日志记录                                                       │ │   │
│  │  │  - 异常行为检测                                                       │ │   │
│  │  │  - 安全事件告警                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 9.3 防攻击措施

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              防攻击措施                                           │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          API安全                                           │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  限流策略                                                             │ │   │
│  │  │  - 用户级限流: 每用户每分钟100次请求                                  │ │   │
│  │  │  - IP级限流: 每IP每分钟1000次请求                                     │ │   │
│  │  │  - 接口级限流: 关键接口更严格限制                                     │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  防刷机制                                                             │ │   │
│  │  │  - 签名验证: 请求参数签名                                            │ │   │
│  │  │  - 时间戳校验: 防止重放攻击                                          │ │   │
│  │  │  - 设备指纹: 识别异常设备                                            │ │   │
│  │  │  - 行为分析: 检测异常行为模式                                        │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          游戏安全                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  防作弊                                                               │ │   │
│  │  │  - 游戏逻辑服务端验证                                                 │ │   │
│  │  │  - 分数异常检测                                                       │ │   │
│  │  │  - 时间异常检测                                                       │ │   │
│  │  │  - 作弊行为封禁                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  数据校验                                                             │ │   │
│  │  │  - 进度数据合理性校验                                                 │ │   │
│  │  │  - 资源变动异常检测                                                   │ │   │
│  │  │  - 交易数据校验                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          支付安全                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  交易安全                                                             │ │   │
│  │  │  - 订单幂等性校验                                                     │ │   │
│  │  │  - 支付回调验证                                                       │ │   │
│  │  │  - 金额一致性校验                                                     │ │   │
│  │  │  - 交易风控检测                                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. 性能优化方案

### 10.1 客户端性能优化

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              客户端性能优化                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          加载优化                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  资源优化                                                             │ │   │
│  │  │  - 图片压缩: WebP格式，懒加载                                         │ │   │
│  │  │  - 代码分包: 按页面分包加载                                           │ │   │
│  │  │  - 预加载: 关键资源预加载                                             │ │   │
│  │  │  - CDN加速: 静态资源CDN分发                                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  启动优化                                                             │ │   │
│  │  │  - 首屏渲染: 最小化首屏资源                                           │ │   │
│  │  │  - 异步加载: 非关键资源异步                                           │ │   │
│  │  │  - 缓存策略: 本地缓存复用                                             │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          游戏性能                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  渲染优化                                                             │ │   │
│  │  │  - Canvas优化: 减少重绘区域                                           │ │   │
│  │  │  - 动画优化: 使用CSS动画代替JS动画                                    │ │   │
│  │  │  - 精灵图优化: 合并小图片                                             │ │   │
│  │  │  - 粒子效果: 限制粒子数量                                             │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  内存优化                                                             │ │   │
│  │  │  - 对象池: 复用游戏对象                                               │ │   │
│  │  │  - 内存释放: 及时清理无用对象                                         │ │   │
│  │  │  - 图片缓存: 合理管理图片缓存                                         │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          网络优化                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  请求优化                                                             │ │   │
│  │  │  - 请求合并: 批量请求接口                                             │ │   │
│  │  │  - 数据压缩: Gzip压缩传输                                             │ │   │
│  │  │  - 离线缓存: 本地数据缓存                                             │ │   │
│  │  │  - 断点续传: 大文件下载支持                                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  网络策略                                                             │ │   │
│  │  │  - 弱网优化: 请求超时处理                                             │ │   │
│  │  │  - 重试机制: 失败请求自动重试                                         │ │   │
│  │  │  - 降级策略: 网络异常时降级处理                                       │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 10.2 服务端性能优化

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              服务端性能优化                                       │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          数据库优化                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  MySQL优化                                                            │ │   │
│  │  │  - 索引优化: 合理创建索引                                             │ │   │
│  │  │  - 查询优化: 避免慢查询                                               │ │   │
│  │  │  - 连接池: 合理配置连接池                                             │ │   │
│  │  │  - 读写分离: 读请求分流到从库                                         │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  Redis优化                                                            │ │   │
│  │  │  - 缓存策略: 合理设置缓存过期                                         │ │   │
│  │  │  - 热点数据: 缓存高频访问数据                                         │ │   │
│  │  │  - 分布式锁: 使用Redis实现                                            │ │   │
│  │  │  - 集群部署: 分片提高吞吐量                                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  MongoDB优化                                                          │ │   │
│  │  │  - 索引优化: 创建合适索引                                             │ │   │
│  │  │  - 分片策略: 按时间分片                                               │ │   │
│  │  │  - 写关注: 合理配置写入策略                                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          服务优化                                          │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  并发处理                                                             │ │   │
│  │  │  - 异步处理: 非关键操作异步化                                         │ │   │
│  │  │  - 消息队列: 削峰填谷                                                 │ │   │
│  │  │  - 批量处理: 批量数据库操作                                           │ │   │
│  │  │  - 连接复用: HTTP连接复用                                             │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  缓存策略                                                             │ │   │
│  │  │  - 多级缓存: 本地缓存 + 分布式缓存                                    │ │   │
│  │  │  - 缓存预热: 启动时预热热点数据                                       │ │   │
│  │  │  - 缓存更新: 合理的缓存更新策略                                       │ │   │
│  │  │  - 缓存穿透: 空值缓存防止穿透                                         │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          扩展性设计                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  水平扩展                                                             │ │   │
│  │  │  - 服务无状态: 支持水平扩展                                           │ │   │
│  │  │  - 自动扩缩容: 基于负载自动调整                                       │ │   │
│  │  │  - 负载均衡: 多节点负载分发                                           │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  服务拆分                                                             │ │   │
│  │  │  - 微服务架构: 服务独立部署                                           │ │   │
│  │  │  - 服务隔离: 故障隔离                                                 │ │   │
│  │  │  - 独立扩展: 按需扩展单个服务                                         │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

### 10.3 性能监控指标

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              性能监控指标                                         │
├─────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          客户端指标                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  加载性能                                                             │ │   │
│  │  │  - 首屏加载时间 < 2秒                                                 │ │   │
│  │  │  - 页面切换时间 < 500ms                                               │ │   │
│  │  │  - 资源加载成功率 > 99%                                               │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  游戏性能                                                             │ │   │
│  │  │  - 游戏帧率 > 30fps                                                   │ │   │
│  │  │  - 操作响应时间 < 100ms                                               │ │   │
│  │  │  - 内存占用 < 100MB                                                   │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          服务端指标                                        │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  API性能                                                              │ │   │
│  │  │  - API响应时间 < 200ms (P95)                                          │ │   │
│  │  │  - API成功率 > 99.9%                                                  │ │   │
│  │  │  - 并发处理能力 > 1000 QPS                                            │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  数据库性能                                                           │ │   │
│  │  │  - MySQL查询时间 < 50ms (P95)                                         │ │   │
│  │  │  - Redis响应时间 < 10ms                                               │ │   │
│  │  │  - MongoDB写入延迟 < 100ms                                            │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  │  ┌─────────────────────────────────────────────────────────────────────┐ │   │
│  │  │  系统性能                                                             │ │   │
│  │  │  - CPU使用率 < 70%                                                    │ │   │
│  │  │  - 内存使用率 < 80%                                                   │ │   │
│  │  │  - 网络带宽利用率 < 60%                                               │ │   │
│  │  └─────────────────────────────────────────────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
│  ┌──────────────────────────────────────────────────────────────────────────┐   │
│  │                          监控工具                                          │   │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐      │   │
│  │  │ Prometheus  │  │ Grafana    │  │ Sentry     │  │ ELK Stack   │      │   │
│  │  │ (指标采集)  │  │ (可视化)   │  │ (错误监控) │  │ (日志分析) │      │   │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘      │   │
│  └──────────────────────────────────────────────────────────────────────────┘   │
│                                                                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 附录

### A. 项目目录结构规划

```
happy-match/
├── client/                     # 客户端代码 (Taro)
│   ├── src/
│   │   ├── pages/              # 页面组件
│   │   ├── components/         # 公共组件
│   │   ├── game/               # 游戏核心逻辑
│   │   │   ├── objects/        # 游戏对象
│   │   │   ├── systems/        # 游戏系统
│   │   │   ├── services/       # 游戏服务
│   │   │   ├── utils/          # 工具函数
│   │   │   ├── config/         # 配置文件
│   │   │   ├── Game.ts         # 游戏主类
│   │   │   └── types.ts        # 类型定义
│   │   ├── services/           # API服务
│   │   ├── store/              # 状态管理
│   │   ├── utils/              # 工具函数
│   │   ├── hooks/              # 自定义Hooks
│   │   ├── adapters/           # 平台适配器
│   │   └── app.config.ts       # 应用配置
│   ├── config/                 # Taro配置
│   └── package.json
│
├── admin/                      # 管理后台
│   ├── src/
│   │   ├── pages/              # 页面
│   │   ├── components/         # 组件
│   │   ├── services/           # API服务
│   │   ├── store/              # 状态管理
│   │   ├── utils/              # 工具
│   │   └── layouts/            # 布局
│   └── package.json
│
├── server/                     # 后端服务
│   ├── src/
│   │   ├── modules/            # 业务模块
│   │   │   ├── user/           # 用户模块
│   │   │   ├── game/           # 游戏模块
│   │   │   ├── payment/        # 支付模块
│   │   │   ├── activity/       # 活动模块
│   │   │   ├── ad/             # 广告模块
│   │   │   ├── social/         # 社交模块
│   │   │   ├── notification/   # 通知模块
│   │   │   └── admin/          # 管理模块
│   │   ├── common/             # 公共模块
│   │   │   ├── guards/         # 守卫
│   │   │   ├── interceptors/   # 拦截器
│   │   │   ├── filters/        # 过滤器
│   │   │   ├── pipes/          # 管道
│   │   │   └── decorators/     # 装饰器
│   │   ├── config/             # 配置
│   │   ├── database/           # 数据库
│   │   │   ├── entities/       # 实体
│   │   │   ├── migrations/     # 迁移
│   │   │   └── seeds/          # 种子数据
│   │   └── utils/              # 工具
│   ├── test/                   # 测试
│   └── package.json
│
├── docs/                       # 文档
│   ├── ARCHITECTURE_DESIGN.md  # 架构设计文档
│   ├── API.md                  # API文档
│   ├── DATABASE.md             # 数据库文档
│   └── DEPLOYMENT.md           # 部署文档
│
├── deploy/                     # 部署配置
│   ├── docker/                 # Docker配置
│   ├── k8s/                    # Kubernetes配置
│   └── nginx/                  # Nginx配置
│
├── scripts/                    # 脚本
│   ├── build.sh                # 构建脚本
│   ├── deploy.sh               # 部署脚本
│   └── test.sh                 # 测试脚本
│
├── .gitignore
├── README.md
└── package.json                # 根package.json
```

### B. 实施计划

| 阶段 | 时间 | 任务 | 里程碑 |
|------|------|------|--------|
| **第一阶段** | 1-2周 | 客户端Taro迁移 | 完成小程序基础框架 |
| **第二阶段** | 2-3周 | 后端服务搭建 | 完成核心API服务 |
| **第三阶段** | 1-2周 | 数据库设计与实现 | 完成数据库部署 |
| **第四阶段** | 2-3周 | 管理后台开发 | 完成后台基础功能 |
| **第五阶段** | 1-2周 | 营销功能开发 | 完成活动系统 |
| **第六阶段** | 1-2周 | 数据分析系统 | 完成数据看板 |
| **第七阶段** | 1周 | 测试与优化 | 完成性能优化 |
| **第八阶段** | 1周 | 部署上线 | 完成生产环境部署 |

**总计：10-16周**

### C. 团队配置建议

| 角色 | 人数 | 职责 |
|------|------|------|
| **项目经理** | 1 | 项目管理、进度把控 |
| **架构师** | 1 | 技术架构设计、技术决策 |
| **前端开发** | 2-3 | 客户端开发、管理后台开发 |
| **后端开发** | 2-3 | 服务端开发、API设计 |
| **游戏开发** | 1 | 游戏核心逻辑优化 |
| **测试工程师** | 1 | 测试、质量保障 |
| **运维工程师** | 1 | 部署、运维、监控 |

---

## 总结

本架构设计文档为「甜趣点点消」项目提供了完整的重构方案，涵盖：

1. **客户端架构**：基于Taro框架实现微信生态多端兼容，保留现有Phaser游戏核心逻辑
2. **后端服务架构**：采用NestJS微服务架构，支持高并发、可扩展
3. **数据库设计**：MySQL存储核心业务数据，MongoDB存储游戏日志，Redis提供缓存支持
4. **API接口设计**：RESTful API规范，完整的客户端和管理后台接口
5. **营销功能**：用户留存、活动管理、优惠券、推送通知、分享裂变等完整体系
6. **运营功能**：数据仪表盘、用户行为分析、广告收益分析、关卡流失分析、A/B测试
7. **部署方案**：阿里云/腾讯云部署方案，详细的成本预估
8. **安全架构**：认证授权、数据安全、防攻击措施
9. **性能优化**：客户端和服务端性能优化策略

该架构设计遵循稳定性优先、可扩展性设计、可维护性保障的原则，能够支持业务的长期发展。

---

> 文档版本：v2.0  
> 最后更新：2026-06-07  
> 作者：架构设计师-刘一手