import { useNavigate, useLocation } from 'react-router-dom';
import {
  DashboardOutlined,
  UploadOutlined,
  UserOutlined,
  FileTextOutlined,
  AlertOutlined,
  SafetyCertificateOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../../stores/authStore';
import { isAdminUser } from '../../utils/admin';

const tabs = [
  { key: '/dashboard', icon: <DashboardOutlined />, label: '看板' },
  { key: '/upload', icon: <UploadOutlined />, label: '上传' },
  { key: '/customers', icon: <UserOutlined />, label: '客户' },
  { key: '/report', icon: <FileTextOutlined />, label: '报告' },
  { key: '/alerts', icon: <AlertOutlined />, label: '预警' },
];

export default function MobileNav() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const current = '/' + (location.pathname.split('/')[1] || 'dashboard');
  const visibleTabs = isAdminUser(user)
    ? [...tabs, { key: '/admin', icon: <SafetyCertificateOutlined />, label: '管理' }]
    : tabs;

  return (
    <nav
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: '#fff',
        borderTop: '1px solid #f0f0f0',
        display: 'flex',
        justifyContent: 'space-around',
        padding: '6px 0',
        paddingBottom: 'env(safe-area-inset-bottom, 6px)',
      }}
    >
      {visibleTabs.map((t) => {
        const active = current === t.key;
        return (
          <div
            key={t.key}
            onClick={() => navigate(t.key)}
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 2,
              padding: '4px 12px',
              cursor: 'pointer',
              color: active ? '#1677ff' : '#999',
              fontSize: 11,
            }}
          >
            <span style={{ fontSize: 20 }}>{t.icon}</span>
            <span>{t.label}</span>
          </div>
        );
      })}
    </nav>
  );
}
