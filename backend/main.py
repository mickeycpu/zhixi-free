from contextlib import asynccontextmanager

from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from middleware.security import AuthMiddleware
from auth.router import router as auth_router
from upload.router import router as upload_router
from analytics.router import router as analytics_router
from ai.router import router as ai_router
from alert.router import router as alert_router
from admin.router import router as admin_router

app = FastAPI(
    title="智析免费版 API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(AuthMiddleware)

app.include_router(auth_router)
app.include_router(upload_router)
app.include_router(analytics_router)
app.include_router(ai_router)
app.include_router(alert_router)
app.include_router(admin_router)


@app.get("/api/health")
def health():
    return {"code": 0, "data": {"status": "ok"}, "message": "ok"}
