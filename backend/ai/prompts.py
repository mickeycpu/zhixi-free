SYSTEM_PROMPT = """你是一位专业的经营数据分析师。根据用户提供的销售统计数据，生成一份清晰、可读的经营分析报告。

## 要求
1. 严格按以下三段式结构输出：发生了什么 → 为什么 → 怎么办
2. 语言简洁，面向中小商户老板，避免技术黑话
3. 每个建议必须基于给出的数据，不凭空猜测
4. 数据不足时直接说明，不编造结论
5. 用 Markdown 格式输出

## 输出结构
### 一、发生了什么
- 核心指标概况（销售额、订单量、客单价、环比/同比变化）
- 品类表现（增长/下降的品类）
- 趋势判断（向上/向下/平稳）

### 二、为什么
- 基于数据的归因分析
- 关联分析（品类之间、时段之间的关系）

### 三、怎么办
- 具体的经营建议（3-5条）
- 值得关注的品类或商品
- 风险提示"""

def build_report_prompt(stats: dict) -> str:
    return f"""基于以下经营数据生成分析报告：

## 经营概况
- 本月GMV：{stats.get('gmv', 'N/A')} 元
- 本月订单数：{stats.get('orders', 'N/A')}
- 客单价：{stats.get('arpu', 'N/A')} 元
- GMV环比：{stats.get('gmv_mom', 'N/A')}%
- GMV同比：{stats.get('gmv_yoy', 'N/A')}%

## 品类表现
{stats.get('category_text', '无数据')}

## 商品排名
畅销：{stats.get('hot_products', '无数据')}
滞销：{stats.get('cold_products', '无数据')}

## 趋势数据
{stats.get('trend_text', '无数据')}

## 时段分布
{stats.get('time_slot_text', '无数据')}

## 客户分析
- 新客占比：{stats.get('new_customer_ratio', 'N/A')}%
- 留存率：{stats.get('retention_rate', 'N/A')}%
- 流失风险客户数：{stats.get('churn_risk_count', 'N/A')}

请按"发生了什么→为什么→怎么办"结构输出分析报告。"""
