import React from 'react';
import { Card, Row, Col, Statistic, Table, Typography, Space, Button, Tag, Progress } from 'antd';
import {
  UserOutlined,
  TrophyOutlined,
  DollarOutlined,
  HeartOutlined,
  PlayCircleOutlined,
  CheckCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Dashboard: React.FC = () => {
  const userData = [
    { key: '1', name: '玩家A', level: 15, coins: 12500, diamonds: 250, lastLogin: '2024-06-07' },
    { key: '2', name: '玩家B', level: 23, coins: 28000, diamonds: 500, lastLogin: '2024-06-06' },
    { key: '3', name: '玩家C', level: 8, coins: 5000, diamonds: 100, lastLogin: '2024-06-08' },
    { key: '4', name: '玩家D', level: 45, coins: 85000, diamonds: 1200, lastLogin: '2024-06-05' },
  ];

  const columns = [
    { title: '玩家名称', dataIndex: 'name', key: 'name' },
    { title: '当前关卡', dataIndex: 'level', key: 'level' },
    { title: '金币', dataIndex: 'coins', key: 'coins', render: (coins: number) => <Text type="warning">{coins.toLocaleString()}</Text> },
    { title: '钻石', dataIndex: 'diamonds', key: 'diamonds', render: (diamonds: number) => <Text type="success">{diamonds.toLocaleString()}</Text> },
    { title: '最后登录', dataIndex: 'lastLogin', key: 'lastLogin' },
    { 
      title: '操作', 
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button size="small">查看</Button>
          <Button size="small" type="primary">编辑</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>数据概览</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="总用户数"
              value={12580}
              prefix={<UserOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="日活跃用户"
              value={3250}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="总游戏时长 (小时)"
              value={15800}
              prefix={<HeartOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="广告收入 (¥)"
              value={52300}
              prefix={<DollarOutlined />}
              valueStyle={{ color: '#faad14' }}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={12}>
          <Card title="关卡完成率" style={{ height: 300 }}>
            <div style={{ padding: 20 }}>
              <div style={{ marginBottom: 16 }}>
                <Text strong>入门关卡 (1-20)</Text>
                <Progress percent={85} style={{ marginTop: 8 }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <Text strong>进阶关卡 (21-50)</Text>
                <Progress percent={65} style={{ marginTop: 8 }} />
              </div>
              <div>
                <Text strong>高级关卡 (51+)</Text>
                <Progress percent={35} style={{ marginTop: 8 }} />
              </div>
            </div>
          </Card>
        </Col>
        <Col span={12}>
          <Card title="今日统计" style={{ height: 300 }}>
            <div style={{ padding: 20 }}>
              <Space direction="vertical" size="large" style={{ width: '100%' }}>
                <div>
                  <Tag color="blue">新增用户</Tag>
                  <Text strong style={{ marginLeft: 16, fontSize: 18 }}>+125</Text>
                </div>
                <div>
                  <Tag color="green">游戏次数</Tag>
                  <Text strong style={{ marginLeft: 16, fontSize: 18 }}>3,450</Text>
                </div>
                <div>
                  <Tag color="orange">广告展示</Tag>
                  <Text strong style={{ marginLeft: 16, fontSize: 18 }}>12,800</Text>
                </div>
                <div>
                  <Tag color="purple">关卡通过</Tag>
                  <Text strong style={{ marginLeft: 16, fontSize: 18 }}>2,100</Text>
                </div>
              </Space>
            </div>
          </Card>
        </Col>
      </Row>

      <Card title="活跃玩家">
        <Table 
          dataSource={userData} 
          columns={columns} 
          pagination={{ pageSize: 10 }} 
        />
      </Card>
    </div>
  );
};

export default Dashboard;
