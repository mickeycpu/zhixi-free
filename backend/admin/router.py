from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel

from auth.permissions import require_admin, require_super_admin, _seed_sales_data
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


@router.post("/backfill-all-users")
async def backfill_all_users():
    """为所有已有Supabase Auth用户创建profile + 示例数据"""
    try:
        import httpx
        async with httpx.AsyncClient(timeout=15) as client:
            list_resp = await client.get(
                f"https://ihqhfxbqdbwsxzxylnpb.supabase.co/auth/v1/admin/users",
                headers={"Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}", "apikey": SUPABASE_SERVICE_ROLE_KEY},
            )
            all_users = list_resp.json().get("users", [])
            results = []
            for u in all_users:
                uid = u["id"]
                email = (u.get("email") or "").lower()
                phone = u.get("phone") or ""
                role = "super_admin" if email == "15871427062@163.com" else "user"
                try:
                    p = supabase.table("profiles").select("user_id").eq("user_id", uid).limit(1).execute()
                    if p and p.data and len(p.data) > 0:
                        supabase.table("profiles").update({"role": role, "email": email, "is_banned": False}).eq("user_id", uid).execute()
                    else:
                        supabase.table("profiles").insert({"user_id": uid, "email": email, "phone": phone or "", "role": role, "is_banned": False}).execute()
                except Exception as ex:
                    results.append({"email": email, "error": str(ex)[:200]})
                    continue
                try:
                    _seed_sales_data(uid)
                except Exception:
                    pass
                results.append({"email": email, "role": role, "done": True})
            return {"code": 0, "data": {"backfilled": len(results), "details": results}, "message": "ok"}
    except Exception as e:
        return {"code": 500, "data": None, "message": str(e)}


@router.post("/generate-test-data")
async def generate_test_data():
    """为超级管理员生成500条测试销售数据"""
    import datetime as dt
    import random
    import httpx

    # 找到管理员
    async with httpx.AsyncClient(timeout=15) as client:
        list_resp = await client.get(
            f"https://ihqhfxbqdbwsxzxylnpb.supabase.co/auth/v1/admin/users",
            headers={"Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}", "apikey": SUPABASE_SERVICE_ROLE_KEY},
        )
        users = list_resp.json().get("users", [])
        admin_id = None
        for u in users:
            if u.get("email", "").lower() == "15871427062@163.com":
                admin_id = u["id"]
                break

        if not admin_id:
            return {"code": 404, "data": None, "message": "找不到管理员账号"}

        # 先创建 upload 记录
        upload_resp = supabase.table("uploads").insert({
            "user_id": admin_id,
            "filename": "test_data_admin.xlsx",
            "file_size": 0,
            "row_count": 500,
            "status": "done",
        }).execute()
        upload_id = upload_resp.data[0]["id"]

        # 生成500条数据
        products = ['拿铁', '美式咖啡', '抹茶拿铁', '卡布奇诺', '摩卡', '冰美式', '椰青冷萃', '红茶', '绿茶', '蛋糕']
        categories = ['咖啡', '咖啡', '咖啡', '咖啡', '咖啡', '咖啡', '咖啡', '茶饮', '茶饮', '甜点']
        channels = ['堂食', '外卖', '外卖', '堂食', '外卖', '堂食', '堂食', '外卖', '堂食', '外卖']
        customers = [f'cust_{i:03d}' for i in range(20)]
        times = ['09:15', '10:30', '11:00', '12:15', '14:00', '15:30', '16:45', '18:00', '19:30', '20:00']

        random.seed(42)
        today = dt.date.today()
        records = []
        for i in range(500):
            d = today - dt.timedelta(days=random.randint(0, 59))
            idx = random.randint(0, 9)
            qty = random.randint(1, 5)
            price = round(random.uniform(15, 38), 2)
            records.append({
                "user_id": admin_id,
                "upload_id": upload_id,
                "order_date": d.isoformat(),
                "order_time": random.choice(times),
                "product_name": products[idx],
                "category": categories[idx],
                "quantity": qty,
                "unit_price": price,
                "total_amount": round(qty * price, 2),
                "customer_ref": random.choice(customers),
                "channel": random.choice(channels),
            })

        batch_size = 500
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            supabase.table("sales_data").insert(batch).execute()

        return {"code": 0, "data": {"count": len(records)}, "message": "测试数据已生成"}


@router.get("/debug-raw-profiles")
async def debug_raw_profiles():
    """调试：直接返回profiles表原始数据"""
    resp = supabase.table("profiles").select("*").execute()
    return {"code": 0, "data": resp.data, "message": f"共{len(resp.data) if resp.data else 0}条", "count_attr": getattr(resp, "count", "N/A")}


@router.post("/reset-admin-password")
async def reset_admin_password():
    """重置超级管理员密码为 test123456"""
    import httpx
    async with httpx.AsyncClient(timeout=15) as client:
        # 1. 通过邮箱查用户ID
        list_resp = await client.get(
            f"https://ihqhfxbqdbwsxzxylnpb.supabase.co/auth/v1/admin/users",
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
            },
        )
        users = list_resp.json().get("users", [])
        admin_id = None
        for u in users:
            if u.get("email", "").lower() == "15871427062@163.com":
                admin_id = u["id"]
                break

        if not admin_id:
            return {"code": 404, "data": None, "message": "找不到管理员账号"}

        # 2. 重置密码
        put_resp = await client.put(
            f"https://ihqhfxbqdbwsxzxylnpb.supabase.co/auth/v1/admin/users/{admin_id}",
            headers={
                "Authorization": f"Bearer {SUPABASE_SERVICE_ROLE_KEY}",
                "apikey": SUPABASE_SERVICE_ROLE_KEY,
                "Content-Type": "application/json",
            },
            json={"password": "test123456", "email_confirm": True},
        )
        if put_resp.status_code == 200:
            return {"code": 0, "data": None, "message": "密码已重置为 test123456，现在可以登录了"}
        return {"code": 500, "data": None, "message": f"重置失败: {put_resp.text[:200]}"}


class RoleUpdate(BaseModel):
    role: str


class BanUpdate(BaseModel):
    is_banned: bool
    ban_reason: str | None = None


def _count(table: str) -> int:
    resp = supabase.table(table).select("id", count="exact").execute()
    if hasattr(resp, "count") and resp.count is not None:
        return resp.count
    return len(resp.data) if resp.data else 0


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

    profiles_resp = supabase.table("profiles").select("*").execute()

    profiles = profiles_resp.data or []

    users = []
    for profile in profiles:
        uid = profile.get("user_id")
        u = dict(profile)
        u.setdefault("total_uploads", 0)
        u.setdefault("total_reports", 0)
        u.setdefault("total_sales", 0)
        u.setdefault("total_tokens", 0)
        # 异步查每个用户的数据（不阻塞主查询）
        try:
            s = supabase.table("sales_data").select("id", count="exact").eq("user_id", uid).execute()
            u["total_sales"] = s.count if hasattr(s, "count") and s.count else 0
        except Exception:
            pass
        try:
            r = supabase.table("reports").select("id", count="exact").eq("user_id", uid).execute()
            u["total_reports"] = r.count if hasattr(r, "count") and r.count else 0
        except Exception:
            pass
        try:
            up = supabase.table("uploads").select("id", count="exact").eq("user_id", uid).execute()
            u["total_uploads"] = up.count if hasattr(up, "count") and up.count else 0
        except Exception:
            pass
        try:
            tk = supabase.table("ai_token_usage").select("total_tokens").eq("user_id", uid).execute()
            u["total_tokens"] = sum((row.get("total_tokens") or 0) for row in (tk.data or []))
        except Exception:
            pass
        users.append(u)

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
