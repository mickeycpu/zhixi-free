import { Table, Typography } from 'antd';
import type { SalesDataRow } from '../types';

interface Props {
  data: SalesDataRow[];
  columns?: string[];
}

const displayColumns = [
  'order_date', 'order_time', 'product_name', 'category',
  'quantity', 'unit_price', 'total_amount', 'customer_ref', 'channel',
];

const columnTitles: Record<string, string> = {
  order_date: '订单日期',
  order_time: '订单时间',
  product_name: '商品名称',
  category: '品类',
  quantity: '数量',
  unit_price: '单价',
  total_amount: '金额',
  customer_ref: '客户标识',
  channel: '渠道',
};

export default function DataPreview({ data }: Props) {
  if (!data || data.length === 0) return null;

  const cols = displayColumns
    .filter((c) => c in (data[0] || {}))
    .map((key) => ({
      title: columnTitles[key] || key,
      dataIndex: key,
      key,
      width: key === 'product_name' ? 160 : key === 'customer_ref' ? 120 : 100,
      ellipsis: true,
    }));

  return (
    <div>
      <Typography.Text strong style={{ fontSize: 15, marginBottom: 12, display: 'block' }}>
        数据预览（前{Math.min(data.length, 20)}行）
      </Typography.Text>
      <Table
        columns={cols}
        dataSource={data.slice(0, 20)}
        rowKey="id"
        size="small"
        scroll={{ x: 'max-content' }}
        pagination={false}
        bordered
      />
    </div>
  );
}
