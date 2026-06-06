// API 统一响应
export interface ApiResponse<T> {
  code: number;
  data: T;
  message: string;
}

// ====== 销售数据 ======
export interface SalesDataRow {
  id: string;
  user_id: string;
  upload_id: string;
  order_date: string;
  order_time: string | null;
  product_name: string;
  category: string;
  quantity: number;
  unit_price: number;
  total_amount: number;
  customer_ref: string | null;
  channel: string | null;
  created_at: string;
}

// ====== 上传 ======
export interface UploadRecord {
  id: string;
  user_id: string;
  filename: string;
  file_size: number;
  row_count: number;
  status: 'pending' | 'processing' | 'done' | 'error';
  error_message: string | null;
  created_at: string;
}

export interface UploadResult {
  upload_id: string;
  row_count: number;
  columns: string[];
}

// ====== 分析概览 ======
export interface OverviewData {
  gmv: number;
  orders: number;
  arpu: number;
  gmv_mom: number | null;
  orders_mom: number | null;
  gmv_yoy: number | null;
  orders_yoy: number | null;
}

// ====== 品类排名 ======
export interface CategoryRanking {
  category: string;
  amount: number;
  share: number;
}

// ====== 商品排名 ======
export interface ProductItem {
  product_name: string;
  amount: number;
  quantity: number;
}

export interface ProductRanking {
  hot: ProductItem[];
  cold: ProductItem[];
}

// ====== 趋势 ======
export interface TrendPoint {
  period: string;
  amount: number;
  orders: number;
}

// ====== 时段 ======
export interface TimeSlotData {
  slot: string;
  amount: number;
  orders: number;
}

// ====== 星期 ======
export interface WeekdayData {
  weekday: string;
  amount: number;
  orders: number;
}

// ====== 客户分析 ======
export interface CustomerAnalysis {
  new_customer_ratio: number;
  conversion_rate: number;
  retention_rate: number;
  churn_risk_count: number;
}

// ====== AI 报告 ======
export interface AIReport {
  id: string;
  user_id: string;
  title: string;
  markdown_content: string;
  structured_json: {
    problems: string[];
    analysis: string[];
    suggestions: string[];
  } | null;
  date_range_start: string;
  date_range_end: string;
  created_at: string;
}

// ====== 预警 ======
export interface AlertItem {
  id: string;
  user_id: string;
  alert_type: 'sales_anomaly' | 'customer_churn' | 'inventory_shortage';
  title: string;
  message: string;
  severity: 'info' | 'warning' | 'critical';
  is_read: boolean;
  created_at: string;
}

// ====== 用户 ======
export interface UserInfo {
  user_id: string;
  phone: string;
  email?: string;
  role?: 'user' | 'admin' | 'super_admin';
  is_banned?: boolean;
}

export interface UserUsage {
  monthly_used: number;
  monthly_limit: number;
  total_sales: number;
  total_uploads: number;
  total_reports: number;
}

// ====== 反馈 ======
export interface FeedbackData {
  type: 'bug' | 'suggestion' | 'other';
  content: string;
  contact?: string;
}

// ====== 管理员 ======
export interface AdminOverview {
  account_count: number;
  upload_count: number;
  sales_count: number;
  report_count: number;
  prompt_tokens: number;
  completion_tokens: number;
  total_tokens: number;
}

export interface AdminUser {
  user_id: string;
  email: string | null;
  phone: string | null;
  role: 'user' | 'admin' | 'super_admin';
  is_banned: boolean;
  ban_reason: string | null;
  created_at: string;
  updated_at: string;
  total_uploads: number;
  total_reports: number;
  total_sales: number;
  total_tokens: number;
}
