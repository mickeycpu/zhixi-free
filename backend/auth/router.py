from fastapi import APIRouter, Request

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
