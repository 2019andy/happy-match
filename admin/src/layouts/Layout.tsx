import React from 'react';
import { Layout, Menu, theme, Button, Popconfirm, message } from 'antd';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UserOutlined,
  TrophyOutlined,
  CalendarOutlined,
  DollarOutlined,
  ShoppingOutlined,
  BarChartOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import axios from 'axios';

const { Header, Sider, Content } = Layout;

const menuItems = [
  {
    key: '/dashboard',
    icon: <DashboardOutlined />,
    label: '数据概览',
  },
  {
    key: '/users',
    icon: <UserOutlined />,
    label: '用户管理',
  },
  {
    key: '/levels',
    icon: <TrophyOutlined />,
    label: '关卡管理',
  },
  {
    key: '/activities',
    icon: <CalendarOutlined />,
    label: '活动管理',
  },
  {
    key: '/ads',
    icon: <DollarOutlined />,
    label: '广告管理',
  },
  {
    key: '/analytics',
    icon: <BarChartOutlined />,
    label: '数据分析',
  },
  {
    key: '/shop',
    icon: <ShoppingOutlined />,
    label: '商店管理',
  },
];

const LayoutComponent: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  const handleClearAllData = async () => {
    try {
      await axios.post('http://localhost:3001/api/auth/clear-all-data');
      message.success('后端数据已清除！');
      localStorage.clear();
      message.success('前端数据已清除！');
      setTimeout(() => window.location.reload(), 1000);
    } catch (error) {
      console.error('清除数据失败:', error);
      message.error('清除数据失败，请重试');
    }
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" width={240}>
        <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
          🍬 甜趣点点消
        </div>
        <Menu
          theme="dark"
          selectedKeys={[location.pathname]}
          mode="inline"
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header style={{ padding: 0, background: colorBgContainer, display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingRight: 24 }}>
          <div style={{ paddingLeft: 24, fontSize: 16, fontWeight: 600 }}>
            管理后台
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Popconfirm
              title="清除所有数据"
              description="确定要清除所有前端和后端数据吗？此操作不可恢复！"
              onConfirm={handleClearAllData}
              okText="确定"
              cancelText="取消"
              okType="danger"
            >
              <Button danger icon={<DeleteOutlined />}>
                清除所有数据
              </Button>
            </Popconfirm>
            <span>管理员</span>
          </div>
        </Header>
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            minHeight: 280,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default LayoutComponent;
