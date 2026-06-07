import React, { useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Modal, Form, message, Select, Switch } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, DollarOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;

const AdManage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const adData = [
    { key: '1', id: 'AD001', name: '激励视频广告', type: 'reward', platform: 'tencent', status: 'active', dailyViews: 12500, revenue: 1500 },
    { key: '2', id: 'AD002', name: 'Banner广告', type: 'banner', platform: 'tencent', status: 'active', dailyViews: 28000, revenue: 850 },
    { key: '3', id: 'AD003', name: '插屏广告', type: 'interstitial', platform: 'tencent', status: 'inactive', dailyViews: 0, revenue: 0 },
  ];

  const columns = [
    { title: '广告ID', dataIndex: 'id', key: 'id' },
    { title: '广告名称', dataIndex: 'name', key: 'name' },
    { title: '广告类型', dataIndex: 'type', key: 'type', render: (type: string) => {
      const typeMap: Record<string, string> = { reward: '激励视频', banner: 'Banner', interstitial: '插屏' };
      return <Tag color="blue">{typeMap[type] || type}</Tag>;
    }},
    { title: '平台', dataIndex: 'platform', key: 'platform' },
    { title: '日展示', dataIndex: 'dailyViews', key: 'dailyViews', render: (views: number) => views.toLocaleString() },
    { title: '收益 (¥)', dataIndex: 'revenue', key: 'revenue', render: (revenue: number) => <span style={{ color: '#52c41a' }}>{revenue.toLocaleString()}</span> },
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
      <Title level={3}>广告管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="搜索广告" prefix={<SearchOutlined />} style={{ width: 250 }} />
          <Select placeholder="广告类型" style={{ width: 150 }}>
            <Option value="all">全部</Option>
            <Option value="reward">激励视频</Option>
            <Option value="banner">Banner</Option>
            <Option value="interstitial">插屏</Option>
          </Select>
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            添加广告
          </Button>
        </Space>
      </Card>

      <Card>
        <Table dataSource={adData} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="添加广告位"
        open={isModalOpen}
        onOk={() => { message.success('广告添加成功'); setIsModalOpen(false); }}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="广告名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="广告类型" rules={[{ required: true }]}>
            <Select>
              <Option value="reward">激励视频</Option>
              <Option value="banner">Banner</Option>
              <Option value="interstitial">插屏</Option>
            </Select>
          </Form.Item>
          <Form.Item name="platform" label="广告平台" rules={[{ required: true }]}>
            <Select>
              <Option value="tencent">腾讯优量汇</Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AdManage;
