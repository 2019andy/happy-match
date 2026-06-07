import React, { useState } from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, Typography, Modal, Form, message, InputNumber } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const LevelManage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const levelData = [
    { key: '1', id: 'L001', level: 1, difficulty: 'easy', targetScore: 1000, moves: 20, status: 'active' },
    { key: '2', id: 'L002', level: 2, difficulty: 'easy', targetScore: 1500, moves: 20, status: 'active' },
    { key: '3', id: 'L003', level: 3, difficulty: 'medium', targetScore: 2500, moves: 25, status: 'active' },
    { key: '4', id: 'L004', level: 4, difficulty: 'medium', targetScore: 3500, moves: 25, status: 'active' },
    { key: '5', id: 'L005', level: 5, difficulty: 'hard', targetScore: 5000, moves: 30, status: 'active' },
  ];

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'green';
      case 'medium': return 'orange';
      case 'hard': return 'red';
      default: return 'default';
    }
  };

  const columns = [
    { title: '关卡ID', dataIndex: 'id', key: 'id' },
    { title: '关卡号', dataIndex: 'level', key: 'level' },
    { title: '难度', dataIndex: 'difficulty', key: 'difficulty', render: (difficulty: string) => <Tag color={getDifficultyColor(difficulty)}>{difficulty === 'easy' ? '简单' : difficulty === 'medium' ? '中等' : '困难'}</Tag> },
    { title: '目标分数', dataIndex: 'targetScore', key: 'targetScore', render: (score: number) => score.toLocaleString() },
    { title: '步数', dataIndex: 'moves', key: 'moves' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '启用' : '禁用'}</Tag> },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
          <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <Title level={3}>关卡管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="搜索关卡" prefix={<SearchOutlined />} style={{ width: 250 }} />
          <Select placeholder="难度" style={{ width: 150 }}>
            <Option value="all">全部</Option>
            <Option value="easy">简单</Option>
            <Option value="medium">中等</Option>
            <Option value="hard">困难</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            添加关卡
          </Button>
        </Space>
      </Card>

      <Card>
        <Table dataSource={levelData} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="添加关卡"
        open={isModalOpen}
        onOk={() => { message.success('关卡添加成功'); setIsModalOpen(false); }}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="level" label="关卡号" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="difficulty" label="难度" rules={[{ required: true }]}>
            <Select>
              <Option value="easy">简单</Option>
              <Option value="medium">中等</Option>
              <Option value="hard">困难</Option>
            </Select>
          </Form.Item>
          <Form.Item name="targetScore" label="目标分数" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="moves" label="步数" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LevelManage;
