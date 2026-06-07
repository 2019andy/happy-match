import React from 'react';
import { Card, Table, Space, Tag, Typography, Button } from 'antd';
import { CheckCircleOutlined, CloseCircleOutlined, DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const PaymentManage: React.FC = () => {
  const paymentData = [
    { key: '1', id: 'P001', userId: 'U001', userName: '玩家A', amount: 10, status: 'success', date: '2024-06-07 12:30:00' },
    { key: '2', id: 'P002', userId: 'U002', userName: '玩家B', amount: 25, status: 'success', date: '2024-06-07 13:45:00' },
    { key: '3', id: 'P003', userId: 'U003', userName: '玩家C', amount: 5, status: 'failed', date: '2024-06-07 14:20:00' },
    { key: '4', id: 'P004', userId: 'U004', userName: '玩家D', amount: 50, status: 'success', date: '2024-06-07 15:10:00' },
  ];

  const columns = [
    { title: '支付ID', dataIndex: 'id', key: 'id' },
    { title: '用户ID', dataIndex: 'userId', key: 'userId' },
    { title: '用户名', dataIndex: 'userName', key: 'userName' },
    { title: '金额 (¥)', dataIndex: 'amount', key: 'amount', render: (amount: number) => <span style={{ color: '#faad14', fontWeight: 'bold' }}>¥{amount}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => (
      <Tag icon={status === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />} color={status === 'success' ? 'green' : 'red'}>
        {status === 'success' ? '成功' : '失败'}
      </Tag>
    )},
    { title: '支付时间', dataIndex: 'date', key: 'date' },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link">详情</Button>
        </Space>
      ),
    },
  ];

  const stats = [
    { title: '今日订单', value: 12, icon: <DollarOutlined />, color: '#1890ff' },
    { title: '今日收入', value: '¥320', icon: <DollarOutlined />, color: '#52c41a' },
    { title: '本周订单', value: 85, icon: <DollarOutlined />, color: '#faad14' },
    { title: '本周收入', value: '¥2,350', icon: <DollarOutlined />, color: '#cf1322' },
  ];

  return (
    <div>
      <Title level={3}>支付管理</Title>
      
      <Space direction="vertical" size="middle" style={{ width: '100%' }}>
        <div style={{ display: 'flex', gap: 16 }}>
          {stats.map((stat, index) => (
            <Card key={index} style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ fontSize: 32, color: stat.color }}>{stat.icon}</div>
                <div>
                  <div style={{ color: '#666', fontSize: 14 }}>{stat.title}</div>
                  <div style={{ fontSize: 24, fontWeight: 'bold', color: stat.color }}>{stat.value}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Card title="支付记录">
          <Table dataSource={paymentData} columns={columns} pagination={{ pageSize: 10 }} />
        </Card>
      </Space>
    </div>
  );
};

export default PaymentManage;
