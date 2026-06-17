import { Card, Row, Col } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { CategoryRanking } from '../types';

export default function CategoryChart({ data }: { data: CategoryRanking[] }) {
  if (!data || data.length === 0) return null;

  const colors = ['#4f46e5', '#7c3aed', '#8b5cf6', '#a78bfa', '#6366f1', '#c4b5fd', '#818cf8', '#6d28d9', '#9333ea', '#ddd6fe'];

  const pieOption = {
    tooltip: {
      trigger: 'item' as const,
      backgroundColor: '#1e1b4b',
      borderColor: '#312e81',
      textStyle: { color: '#e0e7ff', fontSize: 12 },
      formatter: '{b}：¥{c} ({d}%)',
    },
    legend: {
      bottom: 0,
      textStyle: { color: '#6b7280', fontSize: 11 },
      itemWidth: 8, itemHeight: 8, itemGap: 16,
    },
    series: [{
      type: 'pie',
      radius: ['50%', '78%'],
      center: ['50%', '43%'],
      avoidLabelOverlap: false,
      itemStyle: { borderRadius: 4, borderColor: '#fff', borderWidth: 2 },
      label: { show: false },
      emphasis: {
        label: { show: true, fontSize: 16, fontWeight: 'bold' },
        scaleSize: 8,
      },
      data: data.map((d, i) => ({ name: d.category, value: d.amount, itemStyle: { color: colors[i % colors.length] } })),
      animationType: 'scale' as const,
      animationEasing: 'elasticOut' as const,
    }],
  };

  const barOption = {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: '#1e1b4b',
      borderColor: '#312e81',
      textStyle: { color: '#e0e7ff', fontSize: 12 },
    },
    grid: { left: 50, right: 20, top: 8, bottom: 24 },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => d.category),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 11, rotate: 20 },
    },
    yAxis: {
      type: 'value' as const,
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toString() },
    },
    series: [{
      type: 'bar',
      data: data.map((d, i) => ({ value: d.amount, itemStyle: { color: colors[i % colors.length], borderRadius: [6, 6, 0, 0] } })),
      barWidth: '50%',
      animationDuration: 600,
    }],
  };

  return (
    <Card
      style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}
      title={<span style={{ fontSize: 15, fontWeight: 600 }}>品类分析</span>}
    >
      <Row gutter={[24, 16]}>
        <Col xs={24} lg={12}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>贡献占比</div>
          <ReactECharts option={pieOption} style={{ height: 300 }} />
        </Col>
        <Col xs={24} lg={12}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#6b7280', marginBottom: 8 }}>销售额排名</div>
          <ReactECharts option={barOption} style={{ height: 300 }} />
        </Col>
      </Row>
    </Card>
  );
}
