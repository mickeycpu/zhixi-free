import { Card, Row, Col } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { TimeSlotData, WeekdayData } from '../types';

interface Props {
  timeSlots: TimeSlotData[];
  weekdays: WeekdayData[];
}

export default function TimeDistribution({ timeSlots, weekdays }: Props) {
  const slotOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 60, right: 20, top: 10, bottom: 30 },
    xAxis: {
      type: 'category' as const,
      data: timeSlots.map((d) => d.slot),
      axisLabel: { rotate: 45, fontSize: 10 },
    },
    yAxis: { type: 'value' as const, name: '销售额 (元)' },
    series: [
      {
        type: 'bar',
        data: timeSlots.map((d) => d.amount),
        itemStyle: {
          color: '#1677ff',
          borderRadius: [4, 4, 0, 0],
        },
      },
    ],
  };

  const weekdayOption = {
    tooltip: { trigger: 'axis' as const },
    grid: { left: 40, right: 20, top: 10, bottom: 20 },
    xAxis: {
      type: 'category' as const,
      data: weekdays.map((d) => d.weekday),
    },
    yAxis: { type: 'value' as const, name: '销售额 (元)' },
    series: [
      {
        type: 'bar',
        data: weekdays.map((d) => d.amount),
        itemStyle: {
          color: (params: { dataIndex: number }) => {
            // 周六日高亮
            const idx = params.dataIndex;
            return idx >= 5 ? '#ff7a45' : '#69b1ff';
          },
          borderRadius: [4, 4, 0, 0],
        },
        label: {
          show: true,
          position: 'top' as const,
          formatter: (p: { value: number }) => `¥${(p.value / 10000).toFixed(1)}万`,
          fontSize: 11,
        },
      },
    ],
  };

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 16 }}>
      <Col xs={24} lg={14}>
        <Card title="时段分布">
          <ReactECharts option={slotOption} style={{ height: 320 }} />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card title="星期分布">
          <ReactECharts option={weekdayOption} style={{ height: 320 }} />
        </Card>
      </Col>
    </Row>
  );
}
