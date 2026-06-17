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
    color: '#6e56cf',
  },
  {
    icon: <ThunderboltOutlined />,
    title: 'AI 经营报告',
    desc: '基于真实数据，自动生成「发生了什么 → 为什么 → 怎么办」三段式经营建议。',
    color: '#9e8cfc',
  },
  {
    icon: <SafetyCertificateOutlined />,
    title: '免费使用，数据安全',
    desc: '每月 1000 条数据免费额度，数据严格加密隔离，不上传客户隐私给 AI。',
    color: '#5d5fef',
  },
];

const appearAnim = `
@keyframes appear {
  0% { opacity: 0; transform: translateY(12px); }
  100% { opacity: 1; transform: translateY(0); }
}
@keyframes appearZoom {
  0% { opacity: 0; transform: scale(0.96); }
  100% { opacity: 1; transform: scale(1); }
}
`;

export default function LandingPage() {
  const navigate = useNavigate();
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isLoggedIn) navigate(isAdminUser(user) ? '/admin' : '/home', { replace: true });
  }, [isLoggedIn, navigate, user]);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      <style>{appearAnim}</style>

      {/* ====== Nav ====== */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '18px 40px', position: 'relative', zIndex: 20,
      }}>
        <Typography.Text strong style={{ fontSize: 22, letterSpacing: 2, color: '#6e56cf', fontWeight: 800 }}>
          智析免费版
        </Typography.Text>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button type="text" onClick={() => navigate('/login')} style={{ color: '#6e56cf', fontWeight: 500 }}>登录</Button>
          <Button type="primary" onClick={() => navigate('/register')}>免费注册</Button>
        </div>
      </div>

      {/* ====== Hero ====== */}
      <section style={{
        flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '40px 20px 0', textAlign: 'center', position: 'relative', zIndex: 10,
      }}>
        {/* 光晕背景 */}
        <div style={{
          position: 'absolute', top: -80, left: '50%', transform: 'translateX(-50%)',
          width: '60%', maxWidth: 700, height: 400,
          background: 'radial-gradient(ellipse at center, rgba(110,86,207,0.12) 10%, transparent 60%)',
          pointerEvents: 'none',
        }} />
        <div style={{
          position: 'absolute', top: -40, left: '50%', transform: 'translateX(-50%)',
          width: '40%', maxWidth: 500, height: 200,
          background: 'radial-gradient(ellipse at center, rgba(158,140,252,0.15) 10%, transparent 60%)',
          pointerEvents: 'none',
        }} />

        {/* 标签 */}
        <div style={{
          display: 'inline-block', background: 'rgba(110,86,207,0.08)',
          border: '1px solid rgba(110,86,207,0.15)', color: '#6e56cf',
          padding: '6px 20px', borderRadius: 20, fontSize: 13, fontWeight: 500,
          marginBottom: 32, animation: 'appear 0.5s ease-out forwards',
        }}>
          你的 AI 经营分析师，从这里开始
        </div>

        {/* 标题 */}
        <Typography.Title style={{
          fontSize: 48, fontWeight: 800, letterSpacing: -1.5, lineHeight: 1.15,
          maxWidth: 680, marginBottom: 20, color: '#2a2a4a',
          animation: 'appear 0.5s ease-out forwards',
          fontFamily: 'var(--font-sans)',
        }}>
          看懂经营数据
          <br />
          <span style={{
            background: 'linear-gradient(135deg, #6e56cf 0%, #9e8cfc 60%, #5d5fef 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            从上传一张表开始
          </span>
        </Typography.Title>

        {/* 描述 */}
        <p style={{
          fontSize: 17, color: '#6c6c8a', maxWidth: 500, lineHeight: 1.7,
          marginBottom: 36, animation: 'appear 0.5s 0.15s ease-out both',
        }}>
          不需要请数据分析师。拖入订单表格，AI 自动清洗、计算、出图、写报告。
          5 分钟看到你的经营全貌。
        </p>

        {/* CTA */}
        <div style={{ animation: 'appear 0.5s 0.3s ease-out both', marginBottom: 48 }}>
          <Button type="primary" size="large" icon={<RightOutlined />}
            onClick={() => navigate('/register')}
            style={{ height: 52, padding: '0 44px', fontSize: 17, fontWeight: 600, borderRadius: 14 }}>
            免费开始使用
          </Button>
          <div style={{ marginTop: 14 }}>
            <Typography.Text style={{ fontSize: 13, color: '#a0a0c0' }}>
              已有账号？<a onClick={() => navigate('/login')}
                style={{ color: '#6e56cf', cursor: 'pointer', fontWeight: 500 }}>立即登录</a>
            </Typography.Text>
          </div>
        </div>

        {/* 产品预览图 */}
        <div style={{
          width: '100%', maxWidth: 900, borderRadius: 16,
          border: '1px solid rgba(110,86,207,0.1)',
          boxShadow: '0 0 60px -12px rgba(110,86,207,0.2)',
          overflow: 'hidden', background: '#fff',
          animation: 'appearZoom 0.8s 0.7s ease-out both',
          marginBottom: 40,
        }}>
          {/* 模拟浏览器标题栏 */}
          <div style={{
            height: 36, background: '#f5f5ff', display: 'flex', alignItems: 'center',
            padding: '0 14px', gap: 7, borderBottom: '1px solid #e0e0f0',
          }}>
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5470' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
            <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#10b981' }} />
            <div style={{ flex: 1, textAlign: 'center', fontSize: 11, color: '#a0a0c0', fontWeight: 500 }}>
              智析免费版 · 销售分析看板
            </div>
          </div>
          {/* 模拟看板内容 */}
          <div style={{ padding: '28px 32px', display: 'flex', gap: 16, flexWrap: 'wrap' }}>
            {[
              { label: '本月销售额', value: '¥4,510.92', icon: '💰' },
              { label: '本月订单', value: '52', icon: '📦' },
              { label: '客单价', value: '¥86.75', icon: '📊' },
              { label: 'AI 报告', value: '6 份', icon: '📝' },
            ].map((stat) => (
              <div key={stat.label} style={{
                flex: '1 1 180px', padding: '16px 20px', borderRadius: 12,
                background: '#f5f5ff', border: '1px solid #e0e0f0',
              }}>
                <div style={{ fontSize: 12, color: '#6c6c8a', marginBottom: 6 }}>{stat.icon} {stat.label}</div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#2a2a4a' }}>{stat.value}</div>
              </div>
            ))}
          </div>
          {/* 模拟图表区：柱状图 + 饼图 */}
          <div style={{ padding: '0 32px 24px', display: 'flex', gap: 16 }}>
            {/* 柱状图——带数据标签 */}
            <div style={{
              flex: 1, borderRadius: 12,
              background: 'linear-gradient(180deg, rgba(110,86,207,0.04) 0%, rgba(110,86,207,0.01) 100%)',
              padding: '16px 12px 8px',
            }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: '#6c6c8a', marginBottom: 10, textAlign: 'center' }}>
                品类销售额排?
              </div>
              <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-around', gap: 6, height: 110 }}>
                {[
                  { label: '咖啡', value: 2840, height: 90 },
                  { label: '茶饮', value: 1620, height: 55 },
                  { label: '甜点', value: 980, height: 35 },
                  { label: '轻食', value: 540, height: 22 },
                ].map((bar) => (
                  <div key={bar.label} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#2a2a4a', marginBottom: 4 }}>
                      ¥{bar.value.toLocaleString()}
                    </span>
                    <div style={{
                      width: '70%', height: bar.height,
                      background: `linear-gradient(180deg, #6e56cf, #9e8cfc)`,
                      borderRadius: '5px 5px 0 0',
                    }} />
                    <span style={{ fontSize: 10, color: '#6c6c8a', marginTop: 5, fontWeight: 500 }}>
                      {bar.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* 饼图——带标签 */}
            <div style={{
              width: 220, borderRadius: 12,
              background: 'linear-gradient(180deg, rgba(110,86,207,0.04) 0%, rgba(110,86,207,0.01) 100%)',
              padding: '16px 12px 12px',
              display: 'flex', alignItems: 'center', gap: 14,
            }}>
              {/* 简化环形图 */}
              <div style={{
                width: 90, height: 90, borderRadius: '50%', flexShrink: 0,
                background: `conic-gradient(#6e56cf 0deg 173deg, #9e8cfc 173deg 260deg, #c4b5fd 260deg 310deg, #e0e0f0 310deg 360deg)`,
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 18, borderRadius: '50%', background: '#fff',
                  display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#2a2a4a' }}>48%</span>
                  <span style={{ fontSize: 9, color: '#6c6c8a' }}>咖啡</span>
                </div>
              </div>
              {/* 图例 */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 11 }}>
                {[
                  { color: '#6e56cf', label: '咖啡', pct: '48%' },
                  { color: '#9e8cfc', label: '茶饮', pct: '28%' },
                  { color: '#c4b5fd', label: '甜点', pct: '14%' },
                  { color: '#e0e0f0', label: '轻食', pct: '10%' },
                ].map((item) => (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: 2, background: item.color, flexShrink: 0 }} />
                    <span style={{ color: '#6c6c8a', width: 28 }}>{item.label}</span>
                    <span style={{ color: '#2a2a4a', fontWeight: 600 }}>{item.pct}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ====== Features ====== */}
      <div style={{ padding: '60px 40px 80px', position: 'relative', zIndex: 10 }}>
        <Typography.Text style={{
          display: 'block', textAlign: 'center', fontSize: 13, fontWeight: 600,
          color: '#6c6c8a', textTransform: 'uppercase', letterSpacing: 1.5,
          marginBottom: 48,
        }}>
          为什么选择智析
        </Typography.Text>
        <Row gutter={[32, 32]} justify="center" style={{ maxWidth: 900, margin: '0 auto' }}>
          {features.map((f) => (
            <Col xs={24} sm={8} key={f.title}>
              <div style={{
                textAlign: 'center', padding: '28px 16px', borderRadius: 16,
                background: '#fff', border: '1px solid #e0e0f0',
                transition: 'box-shadow 0.3s',
              }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 30px rgba(110,86,207,0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                }}
              >
                <div style={{
                  width: 52, height: 52, borderRadius: 14,
                  background: `${f.color}12`, border: `1px solid ${f.color}20`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  margin: '0 auto 16px', fontSize: 22, color: f.color,
                }}>
                  {f.icon}
                </div>
                <Typography.Text strong style={{ fontSize: 15, display: 'block', marginBottom: 8 }}>
                  {f.title}
                </Typography.Text>
                <Typography.Text style={{ fontSize: 13, color: '#6c6c8a', lineHeight: 1.7 }}>
                  {f.desc}
                </Typography.Text>
              </div>
            </Col>
          ))}
        </Row>
      </div>

      {/* ====== Footer ====== */}
      <div style={{
        textAlign: 'center', padding: '24px', borderTop: '1px solid #e0e0f0',
        color: '#a0a0c0', fontSize: 12, position: 'relative', zIndex: 10,
      }}>
        智析免费版 · AI 经营分析助手 · 让数据说话
      </div>
    </div>
  );
}
