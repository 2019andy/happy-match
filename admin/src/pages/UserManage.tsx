import React, { useState } from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, Typography, Modal, Form, message } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const UserManage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const userData = [
    { key: '1', id: 'U001', name: '玩家A', level: 15, coins: 12500, diamonds: 250, status: 'active', registerDate: '2024-01-15' },
    { key: '2', id: 'U002', name: '玩家B', level: 23, coins: 28000, diamonds: 500, status: 'active', registerDate: '2024-02-20' },
    { key: '3', id: 'U003', name: '玩家C', level: 8, coins: 5000, diamonds: 100, status: 'inactive', registerDate: '2024-03-10' },
    { key: '4', id: 'U004', name: '玩家D', level: 45, coins: 85000, diamonds: 1200, status: 'active', registerDate: '2024-01-05' },
  ];

  const columns = [
    { title: '用户ID', dataIndex: 'id', key: 'id' },
    { title: '用户名', dataIndex: 'name', key: 'name' },
    { title: '等级', dataIndex: 'level', key: 'level' },
    { title: '金币', dataIndex: 'coins', key: 'coins', render: (coins: number) => <span style={{ color: '#faad14' }}>{coins.toLocaleString()}</span> },
    { title: '钻石', dataIndex: 'diamonds', key: 'diamonds', render: (diamonds: number) => <span style={{ color: '#52c41a' }}>{diamonds.toLocaleString()}</span> },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '活跃' : '不活跃'}</Tag> },
    { title: '注册时间', dataIndex: 'registerDate', key: 'registerDate' },
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

  const handleAdd = () => {
    setIsModalOpen(true);
  };

  const handleModalOk = () => {
    form.validateFields()
      .then(() => {
        message.success('用户添加成功');
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch(() => {});
  };

  return (
    <div>
      <Title level={3}>用户管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="搜索用户" prefix={<SearchOutlined />} style={{ width: 250 }} />
          <Select placeholder="用户状态" style={{ width: 150 }}>
            <Option value="all">全部</Option>
            <Option value="active">活跃</Option>
            <Option value="inactive">不活跃</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
            添加用户
          </Button>
        </Space>
      </Card>

      <Card>
        <Table dataSource={userData} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="添加用户"
        open={isModalOpen}
        onOk={handleModalOk}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="coins" label="初始金币" rules={[{ required: true }]}>
            <Input type="number" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManage;
