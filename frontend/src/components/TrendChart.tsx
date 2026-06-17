import { useState, useMemo } from 'react';
import { Card, Segmented } from 'antd';
import ReactECharts from 'echarts-for-react';
import type { TrendPoint } from '../types';

interface Props {
  dayData: TrendPoint[];
  weekData: TrendPoint[];
  monthData: TrendPoint[];
}

export default function TrendChart({ dayData, weekData, monthData }: Props) {
  const [granularity, setGranularity] = useState<'day' | 'week' | 'month'>('day');

  const option = useMemo(() => {
    const dataMap: Record<string, TrendPoint[]> = { day: dayData, week: weekData, month: monthData };
    const data = dataMap[granularity] || [];

    return {
      tooltip: {
        trigger: 'axis' as const,
        backgroundColor: '#1e1b4b',
        borderColor: '#312e81',
        textStyle: { color: '#e0e7ff', fontSize: 13 },
        formatter: (params: Array<{ value: number; seriesName: string; axisValue: string; color: string }>) => {
          const [p1, p2] = params;
          return `<div style="font-weight:600;margin-bottom:4px">${p1.axisValue}</div>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p1.color};margin-right:6px"></span>${p1.seriesName}：<b>¥${p1.value?.toLocaleString()}</b><br/>
            <span style="display:inline-block;width:10px;height:10px;border-radius:50%;background:${p2?.color};margin-right:6px"></span>${p2?.seriesName}：<b>${p2?.value} 单</b>`;
        },
      },
      legend: {
        bottom: 0,
        textStyle: { color: '#6b7280', fontSize: 12 },
        itemWidth: 8,
        itemHeight: 8,
        itemGap: 24,
      },
      grid: { left: 50, right: 50, top: 12, bottom: 40 },
      xAxis: {
        type: 'category' as const,
        data: data.map((d) => d.period),
        axisLine: { lineStyle: { color: '#e5e7eb' } },
        axisTick: { show: false },
        axisLabel: { color: '#9ca3af', fontSize: 11, rotate: granularity === 'day' ? 30 : 0 },
      },
      yAxis: [
        {
          type: 'value' as const, name: '元',
          nameTextStyle: { color: '#9ca3af', fontSize: 11 },
          splitLine: { lineStyle: { color: '#f3f4f6', type: 'dashed' as const } },
          axisLabel: { color: '#9ca3af', fontSize: 11, formatter: (v: number) => v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v.toString() },
        },
        {
          type: 'value' as const, name: '单',
          nameTextStyle: { color: '#9ca3af', fontSize: 11 },
          splitLine: { show: false },
          axisLabel: { color: '#9ca3af', fontSize: 11 },
        },
      ],
      series: [
        {
          name: '销售额',
          type: 'line',
          data: data.map((d) => d.amount),
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: 2.5, color: '#4f46e5' },
          itemStyle: { color: '#4f46e5' },
          areaStyle: {
            color: {
              type: 'linear' as const, x: 0, y: 0, x2: 0, y2: 1,
              colorStops: [
                { offset: 0, color: 'rgba(79,70,229,0.15)' },
                { offset: 1, color: 'rgba(79,70,229,0.01)' },
              ],
            },
          },
        },
        {
          name: '订单数',
          type: 'line',
          yAxisIndex: 1,
          data: data.map((d) => d.orders),
          smooth: true,
          symbol: 'circle',
          symbolSize: 5,
          lineStyle: { width: 2, color: '#10b981' },
          itemStyle: { color: '#10b981' },
        },
      ],
      animationDuration: 600,
      animationEasing: 'cubicOut' as const,
    };
  }, [granularity, dayData, weekData, monthData]);

  return (
    <Card
      style={{ marginTop: 16, borderRadius: 12, border: '1px solid var(--color-border-light)' }}
      title={<span style={{ fontSize: 15, fontWeight: 600 }}>销售趋势</span>}
      extra={
        <Segmented
          value={granularity}
          onChange={(v) => setGranularity(v as 'day' | 'week' | 'month')}
          options={[
            { value: 'day', label: '日' },
            { value: 'week', label: '周' },
            { value: 'month', label: '月' },
          ]}
          style={{ background: '#f3f4f6' }}
        />
      }
    >
      <ReactECharts option={option} style={{ height: 340 }} />
    </Card>
  );
}
