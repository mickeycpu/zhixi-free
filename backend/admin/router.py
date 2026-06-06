from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from auth.permissions import require_admin, require_super_admin
from database.client import supabase
from config import SUPABASE_SERVICE_ROLE_KEY

router = APIRouter(prefix="/api/admin", tags=["管理员"])


# ====== 数据库迁移 ======
SCHEMA_SQL = """
create table if not exists public.profiles (
    user_id uuid primary key references auth.users(id) on delete cascade,
    email text,
    phone text,
    role text not null default 'user' check (role in ('user', 'admin', 'super_admin')),
    is_banned boolean not null default false,
    ban_reason text,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now()
);

create table if not exists public.ai_token_usage (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    report_id uuid references public.reports(id) on delete set null,
    provider text not null default 'deepseek',
    model text not null default 'deepseek-chat',
    prompt_tokens int not null default 0,
    completion_tokens int not null default 0,
    total_tokens int not null default 0,
    created_at timestamptz not null default now()
);

create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_banned on public.profiles(is_banned);
create index if not exists idx_ai_token_usage_user_id on public.ai_token_usage(user_id);

alter table public.profiles enable row level security;
alter table public.ai_token_usage enable row level security;

do $$ begin
    if not exists (select 1 from pg_policies where policyname = 'profile_owner_read') then
        create policy "profile_owner_read" on public.profiles for select using (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'token_usage_owner_read') then
        create policy "token_usage_owner_read" on public.ai_token_usage for select using (auth.uid() = user_id);
    end if;
end $$;

insert into public.profiles (user_id, email, phone, role, is_banned)
select id, email, phone, 'super_admin', false
from auth.users
where lower(email) = '15871427062@163.com'
on conflict (user_id) do update set
    role = 'super_admin',
    is_banned = false,
    ban_reason = null,
    email = excluded.email,
    phone = excluded.phone,
    updated_at = now();
"""


@router.post("/migrate")
async def run_migration(request: Request):
    """执行数据库迁移：创建 profiles 和 ai_token_usage 表"""
    try:
        import psycopg2
        # 使用 Supabase 连接池，service_role key 作为密码
        conn = psycopg2.connect(
            host="aws-0-us-west-1.pooler.supabase.com",
            port=6543,
            user=f"postgres.ihqhfxbqdbwsxzxylnpb",
            password=SUPABASE_SERVICE_ROLE_KEY,
            database="postgres",
            connect_timeout=10,
        )
        conn.autocommit = True
        cur = conn.cursor()
        cur.execute(SCHEMA_SQL)
        cur.close()
        conn.close()
        return {"code": 0, "data": {"status": "migrated"}, "message": "建表成功"}
    except ImportError:
        # psycopg2 不可用时，尝试用 supabase-py 的方式
        return await _migrate_via_api()
    except Exception as e:
        # 回退到 API 方式
        try:
            return await _migrate_via_api()
        except Exception as e2:
            return {"code": 500, "data": None, "message": f"迁移失败: {str(e)}, api: {str(e2)}"}


async def _migrate_via_api():
    """通过 Supabase REST API 逐项检查并尝试创建"""
    import httpx
    results = []

    # 检查 profiles 表是否存在
    async with httpx.AsyncClient(timeout=15) as client:
        url = f"https://ihqhfxbqdbwsxzxylnpb.supabase.co/rest/v1/profiles?limit=0"
        resp = await client.get(url, headers={
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        })
        results.append(f"profiles表: {resp.status_code}")

        url2 = f"https://ihqhfxbqdbwsxzxylnpb.supabase.co/rest/v1/ai_token_usage?limit=0"
        resp2 = await client.get(url2, headers={
            "apikey": SUPABASE_SERVICE_ROLE_KEY,
            "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
        })
        results.append(f"ai_token_usage表: {resp2.status_code}")

    return {"code": 0, "data": {"checks": results}, "message": "表检查完成。如都是200则表已存在，否则需要在Supabase SQL Editor中执行schema.sql"}


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
