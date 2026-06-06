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

function translateError(msg: string): string {
  const map: Record<string, string> = {
    'Invalid login credentials': '邮箱或密码错误',
    'Email not confirmed': '邮箱未确认，请先前往邮箱点击确认链接',
    'User not found': '账号不存在',
    'User already registered': '该邮箱已注册',
    'Password should be at least 6 characters': '密码长度不能少于6位',
    'Unable to validate email address: invalid format': '邮箱格式不正确',
  };
  return map[msg] || msg;
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
    throw new Error(translateError(err.error_description || err.msg) || '登录失败');
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
    throw new Error(translateError(err.msg || err.error_description) || '注册失败');
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
