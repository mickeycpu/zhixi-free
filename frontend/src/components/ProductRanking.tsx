import { Card, Row, Col, Typography, Tag } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { ProductRanking as ProductRankingType } from '../types';

export default function ProductRanking({ data }: { data: ProductRankingType }) {
  const { hot, cold } = data;
  if (!hot || hot.length === 0) return null;

  const hotData = hot.slice(0, 10);
  const coldData = cold.slice(0, 10);

  const makeOption = (items: { product_name: string; amount: number }[], color: string) => ({
    tooltip: { trigger: 'axis' as const },
    grid: { left: 120, right: 20, top: 10, bottom: 20 },
    xAxis: { type: 'value' as const, name: '销售额 (元)' },
    yAxis: {
      type: 'category' as const,
      data: items.map((d) => d.product_name).reverse(),
      axisLabel: { width: 100, overflow: 'truncate' },
    },
    series: [
      {
        type: 'bar',
        data: items.map((d) => d.amount).reverse(),
        itemStyle: {
          color,
          borderRadius: [0, 4, 4, 0],
        },
        label: {
          show: true,
          position: 'right' as const,
          formatter: (p: { value: number }) => `¥${p.value.toLocaleString()}`,
        },
      },
    ],
  });

  return (
    <Card title="商品排名" style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            <Tag color="red">畅销</Tag> TOP {hotData.length}
          </Typography.Text>
          <ReactECharts option={makeOption(hotData, '#1677ff')} style={{ height: 360 }} />
        </Col>
        <Col xs={24} lg={12}>
          <Typography.Text strong style={{ display: 'block', marginBottom: 8 }}>
            <Tag color="default">滞销</Tag> 关注列表
          </Typography.Text>
          <ReactECharts option={makeOption(coldData, '#d9d9d9')} style={{ height: 360 }} />
        </Col>
      </Row>
    </Card>
  );
}
