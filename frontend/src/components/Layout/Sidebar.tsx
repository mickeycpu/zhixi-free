import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Layout, Badge, Typography } from 'antd';
import {
  HomeOutlined,
  DashboardOutlined,
  UploadOutlined,
  UserOutlined,
  FileTextOutlined,
  AlertOutlined,
  MessageOutlined,
  SettingOutlined,
  SafetyCertificateOutlined,
  LogoutOutlined,
} from '@ant-design/icons';
import { getAlerts } from '../../api/alerts';
import { useAuthStore } from '../../stores/authStore';
import type { AlertItem } from '../../types';
import { isAdminUser } from '../../utils/admin';

const { Sider } = Layout;

interface MenuItem {
  key: string;
  icon: React.ReactNode;
  label: string;
  badge?: number;
}

const iconStyle: React.CSSProperties = { fontSize: 18 };

export default function Sidebar({ collapsed, onCollapse }: { collapsed: boolean; onCollapse: (v: boolean) => void }) {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [unread, setUnread] = useState(0);
  const selectedKey = '/' + (location.pathname.split('/')[1] || '');
  const isAdmin = isAdminUser(user);

  useEffect(() => {
    if (!isAdmin) {
      getAlerts().then((res) => {
        if (res.code === 0) setUnread(res.data.filter((a: AlertItem) => !a.is_read).length);
      });
    }
  }, [location.pathname, isAdmin]);

  // ====== 用户菜单 ======
  const userSections: { group: string; items: MenuItem[] }[] = [
    {
      group: '主菜单',
      items: [
        { key: '/home', icon: <HomeOutlined style={iconStyle} />, label: '首页' },
        { key: '/dashboard', icon: <DashboardOutlined style={iconStyle} />, label: '销售看板' },
        { key: '/upload', icon: <UploadOutlined style={iconStyle} />, label: '数据上传' },
        { key: '/customers', icon: <UserOutlined style={iconStyle} />, label: '客户分析' },
      ],
    },
    {
      group: '智能分析',
      items: [
        { key: '/report', icon: <FileTextOutlined style={iconStyle} />, label: 'AI经营报告' },
        { key: '/alerts', icon: <AlertOutlined style={iconStyle} />, label: '预警中心', badge: unread },
      ],
    },
    {
      group: '更多',
      items: [
        { key: '/feedback', icon: <MessageOutlined style={iconStyle} />, label: '意见反馈' },
        { key: '/profile', icon: <SettingOutlined style={iconStyle} />, label: '个人中心' },
      ],
    },
  ];

  // ====== 管理员菜单 ======
  const adminSections: { group: string; items: MenuItem[] }[] = [
    {
      group: '管理后台',
      items: [
        { key: '/admin', icon: <SafetyCertificateOutlined style={iconStyle} />, label: '管理员概览' },
      ],
    },
  ];

  const sections = isAdmin ? adminSections : userSections;

  // ====== 公共样式常量 ======
  const menuItemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
    margin: '2px 8px',
    borderRadius: 10,
    cursor: 'pointer',
    color: active ? '#e0e7ff' : 'var(--color-sidebar-text)',
    background: active ? 'rgba(99, 102, 241, 0.35)' : 'transparent',
    fontWeight: active ? 600 : 400,
    transition: 'all 0.15s ease',
    fontSize: 14,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  });

  const sectionLabelStyle: React.CSSProperties = {
    padding: '16px 16px 6px',
    fontSize: 11,
    fontWeight: 600,
    color: 'rgba(199, 210, 254, 0.5)',
    textTransform: 'uppercase' as const,
    letterSpacing: 1.5,
    whiteSpace: 'nowrap',
  };

  const email = (user as any)?.email || (user as any)?.phone || '';
  const displayName = email ? email.slice(0, 20) : '未登录';
  const userAvatar = displayName.slice(0, 2).toUpperCase();

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={onCollapse}
      breakpoint="lg"
      width={240}
      style={{ background: 'var(--color-sidebar)', borderRight: 'none', display: 'flex', flexDirection: 'column' }}
      trigger={null}
    >
      {/* Logo */}
      <div
        style={{
          height: 56,
          display: 'flex',
          alignItems: 'center',
          justifyContent: collapsed ? 'center' : 'flex-start',
          fontWeight: 800,
          fontSize: 20,
          color: '#e0e7ff',
          letterSpacing: 2,
          padding: collapsed ? 0 : '0 20px',
          background: 'linear-gradient(135deg, rgba(79,70,229,0.35) 0%, rgba(124,58,237,0.2) 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.06)',
          whiteSpace: 'nowrap',
          cursor: 'pointer',
          userSelect: 'none',
          flexShrink: 0,
        }}
        onClick={() => navigate(isAdmin ? '/admin' : '/home')}
      >
        {collapsed ? (
          <span style={{ fontSize: 22, fontWeight: 900, color: '#a78bfa' }}>智</span>
        ) : (
          <span style={{ background: 'linear-gradient(135deg, #c4b5fd, #818cf8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            智析免费版
          </span>
        )}
      </div>

      {/* 菜单区域 */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '4px 0' }}>
        {sections.map((section, si) => (
          <div key={si}>
            {!collapsed && <div style={sectionLabelStyle}>{section.group}</div>}
            {section.items.map((item) => {
              const active = selectedKey === item.key || (item.key === '/home' && selectedKey === '/');
              return (
                <div
                  key={item.key}
                  style={menuItemStyle(active)}
                  onClick={() => navigate(item.key)}
                  onMouseEnter={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.background = 'rgba(99, 102, 241, 0.15)';
                      (e.currentTarget as HTMLDivElement).style.color = '#e0e7ff';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!active) {
                      (e.currentTarget as HTMLDivElement).style.background = 'transparent';
                      (e.currentTarget as HTMLDivElement).style.color = 'var(--color-sidebar-text)';
                    }
                  }}
                >
                  <span style={{ display: 'flex', alignItems: 'center', flexShrink: 0, width: 22, justifyContent: 'center' }}>
                    {item.icon}
                  </span>
                  {!collapsed && (
                    <>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {item.badge && item.badge > 0 && (
                        <Badge count={item.badge} size="small" style={{ boxShadow: 'none' }} />
                      )}
                    </>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>

      {/* 底部用户信息 */}
      {!collapsed && (
        <div style={{
          borderTop: '1px solid rgba(255,255,255,0.06)',
          padding: '12px 16px',
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          flexShrink: 0,
          cursor: 'pointer',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'rgba(99, 102, 241, 0.12)'; }}
        onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.background = 'transparent'; }}
        onClick={() => navigate('/profile')}
        >
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            {userAvatar}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <Typography.Text style={{ color: '#e0e7ff', fontSize: 13, fontWeight: 500, display: 'block' }} ellipsis>
              {displayName}
            </Typography.Text>
            {isAdmin && (
              <Typography.Text style={{ color: '#a78bfa', fontSize: 11 }}>最高管理员</Typography.Text>
            )}
          </div>
          <LogoutOutlined style={{ color: 'rgba(199,210,254,0.4)', fontSize: 15, flexShrink: 0 }}
            onClick={(e) => { e.stopPropagation(); logout(); }} />
        </div>
      )}
    </Sider>
  );
}
