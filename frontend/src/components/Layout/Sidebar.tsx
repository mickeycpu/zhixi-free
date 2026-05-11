import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu, Badge } from 'antd';
import {
  DashboardOutlined,
  UploadOutlined,
  UserOutlined,
  FileTextOutlined,
  AlertOutlined,
  MessageOutlined,
  HomeOutlined,
  SettingOutlined,
} from '@ant-design/icons';
import { getAlerts } from '../../api/alerts';

const { Sider } = Layout;

export default function Sidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (v: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [unread, setUnread] = useState(0);
  const selectedKey = '/' + (location.pathname.split('/')[1] || '');

  useEffect(() => {
    getAlerts().then((res) => {
      if (res.code === 0) {
        setUnread(res.data.filter((a: any) => !a.is_read).length);
      }
    });
  }, [location.pathname]);

  const menuItems = [
    { key: '/', icon: <HomeOutlined />, label: '首页' },
    { key: '/dashboard', icon: <DashboardOutlined />, label: '销售看板' },
    { key: '/upload', icon: <UploadOutlined />, label: '数据上传' },
    { key: '/customers', icon: <UserOutlined />, label: '客户分析' },
    { key: '/report', icon: <FileTextOutlined />, label: 'AI经营报告' },
    {
      key: '/alerts',
      icon: <AlertOutlined />,
      label: (
        <span>
          预警中心
          {unread > 0 && (
            <Badge
              count={unread}
              size="small"
              offset={[6, -2]}
              style={{ boxShadow: 'none' }}
            />
          )}
        </span>
      ),
    },
    { key: '/feedback', icon: <MessageOutlined />, label: '意见反馈' },
    { key: '/profile', icon: <SettingOutlined />, label: '个人中心' },
  ];

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      width={220}
      style={{
        background: 'var(--color-sidebar)',
        borderRight: 'none',
      }}
      trigger={null}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 800,
          fontSize: collapsed ? 16 : 22,
          color: '#e0e7ff',
          letterSpacing: 2,
          background: 'linear-gradient(135deg, rgba(79,70,229,0.3) 0%, rgba(124,58,237,0.15) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          userSelect: 'none',
          padding: '0 8px',
          cursor: 'pointer',
        }}
        onClick={() => navigate('/')}
      >
        {collapsed ? '智析' : '智析免费版'}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{
          borderRight: 0,
          marginTop: 8,
          background: 'transparent',
          color: 'var(--color-sidebar-text)',
        }}
        theme="dark"
      />
    </Sider>
  );
}
