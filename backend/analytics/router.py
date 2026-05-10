from fastapi import APIRouter, Request, Query

from analytics.overview import compute_overview
from analytics.ranking import compute_category_ranking, compute_product_ranking
from analytics.trends import compute_trends
from analytics.time_slots import compute_time_slots, compute_weekdays
from analytics.customers import compute_customer_analysis

router = APIRouter(prefix="/api/analytics", tags=["分析"])

@router.get("/overview")
def overview(request: Request):
    data = compute_overview(request.state.user_id)
    return {"code": 0, "data": data, "message": "ok"}

@router.get("/categories")
def categories(request: Request):
    data = compute_category_ranking(request.state.user_id)
    return {"code": 0, "data": data, "message": "ok"}

@router.get("/products")
def products(request: Request):
    data = compute_product_ranking(request.state.user_id)
    return {"code": 0, "data": data, "message": "ok"}

@router.get("/trends")
def trends(request: Request, granularity: str = Query("day", pattern="^(day|week|month)$")):
    data = compute_trends(request.state.user_id, granularity)
    return {"code": 0, "data": data, "message": "ok"}

@router.get("/time-slots")
def time_slots(request: Request):
    data = compute_time_slots(request.state.user_id)
    return {"code": 0, "data": data, "message": "ok"}

@router.get("/weekdays")
def weekdays(request: Request):
    data = compute_weekdays(request.state.user_id)
    return {"code": 0, "data": data, "message": "ok"}

@router.get("/customers")
def customers(request: Request):
    data = compute_customer_analysis(request.state.user_id)
    return {"code": 0, "data": data, "message": "ok"}
