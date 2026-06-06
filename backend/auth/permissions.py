from datetime import datetime
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
    return created.data[0]


def is_admin_role(role: str | None) -> bool:
    return role in ADMIN_ROLES


def require_admin(request: Request) -> None:
    if not is_admin_role(getattr(request.state, "user_role", None)):
        raise HTTPException(status_code=403, detail="需要管理员权限")


def require_super_admin(request: Request) -> None:
    if getattr(request.state, "user_role", None) != "super_admin":
        raise HTTPException(status_code=403, detail="需要最高管理员权限")
