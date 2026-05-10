import hashlib
import pandas as pd
from typing import Optional

def clean(df: pd.DataFrame, column_map: dict) -> pd.DataFrame:
    df = df.rename(columns={k: v for k, v in column_map.items() if k in df.columns})
    df = df.drop_duplicates()
    df = df.dropna(how="all")

    if "total_amount" in df.columns:
        df["total_amount"] = pd.to_numeric(df["total_amount"], errors="coerce")
        df = df[df["total_amount"].notna() & (df["total_amount"] > 0)]
        q99 = df["total_amount"].quantile(0.99)
        df = df[df["total_amount"] <= q99]

    if "quantity" in df.columns:
        df["quantity"] = pd.to_numeric(df["quantity"], errors="coerce").fillna(1).astype(int)
        df = df[df["quantity"] > 0]

    if "unit_price" in df.columns:
        df["unit_price"] = pd.to_numeric(df["unit_price"], errors="coerce").fillna(0)

    if "order_date" in df.columns:
        df["order_date"] = pd.to_datetime(df["order_date"], errors="coerce")
        df = df[df["order_date"].notna()]
        df["order_date"] = df["order_date"].dt.date

    if "order_time" in df.columns:
        try:
            df["order_time"] = pd.to_datetime(df["order_time"], format="%H:%M", errors="coerce").dt.time
        except Exception:
            df["order_time"] = None

    if "customer_ref" in df.columns and df["customer_ref"].notna().any():
        df["customer_ref"] = df["customer_ref"].astype(str).apply(
            lambda x: hashlib.sha256(x.encode()).hexdigest()[:16] if x else None
        )

    fill_map = {}
    if "category" in df.columns:
        fill_map["category"] = "其他"
    if "product_name" in df.columns:
        fill_map["product_name"] = "未知商品"
    if "channel" in df.columns:
        fill_map["channel"] = "未知"
    df = df.fillna(fill_map)

    return df

def auto_detect_columns(df: pd.DataFrame) -> dict:
    patterns = {
        "order_date": ["日期", "订单日期", "下单日期", "销售日期", "date", "order_date", "时间", "下单时间"],
        "order_time": ["时间", "下单时间", "time", "order_time"],
        "product_name": ["商品", "商品名称", "产品", "品名", "product", "product_name", "name", "商品名", "货品"],
        "category": ["品类", "分类", "类别", "category", "cat", "类目", "商品分类"],
        "quantity": ["数量", "销量", "quantity", "qty", "件数", "销售数量"],
        "unit_price": ["单价", "unit_price", "price", "售价"],
        "total_amount": ["金额", "总金额", "销售金额", "销售额", "amount", "total", "sum", "成交价", "实付"],
        "customer_ref": ["客户", "customer", "手机号", "会员", "顾客", "电话"],
        "channel": ["渠道", "channel", "来源", "平台"],
    }

    result = {}
    columns_lower = {c.lower().strip(): c for c in df.columns}

    for target, candidates in patterns.items():
        for cand in candidates:
            if cand in df.columns:
                result[cand] = target
                break
            if cand.lower().strip() in columns_lower:
                result[columns_lower[cand.lower().strip()]] = target
                break

    return result
