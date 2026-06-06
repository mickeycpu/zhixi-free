-- 在 Supabase SQL Editor 中一次性执行本文件
-- https://ihqhfxbqdbwsxzxylnpb.supabase.co → SQL Editor

create table if not exists public.uploads (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    filename text not null,
    file_size int not null default 0,
    row_count int not null default 0,
    status text not null default 'pending',
    error_message text,
    created_at timestamptz not null default now()
);

create table if not exists public.sales_data (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    upload_id uuid references public.uploads(id) on delete cascade not null,
    order_date date,
    order_time time,
    product_name text,
    category text,
    quantity int default 1,
    unit_price numeric(12,2),
    total_amount numeric(12,2),
    customer_ref text,
    channel text,
    created_at timestamptz not null default now()
);

create table if not exists public.reports (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    title text not null,
    markdown_content text not null,
    structured_json jsonb,
    date_range_start date,
    date_range_end date,
    created_at timestamptz not null default now()
);

create table if not exists public.alerts (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    alert_type text not null,
    title text not null,
    message text not null,
    severity text not null default 'info',
    is_read boolean not null default false,
    created_at timestamptz not null default now()
);

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

-- 索引
create index if not exists idx_sales_data_user_id on public.sales_data(user_id);
create index if not exists idx_sales_data_user_date on public.sales_data(user_id, order_date);
create index if not exists idx_uploads_user_id on public.uploads(user_id);
create index if not exists idx_reports_user_id on public.reports(user_id);
create index if not exists idx_alerts_user_read on public.alerts(user_id, is_read);
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_banned on public.profiles(is_banned);
create index if not exists idx_ai_token_usage_user_id on public.ai_token_usage(user_id);

-- RLS 启用
alter table public.uploads enable row level security;
alter table public.sales_data enable row level security;
alter table public.reports enable row level security;
alter table public.alerts enable row level security;
alter table public.profiles enable row level security;
alter table public.ai_token_usage enable row level security;

-- RLS 策略：用户数据隔离
do $$ begin
    if not exists (select 1 from pg_policies where policyname = 'user_isolation_uploads') then
        create policy "user_isolation_uploads" on public.uploads for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'user_isolation_sales_data') then
        create policy "user_isolation_sales_data" on public.sales_data for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'user_isolation_reports') then
        create policy "user_isolation_reports" on public.reports for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
    end if;
    if not exists (select 1 from pg_policies where policyname = 'user_isolation_alerts') then
        create policy "user_isolation_alerts" on public.alerts for all using (auth.uid() = user_id) with check (auth.uid() = user_id);
    end if;
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
