import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, Form, Input, Button, message, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined } from '@ant-design/icons';
import { registerWithPassword, confirmEmail } from '../api/auth';
import { useAuthStore } from '../stores/authStore';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore((s) => s.setAuth);

  const handleSubmit = async (values: { email: string; password: string; confirm: string }) => {
    if (values.password !== values.confirm) {
      message.error('两次输入的密码不一致');
      return;
    }
    setLoading(true);
    try {
      const { token, user } = await registerWithPassword(values.email, values.password);

      // 自动确认邮箱，解决国内用户收不到确认邮件的问题
      if (user?.user_id) {
        await confirmEmail(user.user_id);
      }

      if (token) {
        setAuth(token, user);
        message.success('注册成功，欢迎加入智析！');
        navigate('/home', { replace: true });
      } else {
        message.success('注册成功！请登录');
        navigate('/login', { replace: true });
      }
    } catch (err: any) {
      message.error(err.message || '注册失败，请重试');
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
          注册智析
        </Typography.Title>
        <Typography.Text
          type="secondary"
          style={{ display: 'block', textAlign: 'center', marginBottom: 32 }}
        >
          免费开启AI经营分析
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
            rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请设置密码（至少6位）" />
          </Form.Item>

          <Form.Item
            name="confirm"
            rules={[
              { required: true, message: '请确认密码' },
            ]}
          >
            <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={loading} block>
              注册
            </Button>
          </Form.Item>
        </Form>

        <Space style={{ display: 'flex', justifyContent: 'center' }}>
          <Typography.Text type="secondary">已有账号？</Typography.Text>
          <Link to="/login">立即登录</Link>
        </Space>
      </Card>
    </div>
  );
}
