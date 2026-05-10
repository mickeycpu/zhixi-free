import { Card, Row, Col, Typography } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { CategoryRanking } from '../types';

export default function CategoryChart({ data }: { data: CategoryRanking[] }) {
  if (!data || data.length === 0) return null;

  const barOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 60, right: 20, top: 10, bottom: 30 },
    xAxis: {
      type: 'category' as const,
      data: data.map((d) => d.category),
      axisLabel: { rotate: 30 },
    },
    yAxis: { type: 'value' as const, name: '销售额 (元)' },
    series: [
      {
        type: 'bar',
        data: data.map((d) => d.amount),
        itemStyle: {
          color: '#1677ff',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const pieOption = {
    tooltip: { trigger: 'item' as const, formatter: '{b}: ¥{c} ({d}%)' },
    legend: { bottom: 0, type: 'scroll' as const },
    series: [
      {
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '45%'],
        data: data.map((d) => ({
          name: d.category,
          value: d.amount,
        })),
        label: { formatter: '{b}\n{d}%' },
        emphasis: {
          itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: 'rgba(0, 0, 0, 0.5)' },
        },
      },
    ],
  };

  return (
    <Card title="品类分析" style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>销售额排名</Typography.Text>
          <ReactECharts option={barOption} style={{ height: 320 }} />
        </Col>
        <Col xs={24} lg={12}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>贡献占比</Typography.Text>
          <ReactECharts option={pieOption} style={{ height: 320 }} />
        </Col>
      </Row>
    </Card>
  );
}
