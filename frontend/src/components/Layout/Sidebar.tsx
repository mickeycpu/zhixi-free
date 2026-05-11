import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Menu } from 'antd';
import {
  DashboardOutlined,
  UploadOutlined,
  UserOutlined,
  FileTextOutlined,
  AlertOutlined,
  MessageOutlined,
} from '@ant-design/icons';

const { Sider } = Layout;

const menuItems = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '销售看板' },
  { key: '/upload', icon: <UploadOutlined />, label: '数据上传' },
  { key: '/customers', icon: <UserOutlined />, label: '客户分析' },
  { key: '/report', icon: <FileTextOutlined />, label: 'AI经营报告' },
  { key: '/alerts', icon: <AlertOutlined />, label: '预警中心' },
  { key: '/feedback', icon: <MessageOutlined />, label: '意见反馈' },
];

interface Props {
  collapsed: boolean;
  onCollapse: (v: boolean) => void;
}

export default function Sidebar({ collapsed, onCollapse }: Props) {
  const navigate = useNavigate();
  const location = useLocation();
  const selectedKey = '/' + (location.pathname.split('/')[1] || 'dashboard');

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
          fontSize: collapsed ? 18 : 22,
          color: '#fff',
          letterSpacing: 1,
          background: 'linear-gradient(135deg, rgba(79,70,229,0.3) 0%, rgba(124,58,237,0.15) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.08)',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          userSelect: 'none',
        }}
      >
        {collapsed ? (
          <span style={{ background: 'linear-gradient(135deg, #a78bfa, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            智析
          </span>
        ) : (
          <span style={{ background: 'linear-gradient(135deg, #c4b5fd, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            智析免费版
          </span>
        )}
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
