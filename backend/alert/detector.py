from datetime import date, timedelta
from database.client import supabase

def run_anomaly_check(user_id: str) -> list:
    alerts = []

    today = date.today()
    yesterday = today - timedelta(days=1)
    day_before = today - timedelta(days=2)
    seven_days_ago = today - timedelta(days=7)

    def day_amount(d):
        r = supabase.table("sales_data") \
            .select("total_amount") \
            .eq("user_id", user_id) \
            .eq("order_date", d.isoformat()) \
            .execute()
        return sum(row.get("total_amount", 0) or 0 for row in (r.data or []))

    def day_orders(d):
        r = supabase.table("sales_data") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .eq("order_date", d.isoformat()) \
            .execute()
        return r.count if hasattr(r, "count") else 0

    yesterday_amt = day_amount(yesterday)
    day_before_amt = day_amount(day_before)
    recent_avg_amt = sum(day_amount(today - timedelta(days=i)) for i in range(2, 9)) / 7

    # 销售骤降：昨天 < 前天的 50%
    if day_before_amt > 0 and yesterday_amt < day_before_amt * 0.5:
        alerts.append({
            "alert_type": "sales_anomaly",
            "title": "销售骤降预警",
            "message": f"昨日销售额 {yesterday_amt:.2f} 元，较前日 {day_before_amt:.2f} 元下降超过50%，请关注经营状况",
            "severity": "high",
        })

    # 波动异常：昨天低于近7日均值的 30%
    if recent_avg_amt > 0 and yesterday_amt < recent_avg_amt * 0.3:
        alerts.append({
            "alert_type": "data_fluctuation",
            "title": "销售异常波动",
            "message": f"昨日销售额 {yesterday_amt:.2f} 元，仅为近7日均值 {recent_avg_amt:.2f} 元的 {yesterday_amt/recent_avg_amt*100:.0f}%",
            "severity": "medium",
        })

    # 客户流失预警
    r = supabase.table("sales_data") \
        .select("customer_ref, order_date, total_amount") \
        .eq("user_id", user_id) \
        .execute()

    if r.data:
        from collections import defaultdict
        customer_last = {}
        customer_total = defaultdict(float)
        for row in r.data:
            ref = row.get("customer_ref")
            d = row.get("order_date")
            amt = float(row.get("total_amount", 0) or 0)
            if not ref or not d:
                continue
            if isinstance(d, str):
                dt = date.fromisoformat(d)
            else:
                dt = d
            if ref not in customer_last or dt > customer_last[ref]:
                customer_last[ref] = dt
            customer_total[ref] += amt

        if customer_total:
            threshold = sorted(customer_total.values(), reverse=True)[
                max(int(len(customer_total) * 0.2), 1) - 1
            ]
            thirty_days_ago = today - timedelta(days=30)
            churn_names = [
                ref for ref, total in customer_total.items()
                if total >= threshold and customer_last[ref] < thirty_days_ago
            ]
            if churn_names:
                alerts.append({
                    "alert_type": "customer_churn",
                    "title": "高价值客户流失风险",
                    "message": f"有 {len(churn_names)} 位高价值客户超过30天未复购，建议主动联系回访",
                    "severity": "high",
                })

    return alerts

def persist_alerts(user_id: str, alerts: list):
    for a in alerts:
        a["user_id"] = user_id
        # 去重：相同类型和标题24小时内不重复
        existing = supabase.table("alerts") \
            .select("id") \
            .eq("user_id", user_id) \
            .eq("alert_type", a["alert_type"]) \
            .eq("title", a["title"]) \
            .gte("created_at", (date.today() - timedelta(days=1)).isoformat()) \
            .execute()
        if not existing.data:
            supabase.table("alerts").insert(a).execute()
