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
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <div
        style={{
          height: 64,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: collapsed ? 16 : 20,
          color: '#1677ff',
          borderBottom: '1px solid #f0f0f0',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
        }}
      >
        {collapsed ? '智析' : '智析免费版'}
      </div>
      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={menuItems}
        onClick={({ key }) => navigate(key)}
        style={{ borderRight: 0, marginTop: 8 }}
      />
    </Sider>
  );
}
