import { Card, Row, Col } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { TimeSlotData, WeekdayData } from '../types';

interface Props {
  timeSlots: TimeSlotData[];
  weekdays: WeekdayData[];
}

export default function TimeDistribution({ timeSlots, weekdays }: Props) {
  const slotOption = {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: '#1e1b4b',
      borderColor: '#312e81',
      textStyle: { color: '#e0e7ff', fontSize: 12 },
    },
    grid: { left: 50, right: 20, top: 8, bottom: 30 },
    xAxis: {
      type: 'category' as const,
      data: timeSlots.map((d) => d.slot),
      axisLabel: { color: '#9ca3af', fontSize: 10, rotate: 45 },
      axisTick: { show: false },
    },
    yAxis: {
      type: 'value' as const,
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : '¥' + v },
    },
    series: [{
      type: 'bar',
      data: timeSlots.map((d) => d.amount),
      itemStyle: {
        color: {
          type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#4f46e5' },
            { offset: 1, color: '#a78bfa' },
          ],
        },
        borderRadius: [6, 6, 0, 0],
      },
      barWidth: '70%',
      animationDuration: 500,
    }],
  };

  const weekdayOption = {
    tooltip: {
      trigger: 'axis' as const,
      backgroundColor: '#1e1b4b',
      borderColor: '#312e81',
      textStyle: { color: '#e0e7ff', fontSize: 12 },
    },
    grid: { left: 40, right: 20, top: 8, bottom: 20 },
    xAxis: {
      type: 'category' as const,
      data: weekdays.map((d) => d.weekday),
      axisLine: { lineStyle: { color: '#e5e7eb' } },
      axisTick: { show: false },
      axisLabel: { color: '#9ca3af', fontSize: 12 },
    },
    yAxis: {
      type: 'value' as const,
      splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
      axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => '¥' + (v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v) },
    },
    series: [{
      type: 'bar',
      data: weekdays.map((d) => ({
        value: d.amount,
        itemStyle: {
          color: d.weekday === '周六' || d.weekday === '周日'
            ? { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#f59e0b' }, { offset: 1, color: '#fbbf24' }] }
            : { type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1, colorStops: [{ offset: 0, color: '#4f46e5' }, { offset: 1, color: '#818cf8' }] },
          borderRadius: [6, 6, 0, 0],
        },
      })),
      label: {
        show: true, position: 'top' as const, color: '#9ca3af', fontSize: 10,
        formatter: (p: { value: number }) => p.value >= 1000 ? '¥' + (p.value / 1000).toFixed(1) + 'k' : '¥' + p.value,
      },
      barWidth: '55%',
      animationDuration: 500,
    }],
  };

  return (
    <Row gutter={[16, 16]} style={{ marginTop: 8 }}>
      <Col xs={24} lg={14}>
        <Card
          style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}
          title={<span style={{ fontSize: 15, fontWeight: 600 }}>时段分布</span>}
        >
          <ReactECharts option={slotOption} style={{ height: 300 }} />
        </Card>
      </Col>
      <Col xs={24} lg={10}>
        <Card
          style={{ borderRadius: 12, border: '1px solid var(--color-border-light)' }}
          title={<span style={{ fontSize: 15, fontWeight: 600 }}>星期分布</span>}
        >
          <ReactECharts option={weekdayOption} style={{ height: 300 }} />
        </Card>
      </Col>
    </Row>
  );
}
