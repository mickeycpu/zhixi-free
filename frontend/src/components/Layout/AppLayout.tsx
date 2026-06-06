import { Layout, Button, Typography } from 'antd';
import {
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
} from '@ant-design/icons';
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
  const user = useAuthStore((s) => s.user);

  return (
    <Layout style={{ minHeight: '100vh', background: 'var(--color-bg)' }}>
      {!isMobile && (
        <Sidebar collapsed={sidebarCollapsed} onCollapse={toggleSidebar} />
      )}
      <Layout style={{ background: 'transparent' }}>
        <Header
          style={{
            background: 'var(--color-surface)',
            padding: isMobile ? '0 16px' : '0 28px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid var(--color-border-light)',
            height: 56,
            boxShadow: 'var(--shadow-sm)',
            position: 'sticky',
            top: 0,
            zIndex: 10,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {!isMobile && (
              <Button
                type="text"
                icon={sidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                onClick={toggleSidebar}
                style={{ color: 'var(--color-text-secondary)', fontSize: 16 }}
              />
            )}
            {isMobile && (
              <Typography.Text strong style={{ fontSize: 18, color: 'var(--color-primary)' }}>
                智析免费版
              </Typography.Text>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Button
              type="text"
              icon={<BellOutlined style={{ fontSize: 18, color: 'var(--color-text-secondary)' }} />}
            />
            {!isMobile && user && (
              <Typography.Text style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginRight: 4 }}>
                {(user as any).email || (user as any).phone}
              </Typography.Text>
            )}
            <Button
              type="text"
              icon={<LogoutOutlined />}
              onClick={logout}
              style={{ color: 'var(--color-text-muted)' }}
            >
              {!isMobile && '退出'}
            </Button>
          </div>
        </Header>

        <Content
          style={{
            margin: isMobile ? 12 : 28,
            padding: isMobile ? 16 : 28,
            background: 'var(--color-surface)',
            borderRadius: 'var(--radius-lg)',
            minHeight: 280,
            paddingBottom: isMobile ? 80 : 28,
            boxShadow: 'var(--shadow-sm)',
          }}
        >
          <Outlet />
        </Content>
      </Layout>
      {isMobile && <MobileNav />}
    </Layout>
  );
}
