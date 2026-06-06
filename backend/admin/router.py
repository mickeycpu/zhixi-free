from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from auth.permissions import require_admin, require_super_admin
from database.client import supabase

router = APIRouter(prefix="/api/admin", tags=["管理员"])


class RoleUpdate(BaseModel):
    role: str


class BanUpdate(BaseModel):
    is_banned: bool
    ban_reason: str | None = None


def _count(table: str) -> int:
    resp = supabase.table(table).select("id", count="exact").execute()
    return resp.count or 0


def _sum_tokens() -> dict:
    resp = supabase.table("ai_token_usage") \
        .select("prompt_tokens, completion_tokens, total_tokens") \
        .execute()

    prompt_tokens = 0
    completion_tokens = 0
    total_tokens = 0
    for row in resp.data or []:
        prompt_tokens += row.get("prompt_tokens") or 0
        completion_tokens += row.get("completion_tokens") or 0
        total_tokens += row.get("total_tokens") or 0

    return {
        "prompt_tokens": prompt_tokens,
        "completion_tokens": completion_tokens,
        "total_tokens": total_tokens,
    }


@router.get("/overview")
def overview(request: Request):
    require_admin(request)
    tokens = _sum_tokens()
    return {
        "code": 0,
        "data": {
            "account_count": _count("profiles"),
            "upload_count": _count("uploads"),
            "sales_count": _count("sales_data"),
            "report_count": _count("reports"),
            **tokens,
        },
        "message": "ok",
    }


@router.get("/users")
def list_users(request: Request):
    require_admin(request)

    profiles_resp = supabase.table("profiles") \
        .select("*") \
        .order("created_at", desc=True) \
        .execute()

    users = []
    for profile in profiles_resp.data or []:
        user_id = profile["user_id"]
        uploads = supabase.table("uploads").select("id", count="exact").eq("user_id", user_id).execute()
        reports = supabase.table("reports").select("id", count="exact").eq("user_id", user_id).execute()
        sales = supabase.table("sales_data").select("id", count="exact").eq("user_id", user_id).execute()
        usage = supabase.table("ai_token_usage").select("total_tokens").eq("user_id", user_id).execute()

        users.append({
            **profile,
            "total_uploads": uploads.count or 0,
            "total_reports": reports.count or 0,
            "total_sales": sales.count or 0,
            "total_tokens": sum((row.get("total_tokens") or 0) for row in (usage.data or [])),
        })

    return {"code": 0, "data": users, "message": "ok"}


@router.patch("/users/{user_id}/role")
def update_role(request: Request, user_id: str, payload: RoleUpdate):
    require_super_admin(request)

    if payload.role not in {"user", "admin"}:
        raise HTTPException(status_code=400, detail="角色只能设置为 user 或 admin")
    if user_id == request.state.user_id:
        raise HTTPException(status_code=400, detail="不能修改自己的最高管理员权限")

    resp = supabase.table("profiles") \
        .update({"role": payload.role}) \
        .eq("user_id", user_id) \
        .neq("role", "super_admin") \
        .execute()

    if not resp.data:
        raise HTTPException(status_code=404, detail="账号不存在或不能修改最高管理员")

    return {"code": 0, "data": resp.data[0], "message": "ok"}


@router.patch("/users/{user_id}/ban")
def update_ban(request: Request, user_id: str, payload: BanUpdate):
    require_admin(request)

    if user_id == request.state.user_id:
        raise HTTPException(status_code=400, detail="不能封禁自己")

    existing = supabase.table("profiles") \
        .select("role") \
        .eq("user_id", user_id) \
        .maybe_single() \
        .execute()

    if not existing.data:
        raise HTTPException(status_code=404, detail="账号不存在")
    if existing.data.get("role") == "super_admin":
        raise HTTPException(status_code=403, detail="不能封禁最高管理员")

    resp = supabase.table("profiles") \
        .update({
            "is_banned": payload.is_banned,
            "ban_reason": payload.ban_reason if payload.is_banned else None,
        }) \
        .eq("user_id", user_id) \
        .execute()

    return {"code": 0, "data": resp.data[0], "message": "ok"}
