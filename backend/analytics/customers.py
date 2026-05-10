from datetime import date, timedelta
from database.client import supabase

def compute_customer_analysis(user_id: str) -> dict:
    r = supabase.table("sales_data") \
        .select("customer_ref, order_date, total_amount") \
        .eq("user_id", user_id) \
        .order("order_date") \
        .execute()

    if not r.data:
        return {
            "new_customer_ratio": 0,
            "conversion_rate": 0,
            "retention_rate": 0,
            "churn_risk_count": 0,
        }

    from collections import defaultdict

    customer_first = {}
    customer_last = {}
    customer_total = defaultdict(float)

    today = date.today()

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

        if ref not in customer_first or dt < customer_first[ref]:
            customer_first[ref] = dt
        if ref not in customer_last or dt > customer_last[ref]:
            customer_last[ref] = dt
        customer_total[ref] += amt

    this_month_start = today.replace(day=1)

    total_customers = len(customer_first)
    if total_customers == 0:
        return {
            "new_customer_ratio": 0,
            "conversion_rate": 0,
            "retention_rate": 0,
            "churn_risk_count": 0,
        }

    new_this_month = sum(1 for dt in customer_first.values() if dt >= this_month_start)
    first_month_customers = [ref for ref, dt in customer_first.items() if dt < this_month_start]
    returning = sum(1 for ref in first_month_customers if customer_last[ref] >= this_month_start)

    # churn risk: high-value customers (top 20%) with no order in 30 days
    threshold = sorted(customer_total.values(), reverse=True)[max(int(total_customers * 0.2), 1) - 1] if total_customers > 0 else 0
    thirty_days_ago = today - timedelta(days=30)
    churn_risk = sum(
        1 for ref, total in customer_total.items()
        if total >= threshold and customer_last[ref] < thirty_days_ago
    )

    return {
        "new_customer_ratio": round(new_this_month / total_customers * 100, 2),
        "conversion_rate": round(new_this_month / max(total_customers, 1) * 100, 2),
        "retention_rate": round(returning / max(len(first_month_customers), 1) * 100, 2),
        "churn_risk_count": churn_risk,
    }
