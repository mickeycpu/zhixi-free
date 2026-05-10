import { Card, Row, Col, Statistic, Tag } from 'antd';
import ReactECharts from 'echarts-for-react';
import { UserOutlined, PercentageOutlined, WarningOutlined } from '@ant-design/icons';
import type { CustomerAnalysis } from '../types';

export default function CustomerCharts({ data }: { data: CustomerAnalysis }) {
  const gaugeOption = {
    tooltip: { formatter: '{b}: {c}%' },
    series: [
      {
        type: 'gauge',
        startAngle: 210,
        endAngle: -30,
        center: ['50%', '60%'],
        radius: '90%',
        min: 0,
        max: 100,
        splitNumber: 10,
        axisLine: {
          lineStyle: {
            width: 16,
            color: [
              [0.3, '#ff4d4f'],
              [0.6, '#faad14'],
              [1, '#52c41a'],
            ],
          },
        },
        pointer: { length: '60%', width: 6 },
        axisTick: { show: false },
        splitLine: { show: false },
        axisLabel: { show: false },
        detail: {
          formatter: '{value}%',
          fontSize: 20,
          offsetCenter: [0, '70%'],
        },
        data: [
          { value: data.retention_rate, name: '老客留存率' },
        ],
      },
    ],
  };

  return (
    <Card title="客户分析" style={{ marginTop: 16 }}>
      <Row gutter={[16, 16]}>
        <Col xs={12} sm={6}>
          <Card bordered size="small">
            <Statistic
              title="新客占比"
              value={data.new_customer_ratio}
              suffix="%"
              prefix={<UserOutlined />}
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered size="small">
            <Statistic
              title="新客转化率"
              value={data.conversion_rate}
              suffix="%"
              prefix={<PercentageOutlined />}
              precision={1}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered size="small">
            <Statistic
              title="老客留存率"
              value={data.retention_rate}
              suffix="%"
              prefix={<PercentageOutlined />}
              precision={1}
              valueStyle={{ color: data.retention_rate >= 60 ? '#3f8600' : '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card bordered size="small">
            <Statistic
              title="流失风险客户"
              value={data.churn_risk_count}
              suffix="人"
              prefix={<WarningOutlined />}
              valueStyle={{ color: data.churn_risk_count > 10 ? '#cf1322' : '#faad14' }}
            />
            {data.churn_risk_count > 10 && (
              <Tag color="error" style={{ marginTop: 4 }}>需关注</Tag>
            )}
          </Card>
        </Col>
      </Row>

      <Row style={{ marginTop: 16 }}>
        <Col xs={24} md={12}>
          <ReactECharts option={gaugeOption} style={{ height: 280 }} />
        </Col>
        <Col xs={24} md={12}>
          <div style={{ padding: '16px 24px' }}>
            <h4>客户结构解读</h4>
            <p>
              新客占比 <strong>{data.new_customer_ratio}%</strong>，
              说明拉新效果{data.new_customer_ratio > 25 ? '良好' : '一般'}。
            </p>
            <p>
              老客留存率 <strong>{data.retention_rate}%</strong>，
              {data.retention_rate >= 65 ? '高于行业均值（60%），客户粘性较好。' : '低于行业均值（60%），建议加强会员权益和复购激励。'}
            </p>
            <p>
              流失风险客户 <strong style={{ color: data.churn_risk_count > 10 ? '#cf1322' : '#faad14' }}>
                {data.churn_risk_count}人
              </strong>，
              {data.churn_risk_count > 10 ? '建议立即启动客户挽回计划。' : '建议持续关注高价值客户的消费频率。'}
            </p>
          </div>
        </Col>
      </Row>
    </Card>
  );
}
