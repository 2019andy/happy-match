import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Space, Input, Select, Tag, Typography, Modal, Form, message, InputNumber, Popconfirm } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, TrophyOutlined, ClearOutlined } from '@ant-design/icons';
import axios from 'axios';
import { API_CONFIG, getFullUrl } from '../config/apiConfig';

const { Title } = Typography;
const { Option } = Select;

const LevelManage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();
  const [levelData, setLevelData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // 从缓存API加载数据（数据库 → 缓存 → 页面）
  const loadLevelsFromCache = async () => {
    setLoading(true);
    try {
      const response = await axios.get(getFullUrl(API_CONFIG.ENDPOINTS.LEVELS));
      if (response.data.success) {
        const levels = response.data.data.map((level: any) => ({
          key: level.id.toString(),
          id: `L${String(level.id).padStart(3, '0')}`,
          level: level.level,
          difficulty: level.difficulty,
          targetScore: level.targetScore,
          moves: level.moves,
          status: level.status,
        }));
        setLevelData(levels);
        // 同时保存到localStorage作为备份
        localStorage.setItem('adminLevelList', JSON.stringify(levels));
        message.success(`已从缓存加载 ${levels.length} 个关卡数据`);
      }
    } catch (error) {
      console.error('从缓存加载失败:', error);
      // 如果API失败，尝试从localStorage加载
      const savedData = localStorage.getItem('adminLevelList');
      if (savedData) {
        setLevelData(JSON.parse(savedData));
        message.warning('API加载失败，已从localStorage加载');
      } else {
        message.error('加载关卡数据失败');
      }
    } finally {
      setLoading(false);
    }
  };

  // 初始化时从缓存加载数据
  useEffect(() => {
    loadLevelsFromCache();
  }, []);

  // 保存数据到localStorage（本地备份）
  const saveData = (data: any[]) => {
    setLevelData(data);
    localStorage.setItem('adminLevelList', JSON.stringify(data));
  };

  // 删除关卡
  const handleDeleteLevel = (key: string) => {
    const newData = levelData.filter(item => item.key !== key);
    saveData(newData);
    message.success('关卡删除成功');
  };

  // 清除所有关卡数据（清除缓存 + localStorage）
  const handleClearAllLevels = async () => {
    try {
      // 清除后端缓存
      await axios.post(getFullUrl(API_CONFIG.ENDPOINTS.CACHE_CLEAR));
      // 清除前端localStorage
      localStorage.removeItem('adminLevelList');
      setLevelData([]);
      message.success('所有关卡数据已清除（缓存 + localStorage）');
    } catch (error) {
      console.error('清除数据失败:', error);
      // 即使API失败，也清除localStorage
      localStorage.removeItem('adminLevelList');
      setLevelData([]);
      message.warning('后端缓存清除失败，但localStorage已清除');
    }
  };

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
      render: (_, record: any) => (
        <Space size="small">
          <Button type="link" icon={<EditOutlined />}>编辑</Button>
          <Popconfirm
            title="确认删除"
            description="确定要删除这个关卡吗？"
            onConfirm={() => handleDeleteLevel(record.key)}
            okText="确认"
            cancelText="取消"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  const handleModalOk = () => {
    form.validateFields()
      .then((values) => {
        const newLevel = {
          key: Date.now().toString(),
          id: `L${String(levelData.length + 1).padStart(3, '0')}`,
          level: values.level,
          difficulty: values.difficulty,
          targetScore: values.targetScore,
          moves: values.moves,
          status: 'active',
        };
        const newData = [...levelData, newLevel];
        saveData(newData);
        message.success('关卡添加成功');
        setIsModalOpen(false);
        form.resetFields();
      })
      .catch(() => {});
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <Title level={3} style={{ margin: 0 }}>关卡管理</Title>
        <Button danger icon={<ClearOutlined />} onClick={handleClearAllLevels}>
          清除所有数据
        </Button>
      </div>
      
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
        <Table 
          dataSource={levelData} 
          columns={columns} 
          pagination={{ pageSize: 10 }}
          loading={loading}
        />
      </Card>

      <Modal
        title="添加关卡"
        open={isModalOpen}
        onOk={handleModalOk}
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
