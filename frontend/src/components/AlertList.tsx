import { List, Typography, Tag, Space, Badge, Empty } from 'antd';
import {
  WarningOutlined,
  UserSwitchOutlined,
  ShoppingOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import type { AlertItem } from '../types';

const typeConfig: Record<string, { color: string; icon: React.ReactNode; label: string }> = {
  sales_anomaly: { color: 'orange', icon: <ShoppingOutlined />, label: '销售异常' },
  customer_churn: { color: 'red', icon: <UserSwitchOutlined />, label: '客户流失' },
  inventory_shortage: { color: 'volcano', icon: <WarningOutlined />, label: '库存断货' },
};

const severityConfig: Record<string, { color: string; label: string }> = {
  critical: { color: 'red', label: '严重' },
  warning: { color: 'orange', label: '警告' },
  info: { color: 'blue', label: '提示' },
};

interface Props {
  alerts: AlertItem[];
  onMarkRead?: (id: string) => void;
  filter?: string;
}

export default function AlertList({ alerts, onMarkRead, filter }: Props) {
  const filtered = filter ? alerts.filter((a) => a.alert_type === filter) : alerts;

  if (filtered.length === 0) {
    return <Empty description="暂无预警" />;
  }

  return (
    <List
      dataSource={filtered}
      renderItem={(alert) => {
        const typeCfg = typeConfig[alert.alert_type] || typeConfig.sales_anomaly;
        const sevCfg = severityConfig[alert.severity] || severityConfig.info;

        return (
          <List.Item
            key={alert.id}
            onClick={() => !alert.is_read && onMarkRead?.(alert.id)}
            style={{
              cursor: alert.is_read ? 'default' : 'pointer',
              background: alert.is_read ? '#fff' : '#f0f5ff',
              padding: '12px 16px',
              borderRadius: 8,
              marginBottom: 8,
              border: '1px solid #f0f0f0',
              transition: 'background 0.2s',
            }}
          >
            <List.Item.Meta
              avatar={
                <Space>
                  {!alert.is_read && <Badge status="processing" />}
                  <span style={{ fontSize: 24, color: typeCfg.color }}>
                    {typeCfg.icon}
                  </span>
                </Space>
              }
              title={
                <Space>
                  <Typography.Text strong={!alert.is_read}>{alert.title}</Typography.Text>
                  <Tag color={typeCfg.color}>{typeCfg.label}</Tag>
                  <Tag color={sevCfg.color}>{sevCfg.label}</Tag>
                </Space>
              }
              description={
                <div>
                  <Typography.Paragraph
                    style={{ marginBottom: 4, color: alert.is_read ? '#999' : '#333' }}
                  >
                    {alert.message}
                  </Typography.Paragraph>
                  <Typography.Text type="secondary" style={{ fontSize: 12 }}>
                    <ClockCircleOutlined /> {new Date(alert.created_at).toLocaleString()}
                  </Typography.Text>
                </div>
              }
            />
          </List.Item>
        );
      }}
    />
  );
}
