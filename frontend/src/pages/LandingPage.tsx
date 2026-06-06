import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Typography, Row, Col } from 'antd';
import {
  ThunderboltOutlined,
  BarChartOutlined,
  SafetyCertificateOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { useAuthStore } from '../stores/authStore';
import { isAdminUser } from '../utils/admin';

const features = [
  {
    icon: <BarChartOutlined />,
    title: '一键上传，自动分析',
    desc: '拖入 Excel 或 CSV，AI 自动清洗数据、计算 GMV、客单价、品类排名，生成可视化看板。',
    color: '#4f46e5',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'AI 经营报告',
    desc: '基于真实数据，自动生成「发生了什么 → 为什么 → 怎么办」三段式经营建议。',
    color: '#f59e0b',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: '免费使用，数据安全',
    desc: '每月 1000 条数据免费额度，数据严格加密隔离，不上传客户隐私给 AI。',
    color: '#10b981',
  },
];

export default function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isLoggedIn) navigate(isAdminUser(user) ? '/admin' : '/home', { replace: true });
  }, [isLoggedIn, navigate, user]);

  return (
    <div
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(165deg, #f8f7f4 0%, #eef2ff 40%, #ede9fe 100%)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Nav */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '20px 40px',
        }}
      >
        <Typography.Text
          strong
          style={{
            fontSize: 22,
            letterSpacing: 2,
            color: '#4f46e5',
            fontWeight: 800,
          }}
        >
          智析免费版
        </Typography.Text>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            type="text"
            onClick={() => navigate('/login')}
            style={{ color: '#4f46e5', fontWeight: 500 }}
          >
            登录
          </Button>
          <Button
            type="primary"
            onClick={() => navigate('/register')}
          >
            免费注册
          </Button>
        </div>
      </div>

      {/* Hero */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '60px 20px',
          textAlign: 'center',
        }}
      >
        <div
          style={{
            display: 'inline-block',
            background: '#eef2ff',
            border: '1px solid #c7d2fe',
            color: '#4f46e5',
            padding: '6px 18px',
            borderRadius: 20,
            fontSize: 13,
            fontWeight: 500,
            marginBottom: 28,
          }}
        >
          你的 AI 经营分析师，从这里开始
        </div>

        <Typography.Title
          style={{
            fontSize: 42,
            fontWeight: 800,
            letterSpacing: -1,
            lineHeight: 1.25,
            maxWidth: 600,
            marginBottom: 20,
            color: '#1e1b2e',
          }}
        >
          看懂经营数据
          <br />
          <span style={{ background: 'linear-gradient(135deg, #4f46e5, #7c3aed)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            从上传一张表开始
          </span>
        </Typography.Title>

        <Typography.Text
          style={{
            fontSize: 17,
            color: '#6b7280',
            maxWidth: 480,
            lineHeight: 1.7,
            marginBottom: 36,
          }}
        >
          不需要请数据分析师。拖入订单表格，AI 自动清洗、计算、出图、
          写报告。5 分钟看到你的经营全貌。
        </Typography.Text>

        <Button
          type="primary"
          size="large"
          icon={<RightOutlined />}
          onClick={() => navigate('/register')}
          style={{
            height: 52,
            padding: '0 40px',
            fontSize: 17,
            fontWeight: 600,
            borderRadius: 14,
          }}
        >
          免费开始使用
        </Button>
        <Typography.Text
          type="secondary"
          style={{ marginTop: 12, fontSize: 13 }}
        >
          已有账号？<a onClick={() => navigate('/login')} style={{ color: '#4f46e5', cursor: 'pointer', fontWeight: 500 }}>立即登录</a>
        </Typography.Text>
      </div>

      {/* Features */}
      <div style={{ padding: '60px 40px 80px' }}>
        <Typography.Text
          style={{
            display: 'block',
            textAlign: 'center',
            fontSize: 13,
            fontWeight: 600,
            color: '#6b7280',
            textTransform: 'uppercase',
            letterSpacing: 1,
            marginBottom: 40,
          }}
        >
          为什么选择智析
        </Typography.Text>

        <Row gutter={[32, 32]} justify="center" style={{ maxWidth: 900, margin: '0 auto' }}>
          {features.map((f) => (
            <Col xs={24} sm={8} key={f.title}>
              <div style={{ textAlign: 'center', padding: '0 8px' }}>
                <div
                  style={{
                    width: 56,
                    height: 56,
                    borderRadius: 16,
                    background: `${f.color}12`,
                    border: `1px solid ${f.color}20`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                    fontSize: 22,
                    color: f.color,
                  }}
                >
                  {f.icon}
                </div>
                <Typography.Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
                  {f.title}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.7 }}>
                  {f.desc}
                </Typography.Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* Footer */}
      <div
        style={{
          textAlign: 'center',
          padding: '24px',
          borderTop: '1px solid #e5e7eb',
          color: '#9ca3af',
          fontSize: 12,
        }}
      >
        智析免费版 · AI 经营分析助手 · 让数据说话
      </div>
    </div>
  );
}
