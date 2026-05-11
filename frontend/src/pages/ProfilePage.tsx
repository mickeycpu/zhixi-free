import { useState, useEffect } from 'react';
import { Card, Typography, Progress, Statistic, Row, Col, Skeleton, Button, Divider } from 'antd';
import {
  UserOutlined,
  UploadOutlined,
  FileTextOutlined,
  DatabaseOutlined,
  LogoutOutlined,
  KeyOutlined,
} from '@ant-design/icons';
import { getUserUsage } from '../api/user';
import { useAuthStore } from '../stores/authStore';
import type { UserUsage } from '../types';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const [usage, setUsage] = useState<UserUsage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getUserUsage().then((res) => {
      if (res.code === 0) setUsage(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) return <Skeleton active paragraph={{ rows: 4 }} />;

  const pct = usage ? Math.round(usage.monthly_used / usage.monthly_limit * 100) : 0;

  return (
    <div style={{ maxWidth: 640 }}>
      <div className="page-title">个人中心</div>

      {/* 用户信息 */}
      <Card style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 24,
              color: '#fff',
            }}
          >
            <UserOutlined />
          </div>
          <div>
            <Typography.Text strong style={{ fontSize: 18 }}>
              {(user as any)?.email || (user as any)?.phone || '用户'}
            </Typography.Text>
            <br />
            <Typography.Text type="secondary" style={{ fontSize: 13 }}>
              用户 ID: {user?.user_id?.slice(0, 12)}...
            </Typography.Text>
          </div>
          <div style={{ flex: 1 }} />
          <Button icon={<LogoutOutlined />} onClick={logout} danger type="text">
            退出登录
          </Button>
        </div>
      </Card>

      {/* 使用量 */}
      <div className="section-label">本月用量</div>
      <Card style={{ marginBottom: 20 }}>
        <div style={{ marginBottom: 16 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <Typography.Text strong>数据条数</Typography.Text>
            <Typography.Text>
              {usage?.monthly_used || 0} / {usage?.monthly_limit || 1000}
            </Typography.Text>
          </div>
          <Progress
            percent={pct}
            strokeColor={pct > 80 ? '#ef4444' : pct > 50 ? '#f59e0b' : '#4f46e5'}
            showInfo={false}
          />
          <Typography.Text type="secondary" style={{ fontSize: 12 }}>
            免费版每月 {usage?.monthly_limit || 1000} 条上限，剩余 {(usage?.monthly_limit || 1000) - (usage?.monthly_used || 0)} 条
          </Typography.Text>
        </div>

        <Divider style={{ margin: '16px 0' }} />

        <Row gutter={[24, 16]}>
          <Col span={8}>
            <Statistic
              title="累计上传"
              value={usage?.total_uploads || 0}
              prefix={<UploadOutlined style={{ fontSize: 16, color: 'var(--color-primary)' }} />}
              suffix="次"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="累计数据"
              value={usage?.total_sales || 0}
              prefix={<DatabaseOutlined style={{ fontSize: 16, color: 'var(--color-accent)' }} />}
              suffix="条"
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="AI 报告"
              value={usage?.total_reports || 0}
              prefix={<FileTextOutlined style={{ fontSize: 16, color: 'var(--color-success)' }} />}
              suffix="份"
            />
          </Col>
        </Row>
      </Card>

      {/* 密码修改 */}
      <div className="section-label">账号安全</div>
      <Card>
        <Button
          icon={<KeyOutlined />}
          onClick={() => {
            window.open('https://ihqhfxbqdbwsxzxylnpb.supabase.co', '_blank');
          }}
        >
          前往 Supabase 修改密码
        </Button>
        <Typography.Text type="secondary" style={{ display: 'block', marginTop: 8, fontSize: 12 }}>
          密码由 Supabase Auth 管理，点击上方按钮前往修改
        </Typography.Text>
      </Card>
    </div>
  );
}
