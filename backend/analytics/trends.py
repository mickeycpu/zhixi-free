from database.client import supabase

def compute_trends(user_id: str, granularity: str = "day") -> list:
    r = supabase.table("sales_data") \
        .select("order_date, total_amount") \
        .eq("user_id", user_id) \
        .order("order_date") \
        .execute()

    if not r.data:
        return []

    from collections import defaultdict
    from datetime import date, timedelta

    if granularity == "day":
        key_fn = lambda row: row.get("order_date")
    elif granularity == "week":
        def week_key(row):
            d = row.get("order_date")
            if not d:
                return None
            dt = date.fromisoformat(d) if isinstance(d, str) else d
            monday = dt - timedelta(days=dt.weekday())
            return monday.isoformat()
        key_fn = week_key
    elif granularity == "month":
        def month_key(row):
            d = row.get("order_date")
            if not d:
                return None
            return d[:7] if isinstance(d, str) else d.strftime("%Y-%m")
        key_fn = month_key
    else:
        key_fn = lambda row: row.get("order_date")

    period_amt = defaultdict(float)
    period_orders = defaultdict(int)
    for row in r.data:
        key = key_fn(row)
        if key is None:
            continue
        period_amt[key] += float(row.get("total_amount", 0) or 0)
        period_orders[key] += 1

    return [
        {
            "period": k,
            "amount": round(period_amt[k], 2),
            "orders": period_orders[k],
        }
        for k in sorted(period_amt.keys())
    ]
