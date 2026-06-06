from datetime import datetime
import httpx
from fastapi import APIRouter, Request

from database.client import supabase
from config import FREE_TIER_MONTHLY_LIMIT, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY

router = APIRouter(prefix="/api/auth", tags=["认证"])

@router.get("/me")
def me(request: Request):
    return {
        "code": 0,
        "data": {
            "user_id": request.state.user_id,
            "email": request.state.user_email,
            "phone": request.state.user_phone,
            "role": request.state.user_role,
            "is_banned": request.state.user_profile.get("is_banned", False),
        },
        "message": "ok",
    }


@router.get("/user/usage")
def user_usage(request: Request):
    user_id = request.state.user_id
    current_month = datetime.utcnow().strftime("%Y-%m")

    monthly_resp = supabase.table("sales_data") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .gte("created_at", f"{current_month}-01") \
        .execute()
    monthly_used = monthly_resp.count if hasattr(monthly_resp, "count") else 0

    total_resp = supabase.table("sales_data") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .execute()
    total_sales = total_resp.count if hasattr(total_resp, "count") else 0

    uploads_resp = supabase.table("uploads") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .execute()
    total_uploads = uploads_resp.count if hasattr(uploads_resp, "count") else 0

    reports_resp = supabase.table("reports") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .execute()
    total_reports = reports_resp.count if hasattr(reports_resp, "count") else 0

    return {
        "code": 0,
        "data": {
            "monthly_used": monthly_used,
            "monthly_limit": FREE_TIER_MONTHLY_LIMIT,
            "total_sales": total_sales,
            "total_uploads": total_uploads,
            "total_reports": total_reports,
        },
        "message": "ok",
    }


@router.post("/confirm-email")
async def confirm_email(request: Request):
    """注册后自动确认邮箱，解决国内用户收不到Supabase确认邮件的问题"""
    body = await request.json()
    user_id = body.get("user_id")
    if not user_id:
        return {"code": 400, "data": None, "message": "缺少 user_id"}

    async with httpx.AsyncClient(timeout=15) as client:
        resp = await client.put(
            f"{SUPABASE_URL}/auth/v1/admin/users/{user_id}",
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": "application/json",
            },
            json={"email_confirm": True},
        )
        if resp.status_code == 200:
            return {"code": 0, "data": None, "message": "邮箱已确认"}
        return {"code": 500, "data": None, "message": f"确认失败: {resp.text[:200]}"}
