import { Card, Row, Col, Tag } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { ProductRanking as ProductRankingType } from '../types';

export default function ProductRanking({ data }: { data: ProductRankingType }) {
  const { hot, cold } = data;
  if (!hot || hot.length === 0) return null;

  const hotData = hot.slice(0, 10);
  const coldData = cold.slice(0, 10);

  const makeOption = (items: { product_name: string; amount: number }[], color: string, gradient: boolean) => ({
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: '#1e1b4b',
      borderColor: '#312e81',
      textStyle: { color: '#e0e7ff', fontSize: 12 },
    },
    grid: { left: 90, right: 60, top: 4, bottom: 16 },
    xAxis: {
      type: 'value' as const,
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => '¥' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) },
    },
    yAxis: {
      type: 'category' as const,
      data: items.map((d) => d.product_name).reverse(),
      axisLine: { show: false },
      axisTick: { show: false },
      axisLabel: { color: '#6b7280', fontSize: 12, width: 80, overflow: 'truncate' },
    },
    series: [{
      type: 'bar',
      data: items.map((d) => d.amount).reverse(),
      itemStyle: {
        color: gradient ? {
          type: 'linear' as const, x: 0, y: 0, x2: 1, y2: 0,
          colorStops: [
            { offset: 0, color },
            { offset: 1, color: color + '99' },
          ],
        } : color,
        borderRadius: [0, 6, 6, 0],
      },
      label: {
        show: true,
        position: 'right' as const,
        color: '#9ca3af',
        fontSize: 11,
        formatter: (p: { value: number }) => '¥' + p.value.toLocaleString(),
      },
      barWidth: '55%',
      animationDuration: 500,
    }],
  });

  return (
    <Card
      style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}
      title={<span style={{ fontSize: 15, fontWeight: 600 }}>商品排名</span>}
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} lg={12}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
            <Tag color="red" style={{ marginRight: 6 }}>畅销</Tag>TOP {hotData.length}
          </div>
          <ReactECharts option={makeOption(hotData, '#4f46e5', true)} style={{ height: 340 }} />
        </Col>
        <Col xs={24} lg={12}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>
            <Tag color="default" style={{ marginRight: 6 }}>关注</Tag>滞销列表
          </div>
          <ReactECharts option={makeOption(coldData, '#94a3b8', false)} style={{ height: 340 }} />
        </Col>
      </Row>
    </Card>
  );
}
