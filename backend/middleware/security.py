from fastapi import Request
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware
from database.client import supabase

PUBLIC_PATHS = {"/api/health", "/docs", "/openapi.json", "/redoc"}

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
            user = supabase.auth.get_user(token)
            request.state.user_id = user.user.id
            request.state.user_phone = user.user.phone
        except Exception:
            return JSONResponse(status_code=401, content={"code": 401, "data": None, "message": "Invalid token"})

        return await call_next(request)

def get_user_id(request: Request) -> str:
    return request.state.user_id
