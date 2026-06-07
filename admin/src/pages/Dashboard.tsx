import React from 'react';
import { Card, Row, Col, Statistic, Progress, Table, Tag } from 'antd';
import {
  UserOutlined,
  DollarOutlined,
  AppstoreOutlined,
  RiseOutlined,
  FallOutlined,
} from '@ant-design/icons';
import { Line, Pie, Column } from '@ant-design/charts';

const Dashboard: React.FC = () => {
  // 模拟数据
  const userStats = {
    dau: 12580,
    mau: 89420,
    newUsers: 1520,
    retention: 68.5,
    avgPlayTime: 32.5,
  };

  const revenueStats = {
    todayRevenue: 8560,
    monthRevenue: 256800,
    adRevenue: 156200,
    iapRevenue: 100600,
    arpu: 2.86,
    ltv: 28.5,
  };

  const gameStats = {
    totalPlays: 125600,
    avgLevel: 18.5,
    completionRate: 72.3,
    avgScore: 1850,
  };

  // 用户趋势数据
  const userTrendData = [
    { date: '06-01', dau: 10200, newUsers: 1200 },
    { date: '06-02', dau: 10800, newUsers: 1350 },
    { date: '06-03', dau: 11500, newUsers: 1480 },
    { date: '06-04', dau: 11200, newUsers: 1320 },
    { date: '06-05', dau: 12000, newUsers: 1450 },
    { date: '06-06', dau: 12580, newUsers: 1520 },
  ];

  // 收益趋势数据
  const revenueTrendData = [
    { date: '06-01', ad: 5200, iap: 3200 },
    { date: '06-02', ad: 5800, iap: 3500 },
    { date: '06-03', ad: 6200, iap: 3800 },
    { date: '06-04', ad: 5900, iap: 3600 },
    { date: '06-05', ad: 6500, iap: 4000 },
    { date: '06-06', ad: 7200, iap: 4200 },
  ];

  // 关卡流失数据
  const levelDropData = [
    { level: '关卡1', dropRate: 5 },
    { level: '关卡5', dropRate: 12 },
    { level: '关卡10', dropRate: 18 },
    { level: '关卡15', dropRate: 25 },
    { level: '关卡20', dropRate: 32 },
    { level: '关卡25', dropRate: 45 },
  ];

  // 用户分布数据
  const userDistribution = [
    { type: '新手用户', value: 35 },
    { type: '活跃用户', value: 45 },
    { type: '付费用户', value: 12 },
    { type: '流失用户', value: 8 },
  ];

  // 活跃关卡排行
  const activeLevels = [
    { level: '关卡1', plays: 12500, avgScore: 850, completionRate: '95%' },
    { level: '关卡5', plays: 9800, avgScore: 1200, completionRate: '88%' },
    { level: '关卡10', plays: 7200, avgScore: 1500, completionRate: '75%' },
    { level: '关卡15', plays: 5200, avgScore: 1800, completionRate: '68%' },
    { level: '关卡20', plays: 3500, avgScore: 2100, completionRate: '55%' },
  ];

  const lineConfig = {
    data: userTrendData,
    xField: 'date',
    yField: 'dau',
    smooth: true,
  };

  const pieConfig = {
    data: userDistribution,
    angleField: 'value',
    colorField: 'type',
    radius: 0.8,
    innerRadius: 0.6,
  };

  const columnConfig = {
    data: levelDropData,
    xField: 'level',
    yField: 'dropRate',
    color: '#ff4d4f',
  };

  return (
    <div>
      {/* 核心指标卡片 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日活跃用户"
              value={userStats.dau}
              prefix={<UserOutlined />}
              suffix="人"
            />
            <Progress percent={userStats.retention} size="small" status="active" style={{ marginTop: 8 }} />
            <span style={{ fontSize: 12, color: '#999' }}>留存率 {userStats.retention}%</span>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日收益"
              value={revenueStats.todayRevenue}
              prefix={<DollarOutlined />}
              suffix="元"
              valueStyle={{ color: '#3f8600' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              ARPU: ¥{revenueStats.arpu} | LTV: ¥{revenueStats.ltv}
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="今日游戏次数"
              value={gameStats.totalPlays}
              prefix={<AppstoreOutlined />}
              suffix="次"
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              平均关卡: {gameStats.avgLevel} | 通关率: {gameStats.completionRate}%
            </div>
          </Card>
        </Col>
        <Col xs={24} sm={12} md={6}>
          <Card>
            <Statistic
              title="新增用户"
              value={userStats.newUsers}
              prefix={<RiseOutlined />}
              suffix="人"
              valueStyle={{ color: '#1890ff' }}
            />
            <div style={{ marginTop: 8, fontSize: 12, color: '#999' }}>
              平均游戏时长: {userStats.avgPlayTime}分钟
            </div>
          </Card>
        </Col>
      </Row>

      {/* 图表区域 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={16}>
          <Card title="用户趋势">
            <Line {...lineConfig} height={300} />
          </Card>
        </Col>
        <Col xs={24} lg={8}>
          <Card title="用户分布">
            <Pie {...pieConfig} height={300} />
          </Card>
        </Col>
      </Row>

      {/* 收益分析 */}
      <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
        <Col xs={24} lg={12}>
          <Card title="收益构成">
            <Row gutter={16}>
              <Col span={12}>
                <Statistic
                  title="广告收益"
                  value={revenueStats.adRevenue}
                  suffix="元"
                  valueStyle={{ color: '#722ed1' }}
                />
                <Progress percent={61} size="small" strokeColor="#722ed1" />
              </Col>
              <Col span={12}>
                <Statistic
                  title="内购收益"
                  value={revenueStats.iapRevenue}
                  suffix="元"
                  valueStyle={{ color: '#52c41a' }}
                />
                <Progress percent={39} size="small" strokeColor="#52c41a" />
              </Col>
            </Row>
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="关卡流失分析">
            <Column {...columnConfig} height={200} />
          </Card>
        </Col>
      </Row>

      {/* 活跃关卡排行 */}
      <Card title="活跃关卡排行" style={{ marginTop: 16 }}>
        <Table
          dataSource={activeLevels}
          pagination={false}
          columns={[
            { title: '关卡', dataIndex: 'level', key: 'level' },
            { title: '游戏次数', dataIndex: 'plays', key: 'plays', sorter: (a, b) => a.plays - b.plays },
            { title: '平均得分', dataIndex: 'avgScore', key: 'avgScore' },
            {
              title: '通关率',
              dataIndex: 'completionRate',
              key: 'completionRate',
              render: (rate: string) => (
                <Tag color={parseInt(rate) >= 80 ? 'green' : parseInt(rate) >= 60 ? 'blue' : 'red'}>
                  {rate}
                </Tag>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Dashboard;