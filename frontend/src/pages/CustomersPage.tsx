import { useState, useEffect } from 'react';
import { Typography, Skeleton } from 'antd';
import CustomerCharts from '../components/CustomerCharts';
import EmptyState from '../components/EmptyState';
import { getCustomers } from '../api/analysis';
import type { CustomerAnalysis } from '../types';

export default function CustomersPage() {
  const [data, setData] = useState<CustomerAnalysis | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCustomers().then((res) => {
      if (res.code === 0) setData(res.data);
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div>
        <Typography.Title level={4}>客户分析</Typography.Title>
        <Skeleton active paragraph={{ rows: 6 }} />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        type="no-data"
        title="暂无客户数据"
        description="上传包含客户信息的销售数据后，这里将展示客户结构分析和流失预警"
      />
    );
  }

  return (
    <div>
      <Typography.Title level={4}>客户分析</Typography.Title>
      <CustomerCharts data={data} />
    </div>
  );
}
