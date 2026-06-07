import React, { useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Modal, Form, message, InputNumber } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, ShoppingOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ShopManage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const shopData = [
    { key: '1', id: 'S001', name: '500金币', type: 'coins', price: 5, status: 'active', sales: 1250 },
    { key: '2', id: 'S002', name: '100钻石', type: 'diamonds', price: 10, status: 'active', sales: 850 },
    { key: '3', id: 'S003', name: '无限体力包', type: 'energy', price: 15, status: 'active', sales: 320 },
  ];

  const columns = [
    { title: '商品ID', dataIndex: 'id', key: 'id' },
    { title: '商品名称', dataIndex: 'name', key: 'name' },
    { title: '类型', dataIndex: 'type', key: 'type', render: (type: string) => {
      const typeMap: Record<string, string> = { coins: '金币', diamonds: '钻石', energy: '体力', item: '道具' };
      return <Tag color="blue">{typeMap[type] || type}</Tag>;
    }},
    { title: '价格 (¥)', dataIndex: 'price', key: 'price', render: (price: number) => <span style={{ color: '#faad14' }}>¥{price}</span> },
    { title: '销量', dataIndex: 'sales', key: 'sales', render: (sales: number) => sales.toLocaleString() },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '上架' : '下架'}</Tag> },
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
      <Title level={3}>商店管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="搜索商品" prefix={<SearchOutlined />} style={{ width: 250 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            添加商品
          </Button>
        </Space>
      </Card>

      <Card>
        <Table dataSource={shopData} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="添加商品"
        open={isModalOpen}
        onOk={() => { message.success('商品添加成功'); setIsModalOpen(false); }}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="商品名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="price" label="价格 (¥)" rules={[{ required: true }]}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ShopManage;
