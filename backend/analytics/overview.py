from datetime import date, timedelta
from database.client import supabase

def compute_overview(user_id: str) -> dict:
    today = date.today()
    this_month_start = today.replace(day=1)
    last_month_start = (this_month_start - timedelta(days=1)).replace(day=1)
    last_month_end = this_month_start - timedelta(days=1)

    this_year_start = today.replace(month=1, day=1)
    last_year_start = this_year_start.replace(year=this_year_start.year - 1)
    last_year_end = this_year_start - timedelta(days=1)

    def sum_amount(start_d, end_d):
        r = supabase.table("sales_data") \
            .select("total_amount") \
            .eq("user_id", user_id) \
            .gte("order_date", start_d.isoformat()) \
            .lte("order_date", end_d.isoformat()) \
            .execute()
        return sum(row.get("total_amount", 0) or 0 for row in (r.data or []))

    def count_orders(start_d, end_d):
        r = supabase.table("sales_data") \
            .select("id", count="exact") \
            .eq("user_id", user_id) \
            .gte("order_date", start_d.isoformat()) \
            .lte("order_date", end_d.isoformat()) \
            .execute()
        return r.count if hasattr(r, "count") else 0

    gmv_this_month = sum_amount(this_month_start, today)
    orders_this_month = count_orders(this_month_start, today)
    gmv_last_month = sum_amount(last_month_start, last_month_end)
    orders_last_month = count_orders(last_month_start, last_month_end)
    gmv_this_year = sum_amount(this_year_start, today)
    orders_this_year = count_orders(this_year_start, today)
    gmv_last_year = sum_amount(last_year_start, last_year_end)
    orders_last_year = count_orders(last_year_start, last_year_end)

    def safe_div(a, b):
        return round(a / b, 2) if b else 0

    def safe_pct(current, previous):
        if not previous:
            return None
        return round((current - previous) / previous * 100, 2)

    return {
        "gmv": round(gmv_this_month, 2),
        "orders": orders_this_month,
        "arpu": safe_div(gmv_this_month, orders_this_month),
        "gmv_mom": safe_pct(gmv_this_month, gmv_last_month),
        "orders_mom": safe_pct(orders_this_month, orders_last_month),
        "gmv_yoy": safe_pct(gmv_this_year, gmv_last_year),
        "orders_yoy": safe_pct(orders_this_year, orders_last_year),
    }
