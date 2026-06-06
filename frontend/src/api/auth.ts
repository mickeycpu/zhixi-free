import type { ApiResponse, UserInfo } from '../types';
import client from './client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL || 'https://ihqhfxbqdbwsxzxylnpb.supabase.co';
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

function supabaseHeaders(): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    apikey: SUPABASE_ANON_KEY,
  };
}

function translateError(err: Record<string, any>): string {
  // 收集所有可能的错误信息字段
  const raw = (err.error_description || err.msg || err.message || err.error || '').toLowerCase();

  if (raw.includes('invalid login') || raw.includes('invalid credentials') || raw.includes('invalid_grant'))
    return '邮箱或密码错误';
  if (raw.includes('email not confirmed') || raw.includes('not confirmed'))
    return '邮箱未确认，请先前往邮箱点击确认链接';
  if (raw.includes('user not found') || raw.includes('user not exist'))
    return '账号不存在';
  if (raw.includes('already registered') || raw.includes('already exists') || raw.includes('already been registered'))
    return '该邮箱已注册';
  if (raw.includes('password') && (raw.includes('6') || raw.includes('least') || raw.includes('weak')))
    return '密码长度不能少于6位';
  if (raw.includes('invalid format') || raw.includes('validate email') || raw.includes('invalid email'))
    return '邮箱格式不正确';
  if (raw.includes('rate') || raw.includes('too many') || raw.includes('request'))
    return '操作太频繁，请稍后再试';

  // 兜底：英文全换中文
  return '登录失败，请检查邮箱和密码是否正确';
}

export async function loginWithPassword(
  email: string,
  password: string,
): Promise<{ token: string; user: UserInfo }> {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(translateError(err));
  }

  const data = await resp.json();
  return {
    token: data.access_token,
    user: {
      user_id: data.user?.id || '',
      phone: data.user?.phone || email,
      email: data.user?.email || email,
    },
  };
}

export async function registerWithPassword(
  email: string,
  password: string,
): Promise<{ token: string; user: UserInfo }> {
  const resp = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
    method: 'POST',
    headers: supabaseHeaders(),
    body: JSON.stringify({ email, password }),
  });

  if (!resp.ok) {
    const err = await resp.json().catch(() => ({}));
    throw new Error(translateError(err));
  }

  const data = await resp.json();
  return {
    token: data.access_token,
    user: {
      user_id: data.user?.id || '',
      phone: data.user?.phone || email,
      email: data.user?.email || email,
    },
  };
}

export async function getMe(): Promise<ApiResponse<UserInfo>> {
  const resp = await client.get('/api/auth/me');
  return resp.data;
}

export async function confirmEmail(userId: string): Promise<boolean> {
  try {
    const resp = await fetch(
      `${import.meta.env.VITE_API_BASE_URL || '/api'}/api/auth/confirm-email`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId }),
      }
    );
    return resp.ok;
  } catch {
    return false;
  }
}
