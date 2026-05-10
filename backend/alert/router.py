from fastapi import APIRouter, Request

from database.client import supabase
from alert.detector import run_anomaly_check, persist_alerts

router = APIRouter(prefix="/api/alerts", tags=["预警"])

@router.get("")
def list_alerts(request: Request):
    user_id = request.state.user_id

    # 每次查询时运行一次检测
    try:
        alerts = run_anomaly_check(user_id)
        persist_alerts(user_id, alerts)
    except Exception:
        pass

    resp = supabase.table("alerts") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(30) \
        .execute()
    return {"code": 0, "data": resp.data, "message": "ok"}

@router.put("/{alert_id}/read")
def mark_read(request: Request, alert_id: str):
    user_id = request.state.user_id
    supabase.table("alerts") \
        .update({"is_read": True}) \
        .eq("id", alert_id) \
        .eq("user_id", user_id) \
        .execute()
    return {"code": 0, "data": None, "message": "ok"}
