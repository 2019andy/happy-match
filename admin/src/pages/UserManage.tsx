import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, Typography, Modal, Form, message, Popconfirm, InputNumber } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ClearOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_CONFIG, getFullUrl } from '../config/apiConfig';

const { Title } = Typography;
const { Option } = Select;

interface UserRecord {
  key: string;
  id: string;
  name: string;
  avatar: string;
  level: number;
  coins: number;
  diamonds: number;
  totalScore: number;
  highestScore: number;
  totalStars: number;
  totalPlays: number;
  totalEliminations: number;
  energy: number;
  maxEnergy: number;
  status: string;
  registerDate: string;
  lastLogin: string;
  isDeleted?: boolean;
}

const UserManage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [addForm] = Form.useForm();
  const [editForm] = Form.useForm();
  const [userData, setUserData] = useState<UserRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserRecord | null>(null);

  // 从缓存API加载数据（数据库 → 缓存 → 页面）
  const loadUsersFromCache = async () => {
    setLoading(true);
    try {
      const response = await axios.get(getFullUrl(API_CONFIG.ENDPOINTS.USERS));
      if (response.data.success) {
        const users: UserRecord[] = response.data.data.map((user: any) => ({
          key: user.id,
          id: user.id,
          name: user.nickname,
          avatar: user.avatar,
          level: user.currentLevel,
          coins: user.coins,
          diamonds: user.diamonds,
          totalScore: user.totalScore,
          highestScore: user.highestScore,
          totalStars: user.totalStars,
          totalPlays: user.totalPlays,
          totalEliminations: user.totalEliminations,
          energy: user.energy,
          maxEnergy: user.maxEnergy,
          status: user.status || 'active',
          registerDate: user.createdAt ? user.createdAt.split('T')[0] : '-',
          lastLogin: user.lastLoginDate ? user.lastLoginDate.split('T')[0] : '-',
          isDeleted: user.isDeleted || false,
        }));
        setUserData(users);
        localStorage.setItem('adminUserList', JSON.stringify(users));
        message.success(`已从缓存加载 ${users.length} 个用户数据`);
      }
    } catch (error) {
      console.error('从缓存加载失败:', error);
      const savedData = localStorage.getItem('adminUserList');
      if (savedData) {
        setUserData(JSON.parse(savedData));
        message.warning('API加载失败，已从localStorage加载');
      } else {
        message.error('加载用户数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化时从缓存加载数据
  useEffect(() => {
    loadUsersFromCache();
  }, []);

  // 逻辑删除用户（通过API）
  const handleDeleteUser = async (userId: string) => {
    try {
      const response = await axios.delete(`http://localhost:3001/api/admin/users/${userId}`);
      if (response.data.success) {
        // 从本地列表中移除该用户
        const newData = userData.filter(item => item.id !== userId);
        setUserData(newData);
        localStorage.setItem('adminUserList', JSON.stringify(newData));
        message.success('用户已逻辑删除');
      } else {
        message.error(response.data.message || '删除失败');
      }
    } catch (error) {
      console.error('删除用户失败:', error);
      // 降级处理：仅更新本地状态
      const newData = userData.filter(item => item.id !== userId);
      setUserData(newData);
      localStorage.setItem('adminUserList', JSON.stringify(newData));
      message.warning('后端连接失败，但已从本地列表移除');
    }
  };

  // 清除所有用户数据
  const handleClearAllUsers = async () => {
    try {
      await axios.post('http://localhost:3001/api/admin/cache/clear');
      localStorage.removeItem('adminUserList');
      setUserData([]);
      message.success('所有用户数据已清除');
    } catch (error) {
      console.error('清除数据失败:', error);
      localStorage.removeItem('adminUserList');
      setUserData([]);
      message.warning('后端缓存清除失败，但localStorage已清除');
    }
  };

  // 添加新用户
  const handleAddUser = () => {
    setIsModalOpen(true);
  };

  // 添加用户确认
  const handleAddOk = async () => {
    try {
      const values = await addForm.validateFields();
      const response = await axios.post('http://localhost:3001/api/admin/users', {
        nickname: values.username,
        coins: values.coins || 100,
        diamonds: values.diamonds || 10,
        currentLevel: 1,
        avatar: '👤',
      });

      if (response.data.success) {
        const user = response.data.data;
        const newRecord: UserRecord = {
          key: user.id,
          id: user.id,
          name: user.nickname,
          avatar: user.avatar,
          level: user.currentLevel,
          coins: user.coins,
          diamonds: user.diamonds,
          totalScore: user.totalScore || 0,
          highestScore: user.highestScore || 0,
          totalStars: user.totalStars || 0,
          totalPlays: user.totalPlays || 0,
          totalEliminations: user.totalEliminations || 0,
          energy: user.energy,
          maxEnergy: user.maxEnergy,
          status: user.status,
          registerDate: user.createdAt ? user.createdAt.split('T')[0] : '-',
          lastLogin: user.lastLoginDate ? user.lastLoginDate.split('T')[0] : '-',
          isDeleted: false,
        };

        const newData = [...userData, newRecord];
        setUserData(newData);
        localStorage.setItem('adminUserList', JSON.stringify(newData));
        message.success('用户添加成功');
        setIsModalOpen(false);
        addForm.resetFields();
      }
    } catch (error) {
      console.error('添加用户失败:', error);
      message.error('添加用户失败');
    }
  };

  // 打开编辑用户对话框
  const handleEditUser = (record: UserRecord) => {
    setCurrentUser(record);
    editForm.setFieldsValue({
      username: record.name,
      level: record.level,
      coins: record.coins,
      diamonds: record.diamonds,
      totalScore: record.totalScore,
      totalStars: record.totalStars,
      energy: record.energy,
      status: record.status,
    });
    setIsEditModalOpen(true);
  };

  // 编辑用户确认
  const handleEditOk = async () => {
    if (!currentUser) return;
    
    try {
      const values = await editForm.validateFields();
      const response = await axios.put(getFullUrl(API_CONFIG.ENDPOINTS.USER_BY_ID(currentUser.id)), {
        nickname: values.username,
        currentLevel: values.level,
        coins: values.coins,
        diamonds: values.diamonds,
        totalScore: values.totalScore,
        totalStars: values.totalStars,
        energy: values.energy,
        status: values.status,
      });

      if (response.data.success) {
        const user = response.data.data;
        const updatedRecord: UserRecord = {
          key: user.id,
          id: user.id,
          name: user.nickname,
          avatar: user.avatar,
          level: user.currentLevel,
          coins: user.coins,
          diamonds: user.diamonds,
          totalScore: user.totalScore || 0,
          highestScore: user.highestScore || 0,
          totalStars: user.totalStars || 0,
          totalPlays: user.totalPlays || 0,
          totalEliminations: user.totalEliminations || 0,
          energy: user.energy,
          maxEnergy: user.maxEnergy,
          status: user.status,
          registerDate: user.createdAt ? user.createdAt.split('T')[0] : '-',
          lastLogin: user.lastLoginDate ? user.lastLoginDate.split('T')[0] : '-',
          isDeleted: false,
        };

        const newData = userData.map(item =>
          item.id === currentUser.id ? updatedRecord : item
        );
        setUserData(newData);
        localStorage.setItem('adminUserList', JSON.stringify(newData));
        message.success('用户信息更新成功');
        setIsEditModalOpen(false);
        setCurrentUser(null);
        editForm.resetFields();
      }
    } catch (error) {
      console.error('更新用户失败:', error);
      message.error('更新用户失败');
    }
  };

  const columns = [
    { title: '用户ID', dataIndex: 'id', key: 'id', width: 120 },
    { title: '用户名', dataIndex: 'name', key: 'name', width: 120 },
    { title: '等级', dataIndex: 'level', key: 'level', width: 80 },
    { title: '金币', dataIndex: 'coins', key: 'coins', width: 100, render: (coins: number) => <span style={{ color: '#faad14' }}>{coins.toLocaleString()}</span> },
    { title: '钻石', dataIndex: 'diamonds', key: 'diamonds', width: 100, render: (diamonds: number) => <span style={{ color: '#52c41a' }}>{diamonds.toLocaleString()}</span> },
    { title: '总分', dataIndex: 'totalScore', key: 'totalScore', width: 120 },
    { title: '总星数', dataIndex: 'totalStars', key: 'totalStars', width: 100 },
    { title: '体力', dataIndex: 'energy', key: 'energy', width: 80 },
    { title: '状态', dataIndex: 'status', key: 'status', width: 100, render: (status: string) => {
      if (status === 'deleted') return <Tag color="gray">已删除</Tag>;
      if (status === 'active') return <Tag color="green">活跃</Tag>;
      return <Tag color="red">不活跃</Tag>;
    }},
    { title: '注册时间', dataIndex: 'registerDate', key: 'registerDate', width: 120 },
    { title: '最后登录', dataIndex: 'lastLogin', key: 'lastLogin', width: 120 },
    {
      title: '操作',
      key: 'action',
      width: 150,
      render: (_, record: UserRecord) => (
        <Space size="small">
          <Button 
            type="link" 
            icon={<EditOutlined />} 
            onClick={() => handleEditUser(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个用户吗？（逻辑删除，数据仍保留）"
            onConfirm={() => handleDeleteUser(record.id)}
            okText="确认"
            cancelText="取消"
            okType="danger"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>用户管理</Title>
        <Space>
          <Button type="primary" icon={<PlusOutlined />} onClick={handleAddUser}>
            添加用户
          </Button>
          <Button danger icon={<ClearOutlined />} onClick={handleClearAllUsers}>
            清除所有数据
          </Button>
        </Space>
      </div>
      
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="搜索用户" prefix={<SearchOutlined />} style={{ width: 250 }} />
          <Select placeholder="用户状态" style={{ width: 150 }}>
            <Option value="all">全部</Option>
            <Option value="active">活跃</Option>
            <Option value="inactive">不活跃</Option>
          </Select>
          <Button type="primary" icon={<SearchOutlined />}>
            搜索
          </Button>
          <Button onClick={loadUsersFromCache}>
            刷新
          </Button>
        </Space>
      </Card>

      <Card>
        <Table 
          dataSource={userData} 
          columns={columns} 
          pagination={{ pageSize: 10 }}
          loading={loading}
          scroll={{ x: 1400 }}
        />
      </Card>

      {/* 添加用户对话框 */}
      <Modal
        title="添加用户"
        open={isModalOpen}
        onOk={handleAddOk}
        onCancel={() => {
          setIsModalOpen(false);
          addForm.resetFields();
        }}
        okText="确认"
        cancelText="取消"
      >
        <Form form={addForm} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="coins" label="初始金币" initialValue={100}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="diamonds" label="初始钻石" initialValue={10}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 编辑用户对话框 */}
      <Modal
        title="编辑用户信息"
        open={isEditModalOpen}
        onOk={handleEditOk}
        onCancel={() => {
          setIsEditModalOpen(false);
          setCurrentUser(null);
          editForm.resetFields();
        }}
        okText="保存"
        cancelText="取消"
      >
        <Form form={editForm} layout="vertical">
          <Form.Item name="username" label="用户名" rules={[{ required: true, message: '请输入用户名' }]}>
            <Input placeholder="请输入用户名" />
          </Form.Item>
          <Form.Item name="level" label="等级">
            <InputNumber style={{ width: '100%' }} min={1} />
          </Form.Item>
          <Form.Item name="coins" label="金币">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="diamonds" label="钻石">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="totalScore" label="总分数">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="totalStars" label="总星数">
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
          <Form.Item name="energy" label="体力">
            <InputNumber style={{ width: '100%' }} min={0} max={999} />
          </Form.Item>
          <Form.Item name="status" label="状态">
            <Select>
              <Option value="active">活跃</Option>
              <Option value="inactive">不活跃</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default UserManage;