import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Form, Input, Button, message, Typography, Space } from 'antd';
import { MailOutlined, LockOutlined, ArrowLeftOutlined } from '@ant-design/icons';
import { registerWithPassword, confirmEmail, getMe } from '../api/auth';
import { useAuthStore } from '../stores/authStore';
import { isAdminUser, withAdminFallback } from '../utils/admin';
import AnimatedCharacters from '../components/AnimatedCharacters';

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : '注册失败，请重试';
}

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [typing, setTyping] = useState(false);
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
      if (user?.user_id) {
        confirmEmail(user.user_id).catch(() => {});
      }
      if (token) {
        localStorage.setItem('token', token);
        const authedUser = withAdminFallback(user, values.email);
        setAuth(token, authedUser);
        message.success('注册成功，欢迎加入智析！');
        navigate(isAdminUser(authedUser) ? '/admin' : '/home', { replace: true });
        getMe().then((me) => {
          if (me.code === 0) {
            const updated = withAdminFallback(
              { ...authedUser, ...me.data, email: me.data.email || values.email },
              values.email,
            );
            useAuthStore.getState().setAuth(token, updated);
          }
        }).catch(() => {});
      } else {
        message.success('注册成功！请登录');
        navigate('/login', { replace: true });
      }
    } catch (err) {
      message.error(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* 左侧：卡通角色动画 */}
      <div style={{
        flex: 1,
        background: 'linear-gradient(165deg, #10b981 0%, #059669 50%, #34d399 100%)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 40, overflow: 'hidden', position: 'relative',
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 30% 70%, rgba(255,255,255,0.06) 0%, transparent 50%), radial-gradient(circle at 70% 30%, rgba(255,255,255,0.04) 0%, transparent 50%)' }} />
        <Typography.Text style={{ color: 'rgba(255,255,255,0.8)', fontSize: 28, fontWeight: 800, letterSpacing: 2, marginBottom: 8, position: 'relative', zIndex: 1 }}>
          智析免费版
        </Typography.Text>
        <Typography.Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14, marginBottom: 40, position: 'relative', zIndex: 1 }}>
          免费开启 AI 经营分析
        </Typography.Text>
        <div style={{ position: 'relative', zIndex: 1, transform: 'scale(0.85)' }}>
          <AnimatedCharacters typing={typing} showPwd={showPwd} pwdLen={password.length} />
        </div>
        <Typography.Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, marginTop: 32, position: 'relative', zIndex: 1 }}>
          注册即享免费 AI 经营报告
        </Typography.Text>
      </div>

      {/* 右侧：注册表单 */}
      <div style={{
        width: 480, display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, background: 'var(--color-bg)',
      }}>
        <div style={{ width: '100%', maxWidth: 380 }}>
          <Button type="text" icon={<ArrowLeftOutlined />} onClick={() => navigate('/')}
            style={{ marginBottom: 24, padding: 0, color: '#6b7280' }}>
            返回首页
          </Button>
          <Typography.Title level={3} style={{ marginBottom: 4, fontWeight: 700 }}>
            注册智析
          </Typography.Title>
          <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 28 }}>
            创建账号，免费使用 AI 经营分析
          </Typography.Text>

          <Form onFinish={handleSubmit} size="large" autoComplete="off">
            <Form.Item name="email" rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '邮箱格式不正确' },
            ]}>
              <Input prefix={<MailOutlined />} placeholder="请输入邮箱"
                value={email} onChange={(e) => setEmail(e.target.value)}
                onFocus={() => setTyping(true)} onBlur={() => setTyping(false)} />
            </Form.Item>

            <Form.Item name="password" rules={[
              { required: true, message: '请输入密码' },
              { min: 6, message: '密码至少6位' },
            ]}>
              <div style={{ position: 'relative' }}>
                <Input
                  prefix={<LockOutlined />}
                  type={showPwd ? 'text' : 'password'}
                  placeholder="请设置密码（至少6位）"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  style={{ paddingRight: 40 }}
                />
                <span
                  onClick={() => setShowPwd(!showPwd)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', color: '#9ca3af', fontSize: 16, userSelect: 'none' }}
                >
                  {showPwd ? '🙈' : '👁'}
                </span>
              </div>
            </Form.Item>

            <Form.Item name="confirm" rules={[{ required: true, message: '请确认密码' }]}>
              <Input.Password prefix={<LockOutlined />} placeholder="请再次输入密码" />
            </Form.Item>

            <Form.Item style={{ marginBottom: 12 }}>
              <Button type="primary" htmlType="submit" loading={loading} block style={{
                height: 44, fontWeight: 600, background: '#10b981', borderColor: '#10b981',
              }}>
                注册
              </Button>
            </Form.Item>
          </Form>

          <Space style={{ display: 'flex', justifyContent: 'center' }}>
            <Typography.Text type="secondary">已有账号？</Typography.Text>
            <Link to="/login">立即登录</Link>
          </Space>
        </div>
      </div>
    </div>
  );
}
