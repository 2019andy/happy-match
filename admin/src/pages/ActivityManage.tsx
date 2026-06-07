import React, { useState } from 'react';
import { Card, Table, Button, Space, Input, Tag, Typography, Modal, Form, message, DatePicker, Switch } from 'antd';
import { SearchOutlined, PlusOutlined, EditOutlined, DeleteOutlined, CalendarOutlined } from '@ant-design/icons';

const { Title } = Typography;

const ActivityManage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [form] = Form.useForm();

  const activityData = [
    { key: '1', id: 'A001', name: '新手登录奖励', type: 'login', status: 'active', startDate: '2024-06-01', endDate: '2024-06-15', participants: 1250 },
    { key: '2', id: 'A002', name: '周末双倍金币', type: 'bonus', status: 'active', startDate: '2024-06-08', endDate: '2024-06-09', participants: 850 },
  ];

  const columns = [
    { title: '活动ID', dataIndex: 'id', key: 'id' },
    { title: '活动名称', dataIndex: 'name', key: 'name' },
    { title: '活动类型', dataIndex: 'type', key: 'type', render: (type: string) => <Tag color="blue">{type === 'login' ? '登录奖励' : type === 'bonus' ? '双倍收益' : '其他'}</Tag> },
    { title: '开始时间', dataIndex: 'startDate', key: 'startDate' },
    { title: '结束时间', dataIndex: 'endDate', key: 'endDate' },
    { title: '参与人数', dataIndex: 'participants', key: 'participants' },
    { title: '状态', dataIndex: 'status', key: 'status', render: (status: string) => <Tag color={status === 'active' ? 'green' : 'red'}>{status === 'active' ? '进行中' : '已结束'}</Tag> },
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
      <Title level={3}>活动管理</Title>
      
      <Card style={{ marginBottom: 16 }}>
        <Space>
          <Input placeholder="搜索活动" prefix={<SearchOutlined />} style={{ width: 250 }} />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            添加活动
          </Button>
        </Space>
      </Card>

      <Card>
        <Table dataSource={activityData} columns={columns} pagination={{ pageSize: 10 }} />
      </Card>

      <Modal
        title="添加活动"
        open={isModalOpen}
        onOk={() => { message.success('活动添加成功'); setIsModalOpen(false); }}
        onCancel={() => setIsModalOpen(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item name="name" label="活动名称" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="type" label="活动类型" rules={[{ required: true }]}>
            <Input />
          </Form.Item>
          <Form.Item name="startDate" label="开始时间" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="endDate" label="结束时间" rules={[{ required: true }]}>
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default ActivityManage;
