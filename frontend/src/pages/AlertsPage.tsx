import { useState, useEffect } from 'react';
import { Typography, Segmented, Badge, Skeleton } from 'antd';
import AlertList from '../components/AlertList';
import { getAlerts, markAlertRead } from '../api/alerts';
import type { AlertItem } from '../types';

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [filter, setFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const res = await getAlerts();
    if (res.code === 0) setAlerts(res.data);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const handleMarkRead = async (id: string) => {
    setAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, is_read: true } : a)));
    await markAlertRead(id);
  };

  const unreadCount = alerts.filter((a) => !a.is_read).length;

  return (
    <div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}
      >
        <Typography.Title level={4} style={{ margin: 0 }}>
          预警中心
        </Typography.Title>
        {unreadCount > 0 && (
          <Badge count={unreadCount} size="default" overflowCount={99} />
        )}
      </div>

      <Segmented
        value={filter}
        onChange={(v) => setFilter(v as string)}
        options={[
          { value: 'all', label: '全部' },
          { value: 'sales_anomaly', label: '销售异常' },
          { value: 'customer_churn', label: '客户流失' },
          { value: 'inventory_shortage', label: '库存断货' },
        ]}
        style={{ marginBottom: 16 }}
      />

      {loading ? (
        <Skeleton active paragraph={{ rows: 5 }} />
      ) : (
        <AlertList
          alerts={alerts}
          onMarkRead={handleMarkRead}
          filter={filter === 'all' ? undefined : filter}
        />
      )}
    </div>
  );
}
