from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from database.client import supabase
from auth.permissions import ensure_profile, fallback_profile

PUBLIC_PATHS = {"/api/health", "/docs", "/openapi.json", "/redoc", "/api/auth/confirm-email", "/api/admin/migrate", "/api/admin/reset-admin-password", "/api/admin/generate-test-data", "/api/admin/backfill-all-users"}

class AuthMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if request.method == "OPTIONS":
            return await call_next(request)

        if request.url.path in PUBLIC_PATHS or request.url.path.startswith("/docs") or request.url.path.startswith("/openapi"):
            return await call_next(request)

        auth_header = request.headers.get("Authorization", "")
        if not auth_header.startswith("Bearer "):
            return JSONResponse(status_code=401, content={"code": 401, "data": None, "message": "Missing or invalid Authorization header"})

        token = auth_header[7:]
        try:
            auth_user = supabase.auth.get_user(token).user
        except Exception:
            return JSONResponse(status_code=401, content={"code": 401, "data": None, "message": "Invalid token"})

        try:
            profile = ensure_profile(auth_user)
        except Exception:
            profile = fallback_profile(auth_user)

        try:
            if profile.get("is_banned"):
                return JSONResponse(
                    status_code=403,
                    content={
                        "code": 403,
                        "data": None,
                        "message": profile.get("ban_reason") or "账号已被封禁",
                    },
                )

            request.state.user_id = auth_user.id
            request.state.user_email = auth_user.email
            request.state.user_phone = auth_user.phone
            request.state.user_role = profile.get("role", "user")
            request.state.user_profile = profile
        except Exception:
            return JSONResponse(status_code=401, content={"code": 401, "data": None, "message": "Invalid token"})

        return await call_next(request)

def get_user_id(request: Request) -> str:
    return request.state.user_id
