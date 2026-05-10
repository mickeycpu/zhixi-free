import { useState, useEffect } from 'react';
import { Table, Select, Tag, Typography, Alert } from 'antd';
import { CheckCircleOutlined, WarningOutlined } from '@ant-design/icons';

interface Props {
  columns: string[];
  onMappingChange?: (mapping: Record<string, string>) => void;
}

// 系统期望字段
const targetFields = [
  { key: 'order_date', label: '订单日期', required: true },
  { key: 'order_time', label: '订单时间', required: false },
  { key: 'product_name', label: '商品名称', required: true },
  { key: 'category', label: '品类', required: false },
  { key: 'quantity', label: '数量', required: false },
  { key: 'unit_price', label: '单价', required: false },
  { key: 'total_amount', label: '总金额', required: true },
  { key: 'customer_ref', label: '客户标识', required: false },
  { key: 'channel', label: '渠道', required: false },
];

// 智能匹配关键词
const keywordMap: Record<string, string[]> = {
  order_date: ['日期', 'date', '时间', '下单日期', '订单日期', '销售日期'],
  order_time: ['时间', 'time', '时段', '下单时间'],
  product_name: ['商品', '产品', 'product', '名称', '品名', '商品名称', '产品名称'],
  category: ['品类', '分类', 'category', '类别', '类型', '类目'],
  quantity: ['数量', 'quantity', 'qty', '件数', '销量'],
  unit_price: ['单价', 'price', 'unit', '售价', '价格'],
  total_amount: ['金额', 'amount', '总价', 'total', '销售额', '销售金额', '成交金额', '收入'],
  customer_ref: ['客户', 'customer', '用户', '会员', '买家'],
  channel: ['渠道', 'channel', '来源', '平台'],
};

function autoMatch(columns: string[]): Record<string, string> {
  const mapping: Record<string, string> = {};
  const lowerCols = columns.map((c) => c.toLowerCase().trim());

  for (const field of targetFields) {
    const keywords = keywordMap[field.key] || [];
    for (let i = 0; i < lowerCols.length; i++) {
      if (mapping[field.key]) continue;
      // 精确匹配
      if (lowerCols[i] === field.key || lowerCols[i] === field.label) {
        mapping[field.key] = columns[i];
        continue;
      }
      // 关键词匹配
      for (const kw of keywords) {
        if (lowerCols[i].includes(kw.toLowerCase())) {
          mapping[field.key] = columns[i];
          break;
        }
      }
    }
  }

  return mapping;
}

export default function FieldMapping({ columns, onMappingChange }: Props) {
  const [mapping, setMapping] = useState<Record<string, string>>(() => autoMatch(columns));

  useEffect(() => {
    onMappingChange?.(mapping);
  }, [mapping, onMappingChange]);

  const handleMapping = (targetField: string, sourceColumn: string) => {
    setMapping((prev) => {
      const next = { ...prev };
      if (sourceColumn === '__none__') {
        delete next[targetField];
      } else {
        next[targetField] = sourceColumn;
      }
      return next;
    });
  };

  const unmatchedTargets = targetFields.filter((f) => !mapping[f.key]);
  const requiredUnmatched = unmatchedTargets.filter((f) => f.required);

  const dataSource = targetFields.map((f) => {
    const matched = mapping[f.key];
    const isAuto = matched && autoMatch(columns)[f.key] === matched;
    return {
      key: f.key,
      targetField: f.label,
      required: f.required,
      sourceColumn: matched || undefined,
      status: matched ? (isAuto ? 'auto' : 'manual') : 'unmatched',
    };
  });

  const colDefs = [
    {
      title: '系统字段',
      dataIndex: 'targetField',
      key: 'targetField',
      width: 130,
      render: (text: string, record: { required: boolean }) => (
        <span>
          {text}
          {record.required && <Tag color="red" style={{ marginLeft: 4 }}>必填</Tag>}
        </span>
      ),
    },
    {
      title: '匹配状态',
      dataIndex: 'status',
      key: 'status',
      width: 100,
      render: (status: string) => {
        if (status === 'auto') return <Tag icon={<CheckCircleOutlined />} color="success">自动匹配</Tag>;
        if (status === 'manual') return <Tag icon={<CheckCircleOutlined />} color="processing">手动选择</Tag>;
        return <Tag icon={<WarningOutlined />} color="warning">待匹配</Tag>;
      },
    },
    {
      title: '对应上传列',
      dataIndex: 'sourceColumn',
      key: 'sourceColumn',
      render: (_: string, record: { key: string; sourceColumn?: string }) => (
        <Select
          style={{ width: '100%' }}
          placeholder="请选择对应列（或忽略）"
          value={record.sourceColumn || undefined}
          onChange={(val) => handleMapping(record.key, val)}
          allowClear
          options={[
            ...columns.map((c) => ({ value: c, label: c })),
          ]}
          dropdownRender={(menu) => (
            <>
              {menu}
              <div style={{ padding: '4px 8px', borderTop: '1px solid #f0f0f0' }}>
                <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                  选择"清除"表示忽略此字段
                </Typography.Text>
              </div>
            </>
          )}
        />
      ),
    },
  ];

  return (
    <div>
      <Typography.Text strong style={{ fontSize: 15, marginBottom: 12, display: 'block' }}>
        字段映射确认
      </Typography.Text>
      <Typography.Text type="secondary" style={{ display: 'block', marginBottom: 12 }}>
        系统已自动识别列名映射，请检查并手动调整匹配不正确的字段
      </Typography.Text>

      {requiredUnmatched.length > 0 && (
        <Alert
          type="warning"
          showIcon
          message={`还有 ${requiredUnmatched.length} 个必填字段未匹配：${requiredUnmatched.map((f) => f.label).join('、')}`}
          style={{ marginBottom: 16 }}
        />
      )}

      <Table
        columns={colDefs}
        dataSource={dataSource}
        pagination={false}
        size="small"
        bordered
        scroll={{ x: 'max-content' }}
      />
    </div>
  );
}
