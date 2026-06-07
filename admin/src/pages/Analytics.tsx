import React from 'react';
import { Card, Row, Col, Statistic, Typography, Space, Table } from 'antd';
import {
  BarChartOutlined,
  ArrowUpOutlined,
  ArrowDownOutlined,
  UserOutlined,
  PlayCircleOutlined,
} from '@ant-design/icons';

const { Title, Text } = Typography;

const Analytics: React.FC = () => {
  const trendData = [
    { key: '1', date: '2024-06-01', users: 120, plays: 3400, revenue: 850 },
    { key: '2', date: '2024-06-02', users: 135, plays: 3600, revenue: 920 },
    { key: '3', date: '2024-06-03', users: 118, plays: 3200, revenue: 780 },
    { key: '4', date: '2024-06-04', users: 145, plays: 3900, revenue: 1050 },
    { key: '5', date: '2024-06-05', users: 160, plays: 4200, revenue: 1150 },
    { key: '6', date: '2024-06-06', users: 150, plays: 4000, revenue: 1080 },
    { key: '7', date: '2024-06-07', users: 170, plays: 4500, revenue: 1250 },
  ];

  const columns = [
    { title: '日期', dataIndex: 'date', key: 'date' },
    { title: '活跃用户', dataIndex: 'users', key: 'users' },
    { title: '游戏次数', dataIndex: 'plays', key: 'plays' },
    { title: '广告收入', dataIndex: 'revenue', key: 'revenue', render: (revenue: number) => <Text type="success">¥{revenue.toLocaleString()}</Text> },
  ];

  return (
    <div>
      <Title level={3}>数据分析</Title>
      
      <Row gutter={16} style={{ marginBottom: 24 }}>
        <Col span={6}>
          <Card>
            <Statistic
              title="本周活跃用户"
              value={885}
              valueStyle={{ color: '#3f8600' }}
              prefix={<UserOutlined />}
              suffix={<span style={{ fontSize: 14, color: '#52c41a' }}><ArrowUpOutlined /> 12%</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本周游戏次数"
              value={23400}
              valueStyle={{ color: '#1890ff' }}
              prefix={<PlayCircleOutlined />}
              suffix={<span style={{ fontSize: 14, color: '#52c41a' }}><ArrowUpOutlined /> 8%</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="本周广告收入"
              value={6130}
              prefix="¥"
              valueStyle={{ color: '#faad14' }}
              suffix={<span style={{ fontSize: 14, color: '#52c41a' }}><ArrowUpOutlined /> 15%</span>}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card>
            <Statistic
              title="用户留存率"
              value={65}
              valueStyle={{ color: '#cf1322' }}
              prefix={<BarChartOutlined />}
              suffix={<span style={{ fontSize: 14, color: '#cf1322' }}><ArrowDownOutlined /> 3%</span>}
            />
          </Card>
        </Col>
      </Row>

      <Card title="数据趋势" style={{ marginBottom: 24 }}>
        <div style={{ height: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
          <Space direction="vertical" align="center">
            <BarChartOutlined style={{ fontSize: 48 }} />
            <Text>图表区域 (待接入图表库)</Text>
          </Space>
        </div>
      </Card>

      <Card title="详细数据">
        <Table dataSource={trendData} columns={columns} pagination={false} />
      </Card>
    </div>
  );
};

export default Analytics;
