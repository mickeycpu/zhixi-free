from database.client import supabase

def compute_time_slots(user_id: str) -> list:
    r = supabase.table("sales_data") \
        .select("order_time, total_amount") \
        .eq("user_id", user_id) \
        .execute()

    if not r.data:
        return []

    from collections import defaultdict
    slots = defaultdict(lambda: {"amount": 0.0, "orders": 0})

    for row in r.data:
        t = row.get("order_time")
        if not t:
            continue
        if isinstance(t, str):
            hour = int(t.split(":")[0])
        else:
            hour = t.hour if hasattr(t, "hour") else 0
        label = f"{hour:02d}:00-{hour:02d}:59"
        slots[label]["amount"] += float(row.get("total_amount", 0) or 0)
        slots[label]["orders"] += 1

    return [
        {"slot": k, "amount": round(v["amount"], 2), "orders": v["orders"]}
        for k, v in sorted(slots.items())
    ]


def compute_weekdays(user_id: str) -> list:
    r = supabase.table("sales_data") \
        .select("order_date, total_amount") \
        .eq("user_id", user_id) \
        .execute()

    if not r.data:
        return []

    from collections import defaultdict
    from datetime import date

    day_names = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"]
    days = defaultdict(lambda: {"amount": 0.0, "orders": 0})

    for row in r.data:
        d = row.get("order_date")
        if not d:
            continue
        if isinstance(d, str):
            dt = date.fromisoformat(d)
        else:
            dt = d
        label = day_names[dt.weekday()]
        days[label]["amount"] += float(row.get("total_amount", 0) or 0)
        days[label]["orders"] += 1

    return [
        {"weekday": name, "amount": round(days[name]["amount"], 2), "orders": days[name]["orders"]}
        for name in day_names
    ]
