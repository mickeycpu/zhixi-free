import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography, Space, Alert } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { loginWithPassword } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const { token, user } = await loginWithPassword(values.email, values.password);
      setAuth(token, user);
      message.success('登录成功');
      navigate('/dashboard', { replace: true });
    } catch (err: any) {
      message.error(err.message || '登录失败，请检查邮箱和密码');
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
        background: 'linear-gradient(135deg, #1677ff 0%, #69b1ff 100%)',
        padding: 16,
      }}
    >
      <Card
        style={{ width: 400, maxWidth: '100%', borderRadius: 12 }}
        styles={{ body: { padding: 32 } }}
      >
        <Typography.Title level={3} style={{ textAlign: 'center', marginBottom: 8 }}>
          智析免费版
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 24 }}
        >
          AI驱动的经营分析平台
        </Typography.Text>

        <Alert
          type="info"
          message="测试账号：test@zhixi.dev / test123456"
          style={{ marginBottom: 16 }}
          showIcon
        />

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

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
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
