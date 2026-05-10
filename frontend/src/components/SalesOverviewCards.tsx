import { Row, Col, Card, Statistic, Typography } from 'antd';
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons';
import type { OverviewData } from '../types';

function PctLabel({ value, label }: { value: number | null; label: string }) {
  if (value === null || value === undefined) return null;
  const isUp = value >= 0;
  return (
    <Typography.Text
      type={isUp ? 'success' : 'danger'}
      style={{ fontSize: 13 }}
    >
      {label} {isUp ? <ArrowUpOutlined /> : <ArrowDownOutlined />} {Math.abs(value)}%
    </Typography.Text>
  );
}

export default function SalesOverviewCards({ data }: { data: OverviewData }) {
  return (
    <Row gutter={[16, 16]}>
      <Col xs={12} sm={12} lg={6}>
        <Card bordered>
          <Statistic
            title="本月GMV"
            value={data.gmv}
            precision={2}
            prefix="¥"
          />
          <PctLabel value={data.gmv_mom} label="环比" />
          {' '}
          <PctLabel value={data.gmv_yoy} label="同比" />
        </Card>
      </Col>
      <Col xs={12} sm={12} lg={6}>
        <Card bordered>
          <Statistic
            title="本月订单数"
            value={data.orders}
            prefix="📦"
          />
          <PctLabel value={data.orders_mom} label="环比" />
          {' '}
          <PctLabel value={data.orders_yoy} label="同比" />
        </Card>
      </Col>
      <Col xs={12} sm={12} lg={6}>
        <Card bordered>
          <Statistic
            title="客单价"
            value={data.arpu}
            precision={2}
            prefix="¥"
          />
        </Card>
      </Col>
      <Col xs={12} sm={12} lg={6}>
        <Card bordered>
          <Statistic
            title="GMV环比"
            value={data.gmv_mom ?? 0}
            precision={2}
            suffix="%"
            valueStyle={{ color: (data.gmv_mom ?? 0) >= 0 ? '#3f8600' : '#cf1322' }}
          />
        </Card>
      </Col>
    </Row>
  );
}
