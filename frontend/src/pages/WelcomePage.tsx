import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Row, Col, Card, Statistic, Typography, Button, Skeleton, Tag } from 'antd';
import {
  UploadOutlined,
  FileTextOutlined,
  ThunderboltOutlined,
  RightOutlined,
} from '@ant-design/icons';
import { getOverview } from '../api/analysis';
import { getAlerts } from '../api/alerts';
import type { OverviewData, AlertItem } from '../types';

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 6) return '夜深了';
  if (h < 9) return '早上好';
  if (h < 12) return '上午好';
  if (h < 14) return '中午好';
  if (h < 18) return '下午好';
  return '晚上好';
};

export default function WelcomePage() {
  const navigate = useNavigate();
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [ov, al] = await Promise.all([getOverview(), getAlerts()]);
      setOverview(ov.code === 0 ? ov.data : null);
      setAlerts(al.code === 0 ? al.data.slice(0, 3) : []);
      setLoading(false);
    }
    load();
  }, []);

  const today = new Date();
  const dateStr = `${today.getFullYear()}年${today.getMonth() + 1}月${today.getDate()}日`;

  if (loading) return <Skeleton active paragraph={{ rows: 4 }} />;

  return (
    <div>
      {/* 欢迎横幅 */}
      <div
        style={{
          background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px 36px',
          marginBottom: 28,
          color: '#fff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <div>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>
            {dateStr}
          </Typography.Text>
          <Typography.Title level={2} style={{ color: '#fff', margin: '4px 0', fontWeight: 700 }}>
            {getGreeting()}，开始分析你的经营数据
          </Typography.Title>
          <Typography.Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14 }}>
            智析免费版 — AI 驱动的经营分析助手
          </Typography.Text>
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Button
            size="large"
            icon={<UploadOutlined />}
            onClick={() => navigate('/upload')}
            style={{
              background: '#fff',
              border: 'none',
              color: '#4f46e5',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            上传数据
          </Button>
          <Button
            size="large"
            icon={<FileTextOutlined />}
            onClick={() => navigate('/report')}
            style={{
              background: '#fff',
              border: 'none',
              color: '#4f46e5',
              fontWeight: 600,
              boxShadow: '0 2px 8px rgba(0,0,0,0.15)',
            }}
          >
            查看报告
          </Button>
        </div>
      </div>

      {/* 概览数字 */}
      {overview ? (
        <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
          <Col xs={12} sm={6}>
            <Card bodyStyle={{ padding: '20px 24px', textAlign: 'center' }}>
              <Statistic
                title="本月销售额"
                value={overview.gmv}
                precision={2}
                prefix="¥"
                valueStyle={{ fontSize: 26, fontWeight: 700, color: 'var(--color-primary)' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bodyStyle={{ padding: '20px 24px', textAlign: 'center' }}>
              <Statistic
                title="本月订单"
                value={overview.orders}
                valueStyle={{ fontSize: 26, fontWeight: 700 }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card bodyStyle={{ padding: '20px 24px', textAlign: 'center' }}>
              <Statistic
                title="客单价"
                value={overview.arpu}
                precision={2}
                prefix="¥"
                valueStyle={{ fontSize: 26, fontWeight: 700, color: 'var(--color-accent)' }}
              />
            </Card>
          </Col>
          <Col xs={12} sm={6}>
            <Card
              bodyStyle={{ padding: '20px 24px', textAlign: 'center', cursor: 'pointer' }}
              onClick={() => navigate('/dashboard')}
              hoverable
            >
              <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--color-text-muted)' }}>
                <RightOutlined style={{ fontSize: 18 }} />
              </div>
              <div style={{ fontSize: 13, color: 'var(--color-text-secondary)', marginTop: 4 }}>
                查看完整看板
              </div>
            </Card>
          </Col>
        </Row>
      ) : (
        <Card
          style={{ marginBottom: 24, textAlign: 'center', padding: '36px 0' }}
          bodyStyle={{ padding: 36 }}
        >
          <ThunderboltOutlined style={{ fontSize: 40, color: 'var(--color-text-muted)' }} />
          <Typography.Title level={4} style={{ marginTop: 12, color: 'var(--color-text-secondary)' }}>
            还没有数据
          </Typography.Title>
          <Typography.Text type="secondary">上传第一份销售数据，开始分析之旅</Typography.Text>
          <br />
          <Button
            type="primary"
            size="large"
            icon={<UploadOutlined />}
            onClick={() => navigate('/upload')}
            style={{ marginTop: 16 }}
          >
            上传数据
          </Button>
        </Card>
      )}

      {/* 快捷入口 */}
      <div className="section-label">快速操作</div>
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        {[
          { icon: <UploadOutlined />, label: '数据上传', path: '/upload', color: '#4f46e5' },
          { icon: <ThunderboltOutlined />, label: '生成AI报告', path: '/report', color: '#f59e0b' },
          { icon: <FileTextOutlined />, label: '销售看板', path: '/dashboard', color: '#10b981' },
        ].map((item) => (
          <Col xs={8} key={item.path}>
            <Card
              hoverable
              onClick={() => navigate(item.path)}
              bodyStyle={{
                padding: '24px 16px',
                textAlign: 'center',
                cursor: 'pointer',
              }}
            >
              <div
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: `${item.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                  fontSize: 22,
                  color: item.color,
                }}
              >
                {item.icon}
              </div>
              <Typography.Text strong>{item.label}</Typography.Text>
            </Card>
          </Col>
        ))}
      </Row>

      {/* 最新预警 */}
      {alerts.length > 0 && (
        <>
          <div className="section-label">最新预警</div>
          {alerts.map((a) => (
            <Card
              key={a.id}
              size="small"
              style={{ marginBottom: 8 }}
              onClick={() => navigate('/alerts')}
              hoverable
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <Tag color={a.severity === 'critical' ? 'error' : 'warning'}>
                  {a.alert_type === 'customer_churn' ? '客户流失' : a.alert_type === 'sales_anomaly' ? '销售异常' : '数据波动'}
                </Tag>
                <Typography.Text>{a.title}</Typography.Text>
                <div style={{ flex: 1 }} />
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  {new Date(a.created_at).toLocaleDateString()}
                </Typography.Text>
              </div>
            </Card>
          ))}
        </>
      )}
    </div>
  );
}
