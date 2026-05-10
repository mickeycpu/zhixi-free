import { Layout, Button, Typography } from 'antd';
import { LogoutOutlined } from '@ant-design/icons';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import MobileNav from './MobileNav';
import { useResponsive } from '../../hooks/useResponsive';
import { useAppStore } from '../../stores/appStore';
import { useAuthStore } from '../../stores/authStore';

const { Header, Content } = Layout;

export default function AppLayout() {
  const { isMobile } = useResponsive();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const logout = useAuthStore((s) => s.logout);

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {!isMobile && (
        <Sidebar collapsed={sidebarCollapsed} onCollapse={toggleSidebar} />
      )}
      <Layout>
        <Header
          style={{
            background: '#fff',
            padding: isMobile ? '0 16px' : '0 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid #f0f0f0',
            height: 56,
          }}
        >
          {isMobile && (
            <Typography.Text strong style={{ fontSize: 18, color: '#1677ff' }}>
              智析免费版
            </Typography.Text>
          )}
          <div style={{ flex: 1 }} />
          <Button
            type="text"
            icon={<LogoutOutlined />}
            onClick={logout}
            danger
          >
            {!isMobile && '退出登录'}
          </Button>
        </Header>
        <Content
          style={{
            margin: isMobile ? 12 : 24,
            padding: isMobile ? 16 : 24,
            background: '#fff',
            borderRadius: 8,
            minHeight: 280,
            paddingBottom: isMobile ? 80 : 24,
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      {isMobile && <MobileNav />}
    </Layout>
  );
}
