import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { getMe, loginWithPassword } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { isAdminUser, withAdminFallback } from '../utils/admin';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '登录失败，请检查邮箱和密码';
}

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { token, user } = await loginWithPassword(values.email, values.password);
      localStorage.setItem('token', token);

      // 先用 Supabase 登录结果直接进系统，不卡在后端唤醒
      const authedUser = withAdminFallback(user, values.email);
      setAuth(token, authedUser);
      message.success('登录成功');
      navigate(isAdminUser(authedUser) ? '/admin' : '/home', { replace: true });

      // 后台静默补全用户角色/权限，不影响已完成的登录
      getMe().then((me) => {
        if (me.code === 0) {
          const updated = withAdminFallback(
            { ...authedUser, ...me.data, email: me.data.email || values.email },
            values.email,
          );
          useAuthStore.getState().setAuth(token, updated);
        }
      }).catch(() => {});
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(165deg, #f8f7f4 0%, #eef2ff 40%, #ede9fe 100%)',
        padding: 16,
      }}
    >
      <Card
        style={{ width: 400, maxWidth: '100%', borderRadius: 16, boxShadow: '0 8px 32px rgba(0,0,0,0.06)' }}
        styles={{ body: { padding: 36 } }}
      >
        <Button
          type="text"
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate('/')}
          style={{ marginBottom: 16, padding: 0, color: '#6b7280' }}
        >
          返回首页
        </Button>

        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 4, fontWeight: 700 }}>
          登录智析
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 28 }}
        >
          欢迎回来，继续分析你的经营数据
        </Typography.Text>

        <Form onFinish={handleSubmit} size="large" autoComplete="off">
          <Form.Item
            name="email"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}
          >
            <Input prefix={<MailOutlined />} placeholder="请输入邮箱" />
          </Form.Item>

          <Form.Item
            name="password"
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请输入密码" />
          </Form.Item>

          <Form.Item style={{ marginBottom: 12 }}>
            <Button type="primary" htmlType="submit" loading={loading} block style={{ height: 44, fontWeight: 600 }}>
              登录
            </Button>
          </Form.Item>
        </Form>

        <Space style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography.Text type="secondary">还没有账号？</Typography.Text>
          <Link to="/register">立即注册</Link>
        </Space>
      </Card>
    </div>
  );
}
