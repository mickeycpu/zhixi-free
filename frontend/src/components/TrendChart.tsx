import { useState, useEffect } from 'react';
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
  const [option, setOption] = useState({});

  useEffect(() => {
    const dataMap: Record<string, TrendPoint[]> = { day: dayData, week: weekData, month: monthData };
    const data = dataMap[granularity] || [];

    setOption({
      tooltip: {
        trigger: 'axis' as const,
        formatter: (params: Array<{ value: number; seriesName: string; axisValue: string }>) => {
          const [p1, p2] = params;
          return `${p1.axisValue}<br/>${p1.seriesName}: ¥${p1.value?.toLocaleString()}<br/>${p2?.seriesName}: ${p2?.value} 单`;
        },
      },
      legend: { data: ['销售额', '订单数'], bottom: 0 },
      grid: { left: 60, right: 60, top: 10, bottom: 40 },
      xAxis: {
        type: 'category' as const,
        data: data.map((d) => d.period),
        axisLabel: { rotate: granularity === 'day' ? 45 : 0 },
      },
      yAxis: [
        { type: 'value' as const, name: '销售额 (元)' },
        { type: 'value' as const, name: '订单数' },
      ],
      series: [
        {
          name: '销售额',
          type: 'line',
          data: data.map((d) => d.amount),
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: { color: '#1677ff' },
          areaStyle: { color: 'rgba(22, 119, 255, 0.08)' },
        },
        {
          name: '订单数',
          type: 'line',
          yAxisIndex: 1,
          data: data.map((d) => d.orders),
          smooth: true,
          symbol: 'circle',
          symbolSize: 4,
          itemStyle: { color: '#52c41a' },
        },
      ],
    });
  }, [granularity, dayData, weekData, monthData]);

  return (
    <Card
      title="销售趋势"
      style={{ marginTop: 16 }}
      extra={
        <Segmented
          value={granularity}
          onChange={(v) => setGranularity(v as 'day' | 'week' | 'month')}
          options={[
            { value: 'day', label: '日' },
            { value: 'week', label: '周' },
            { value: 'month', label: '月' },
          ]}
        />
      }
    >
      <ReactECharts option={option} style={{ height: 360 }} />
    </Card>
  );
}
