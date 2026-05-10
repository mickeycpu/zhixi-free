import type {
  OverviewData,
  CategoryRanking,
  ProductRanking,
  TrendPoint,
  TimeSlotData,
  WeekdayData,
  CustomerAnalysis,
} from '../types';

export const mockOverview: OverviewData = {
  gmv: 285600.50,
  orders: 1842,
  arpu: 155.05,
  gmv_mom: 12.5,
  orders_mom: 8.3,
  gmv_yoy: 23.8,
  orders_yoy: 15.2,
};

export const mockCategories: CategoryRanking[] = [
  { category: '饮料', amount: 85600.00, share: 29.97 },
  { category: '零食', amount: 62400.00, share: 21.85 },
  { category: '乳制品', amount: 45800.00, share: 16.03 },
  { category: '日用品', amount: 38500.00, share: 13.48 },
  { category: '酒类', amount: 28500.00, share: 9.98 },
  { category: '其他', amount: 24800.50, share: 8.68 },
];

export const mockProducts: ProductRanking = {
  hot: [
    { product_name: '可口可乐330ml', amount: 18500.00, quantity: 520 },
    { product_name: '农夫山泉550ml', amount: 15200.00, quantity: 680 },
    { product_name: '百事可乐330ml', amount: 13800.00, quantity: 410 },
    { product_name: '蒙牛纯牛奶250ml', amount: 12500.00, quantity: 350 },
    { product_name: '康师傅方便面', amount: 11200.00, quantity: 280 },
    { product_name: '青岛啤酒500ml', amount: 9800.00, quantity: 180 },
    { product_name: '奥利奥饼干', amount: 8600.00, quantity: 320 },
    { product_name: '怡宝纯净水', amount: 7200.00, quantity: 400 },
  ],
  cold: [
    { product_name: '进口巧克力礼盒', amount: 320.00, quantity: 3 },
    { product_name: '高端红酒750ml', amount: 580.00, quantity: 2 },
    { product_name: '有机蜂蜜500g', amount: 210.00, quantity: 4 },
    { product_name: '手工皂礼盒', amount: 150.00, quantity: 5 },
  ],
};

export const mockTrends: Record<string, TrendPoint[]> = {
  day: Array.from({ length: 30 }, (_, i) => {
    const day = i + 1;
    return {
      period: `2026-04-${String(day).padStart(2, '0')}`,
      amount: 8000 + Math.random() * 12000,
      orders: 50 + Math.floor(Math.random() * 80),
    };
  }),
  week: [
    { period: '2026-03-31', amount: 68500, orders: 430 },
    { period: '2026-04-07', amount: 72300, orders: 465 },
    { period: '2026-04-14', amount: 65800, orders: 420 },
    { period: '2026-04-21', amount: 79150, orders: 501 },
    { period: '2026-04-28', amount: 81000, orders: 526 },
  ],
  month: [
    { period: '2025-08', amount: 215000, orders: 1380 },
    { period: '2025-09', amount: 198000, orders: 1250 },
    { period: '2025-10', amount: 242000, orders: 1520 },
    { period: '2025-11', amount: 228000, orders: 1480 },
    { period: '2025-12', amount: 265000, orders: 1680 },
    { period: '2026-01', amount: 235000, orders: 1500 },
    { period: '2026-02', amount: 198000, orders: 1280 },
    { period: '2026-03', amount: 272000, orders: 1720 },
    { period: '2026-04', amount: 285600, orders: 1842 },
  ],
};

export const mockTimeSlots: TimeSlotData[] = [
  { slot: '08:00-08:59', amount: 4200, orders: 32 },
  { slot: '09:00-09:59', amount: 8500, orders: 58 },
  { slot: '10:00-10:59', amount: 12500, orders: 85 },
  { slot: '11:00-11:59', amount: 18600, orders: 128 },
  { slot: '12:00-12:59', amount: 24500, orders: 165 },
  { slot: '13:00-13:59', amount: 15200, orders: 102 },
  { slot: '14:00-14:59', amount: 11200, orders: 78 },
  { slot: '15:00-15:59', amount: 9800, orders: 65 },
  { slot: '16:00-16:59', amount: 14200, orders: 95 },
  { slot: '17:00-17:59', amount: 22500, orders: 148 },
  { slot: '18:00-18:59', amount: 28500, orders: 186 },
  { slot: '19:00-19:59', amount: 26800, orders: 172 },
  { slot: '20:00-20:59', amount: 19800, orders: 132 },
  { slot: '21:00-21:59', amount: 12500, orders: 82 },
  { slot: '22:00-22:59', amount: 6800, orders: 45 },
];

export const mockWeekdays: WeekdayData[] = [
  { weekday: '周一', amount: 38500, orders: 248 },
  { weekday: '周二', amount: 36200, orders: 232 },
  { weekday: '周三', amount: 35800, orders: 228 },
  { weekday: '周四', amount: 37200, orders: 240 },
  { weekday: '周五', amount: 45200, orders: 295 },
  { weekday: '周六', amount: 52800, orders: 342 },
  { weekday: '周日', amount: 39900, orders: 257 },
];

export const mockCustomers: CustomerAnalysis = {
  new_customer_ratio: 28.5,
  conversion_rate: 32.0,
  retention_rate: 65.8,
  churn_risk_count: 23,
};
