from datetime import datetime, date, timedelta
import random
from typing import Any

from fastapi import HTTPException, Request

from database.client import supabase

SUPER_ADMIN_EMAILS = {"15871427062@163.com"}
ADMIN_ROLES = {"admin", "super_admin"}


def _user_email(user: Any) -> str:
    return (getattr(user, "email", None) or "").lower()


def _user_phone(user: Any) -> str:
    return getattr(user, "phone", None) or ""


def _role_for_user(user: Any) -> str:
    return "super_admin" if _user_email(user) in SUPER_ADMIN_EMAILS else "user"


def fallback_profile(user: Any) -> dict:
    return {
        "user_id": getattr(user, "id"),
        "email": _user_email(user),
        "phone": _user_phone(user),
        "role": _role_for_user(user),
        "is_banned": False,
        "ban_reason": None,
    }


def _seed_sales_data(user_id: str):
    """为新用户生成示例销售数据，让管理员系统立刻有数据显示"""
    existing = supabase.table("sales_data").select("id", count="exact").eq("user_id", user_id).execute()
    if (existing.count or 0) > 0:
        return  # 已有数据，不重复生成

    products = ['拿铁', '美式咖啡', '抹茶拿铁', '卡布奇诺', '摩卡', '冰美式', '椰青冷萃', '红茶', '绿茶', '蛋糕']
    categories = ['咖啡', '咖啡', '咖啡', '咖啡', '咖啡', '咖啡', '咖啡', '茶饮', '茶饮', '甜点']
    channels = ['堂食', '外卖', '外卖', '堂食', '外卖', '堂食', '堂食', '外卖', '堂食', '外卖']
    customers = [f'cust_{i:03d}' for i in range(20)]
    times = ['09:15', '10:30', '11:00', '12:15', '14:00', '15:30', '16:45', '18:00', '19:30', '20:00']

    upload_resp = supabase.table("uploads").insert({
        "user_id": user_id, "filename": "sample_data.xlsx",
        "file_size": 0, "row_count": 300, "status": "done",
    }).execute()
    upload_id = upload_resp.data[0]["id"]

    random.seed(hash(user_id) & 0x7FFFFFFF)
    today = date.today()
    records = []
    for _ in range(300):
        d = today - timedelta(days=random.randint(0, 59))
        idx = random.randint(0, 9)
        qty = random.randint(1, 5)
        price = round(random.uniform(15, 38), 2)
        records.append({
            "user_id": user_id, "upload_id": upload_id,
            "order_date": d.isoformat(), "order_time": random.choice(times),
            "product_name": products[idx], "category": categories[idx],
            "quantity": qty, "unit_price": price,
            "total_amount": round(qty * price, 2),
            "customer_ref": random.choice(customers), "channel": random.choice(channels),
        })

    for i in range(0, len(records), 500):
        supabase.table("sales_data").insert(records[i:i + 500]).execute()


def ensure_profile(user: Any) -> dict:
    user_id = getattr(user, "id")
    email = _user_email(user)
    phone = _user_phone(user)
    seed_role = _role_for_user(user)

    existing = supabase.table("profiles") \
        .select("*") \
        .eq("user_id", user_id) \
        .maybe_single() \
        .execute()

    if existing.data:
        updates = {
            "email": email,
            "phone": phone,
            "updated_at": datetime.utcnow().isoformat(),
        }
        if email in SUPER_ADMIN_EMAILS and existing.data.get("role") != "super_admin":
            updates["role"] = "super_admin"
            updates["is_banned"] = False
            updates["ban_reason"] = None

        updated = supabase.table("profiles") \
            .update(updates) \
            .eq("user_id", user_id) \
            .execute()
        return updated.data[0] if updated.data else {**existing.data, **updates}

    created = supabase.table("profiles").insert({
        "user_id": user_id,
        "email": email,
        "phone": phone,
        "role": seed_role,
        "is_banned": False,
    }).execute()

    # 新用户自动获得示例销售数据
    try:
        _seed_sales_data(user_id)
    except Exception:
        pass

    return created.data[0]


def is_admin_role(role: str | None) -> bool:
    return role in ADMIN_ROLES


def require_admin(request: Request) -> None:
    if not is_admin_role(getattr(request.state, "user_role", None)):
        raise HTTPException(status_code=403, detail="需要管理员权限")


def require_super_admin(request: Request) -> None:
    if getattr(request.state, "user_role", None) != "super_admin":
        raise HTTPException(status_code=403, detail="需要最高管理员权限")
