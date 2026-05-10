import { useState, useEffect } from 'react';
import { Typography, Skeleton } from 'antd';
import SalesOverviewCards from '../components/SalesOverviewCards';
import CategoryChart from '../components/CategoryChart';
import ProductRanking from '../components/ProductRanking';
import TrendChart from '../components/TrendChart';
import TimeDistribution from '../components/TimeDistribution';
import EmptyState from '../components/EmptyState';
import {
  getOverview,
  getCategories,
  getProducts,
  getTrends,
  getTimeSlots,
  getWeekdays,
} from '../api/analysis';
import type {
  OverviewData,
  CategoryRanking,
  ProductRanking as ProductRankingType,
  TrendPoint,
  TimeSlotData,
  WeekdayData,
} from '../types';

export default function DashboardPage() {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [categories, setCategories] = useState<CategoryRanking[]>([]);
  const [products, setProducts] = useState<ProductRankingType>({ hot: [], cold: [] });
  const [dayTrends, setDayTrends] = useState<TrendPoint[]>([]);
  const [weekTrends, setWeekTrends] = useState<TrendPoint[]>([]);
  const [monthTrends, setMonthTrends] = useState<TrendPoint[]>([]);
  const [timeSlots, setTimeSlots] = useState<TimeSlotData[]>([]);
  const [weekdays, setWeekdays] = useState<WeekdayData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setLoading(true);
      const [ov, cat, prod, trendDay, trendWeek, trendMonth, slots, wdays] = await Promise.all([
        getOverview(),
        getCategories(),
        getProducts(),
        getTrends('day'),
        getTrends('week'),
        getTrends('month'),
        getTimeSlots(),
        getWeekdays(),
      ]);
      if (cancelled) return;
      setOverview(ov.data);
      setCategories(cat.data);
      setProducts(prod.data);
      setDayTrends(trendDay.data);
      setWeekTrends(trendWeek.data);
      setMonthTrends(trendMonth.data);
      setTimeSlots(slots.data);
      setWeekdays(wdays.data);
      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div>
        <Typography.Title level={4}>销售分析看板</Typography.Title>
        <Skeleton active paragraph={{ rows: 2 }} />
        <Skeleton active paragraph={{ rows: 4 }} style={{ marginTop: 16 }} />
        <Skeleton active paragraph={{ rows: 3 }} style={{ marginTop: 16 }} />
      </div>
    );
  }

  if (!overview) {
    return (
      <EmptyState
        type="no-data"
        title="暂无销售数据"
        description="上传您的销售数据后，这里将展示完整的经营分析看板"
      />
    );
  }

  return (
    <div>
      <Typography.Title level={4} style={{ marginBottom: 16 }}>
        销售分析看板
      </Typography.Title>

      <SalesOverviewCards data={overview} />
      <CategoryChart data={categories} />
      <ProductRanking data={products} />
      <TrendChart dayData={dayTrends} weekData={weekTrends} monthData={monthTrends} />
      <TimeDistribution timeSlots={timeSlots} weekdays={weekdays} />
    </div>
  );
}
