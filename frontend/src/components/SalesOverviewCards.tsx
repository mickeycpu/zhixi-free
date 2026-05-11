import { Card, Statistic, Typography, Tag } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined, ShoppingCartOutlined, RiseOutlined } from '@ant-design/icons';
import type { OverviewData } from '../types';

function TrendTag({ value }: { value: number | null }) {
  if (value === null || value === undefined) return null;
  const isUp = value >= 0;
  return (
    <Tag
      color={isUp ? 'success' : 'error'}
      style={{ borderRadius: 20, fontSize: 12, padding: '0 8px', lineHeight: '20px' }}
    >
      {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />}
      {' '}{Math.abs(value)}%
    </Tag>
  );
}

export default function SalesOverviewCards({ data }: { data: OverviewData }) {
  return (
    <div>
      <div className="section-label">经营概览</div>
      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* GMV - 主卡片 */}
        <Card
          style={{
            background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
            border: 'none',
            borderRadius: 'var(--radius-lg)',
            gridRow: 'span 2',
          }}
          bodyStyle={{ padding: 28 }}
        >
          <Statistic
            title={<span style={{ color: 'rgba(255,255,255,0.7)', fontSize: 14 }}>本月销售额 (GMV)</span>}
            value={data.gmv}
            precision={2}
            prefix="¥"
            valueStyle={{ color: '#fff', fontSize: 36, fontWeight: 700 }}
          />
          <div style={{ marginTop: 16, display: 'flex', gap: 8 }}>
            <Tag color="rgba(255,255,255,0.2)" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 20 }}>
              环比 {(data.gmv_mom ?? 0) >= 0 ? '+' : ''}{data.gmv_mom ?? 0}%
            </Tag>
            {data.gmv_yoy !== null && (
              <Tag color="rgba(255,255,255,0.2)" style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: 20 }}>
                同比 {(data.gmv_yoy ?? 0) >= 0 ? '+' : ''}{data.gmv_yoy}%
              </Tag>
            )}
          </div>
        </Card>

        {/* 订单数 */}
        <Card bodyStyle={{ padding: '20px 24px' }}>
          <Statistic
            title={<span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>本月订单</span>}
            value={data.orders}
            prefix={<ShoppingCartOutlined style={{ color: 'var(--color-primary)', fontSize: 20 }} />}
            valueStyle={{ fontSize: 28, fontWeight: 700 }}
          />
          <TrendTag value={data.orders_mom} />
        </Card>

        {/* 客单价 */}
        <Card bodyStyle={{ padding: '20px 24px' }}>
          <Statistic
            title={<span style={{ color: 'var(--color-text-secondary)', fontSize: 13 }}>客单价</span>}
            value={data.arpu}
            precision={2}
            prefix={<RiseOutlined style={{ color: 'var(--color-accent)', fontSize: 20 }} />}
            valueStyle={{ fontSize: 28, fontWeight: 700 }}
            suffix="¥"
          />
          <Typography.Text style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>
            每单平均金额
          </Typography.Text>
        </Card>
      </div>

      {/* 环比/同比快速条 */}
      <div style={{ display: 'flex', gap: 24, padding: '12px 0', borderTop: '1px solid var(--color-border-light)', borderBottom: '1px solid var(--color-border-light)', marginBottom: 24 }}>
        <div>
          <Typography.Text style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>GMV 环比</Typography.Text>
          <br />
          <Typography.Text strong style={{ fontSize: 16, color: (data.gmv_mom ?? 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {(data.gmv_mom ?? 0) >= 0 ? '+' : ''}{data.gmv_mom ?? 0}%
          </Typography.Text>
        </div>
        <div>
          <Typography.Text style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>GMV 同比</Typography.Text>
          <br />
          <Typography.Text strong style={{ fontSize: 16, color: data.gmv_yoy === null ? 'var(--color-text-muted)' : (data.gmv_yoy >= 0 ? 'var(--color-success)' : 'var(--color-danger)') }}>
            {data.gmv_yoy === null ? '--' : `${data.gmv_yoy >= 0 ? '+' : ''}${data.gmv_yoy}%`}
          </Typography.Text>
        </div>
        <div>
          <Typography.Text style={{ fontSize: 12, color: 'var(--color-text-muted)' }}>订单 环比</Typography.Text>
          <br />
          <Typography.Text strong style={{ fontSize: 16, color: (data.orders_mom ?? 0) >= 0 ? 'var(--color-success)' : 'var(--color-danger)' }}>
            {(data.orders_mom ?? 0) >= 0 ? '+' : ''}{data.orders_mom ?? 0}%
          </Typography.Text>
        </div>
      </div>
    </div>
  );
}
