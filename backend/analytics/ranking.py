from database.client import supabase

def compute_category_ranking(user_id: str) -> list:
    r = supabase.table("sales_data") \
        .select("category, total_amount") \
        .eq("user_id", user_id) \
        .execute()

    if not r.data:
        return []

    from collections import defaultdict
    cat_amt = defaultdict(float)
    for row in r.data:
        cat = row.get("category") or "其他"
        cat_amt[cat] += float(row.get("total_amount", 0) or 0)

    total = sum(cat_amt.values())
    result = []
    for cat, amt in sorted(cat_amt.items(), key=lambda x: x[1], reverse=True):
        result.append({
            "category": cat,
            "amount": round(amt, 2),
            "share": round(amt / total * 100, 2) if total > 0 else 0,
        })
    return result


def compute_product_ranking(user_id: str) -> dict:
    r = supabase.table("sales_data") \
        .select("product_name, total_amount, quantity") \
        .eq("user_id", user_id) \
        .execute()

    if not r.data:
        return {"hot": [], "cold": []}

    from collections import defaultdict
    prod_amt = defaultdict(float)
    prod_qty = defaultdict(int)
    for row in r.data:
        name = row.get("product_name") or "未知商品"
        prod_amt[name] += float(row.get("total_amount", 0) or 0)
        prod_qty[name] += int(row.get("quantity", 0) or 0)

    sorted_by_amt = sorted(prod_amt.items(), key=lambda x: x[1], reverse=True)
    total_products = len(sorted_by_amt)

    hot = []
    cold = []
    for i, (name, amt) in enumerate(sorted_by_amt):
        item = {"product_name": name, "amount": round(amt, 2), "quantity": prod_qty[name]}
        if i < max(10, total_products * 0.2):
            hot.append(item)
        else:
            cold.append(item)

    return {"hot": hot, "cold": cold}
