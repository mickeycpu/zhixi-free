from datetime import datetime
from fastapi import APIRouter, Request

from database.client import supabase
from config import FREE_TIER_MONTHLY_LIMIT

router = APIRouter(prefix="/api/auth", tags=["认证"])

@router.get("/me")
def me(request: Request):
    return {
        "code": 0,
        "data": {
            "user_id": request.state.user_id,
            "phone": request.state.user_phone,
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
