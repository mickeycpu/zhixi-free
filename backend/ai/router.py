import json
from fastapi import APIRouter, Request, HTTPException

from database.client import supabase
from config import MIN_DAYS_FOR_AI_REPORT

from analytics.overview import compute_overview
from analytics.ranking import compute_category_ranking, compute_product_ranking
from analytics.trends import compute_trends
from analytics.time_slots import compute_time_slots, compute_weekdays
from analytics.customers import compute_customer_analysis
from ai.deepseek import generate_report

router = APIRouter(prefix="/api/reports", tags=["AI报告"])

@router.post("/generate")
async def generate(request: Request):
    user_id = request.state.user_id

    date_resp = supabase.table("sales_data") \
        .select("order_date") \
        .eq("user_id", user_id) \
        .not_.is_("order_date", "null") \
        .order("order_date") \
        .execute()

    if not date_resp.data:
        raise HTTPException(status_code=400, detail="没有数据，请先上传销售数据")

    dates = sorted(set(row["order_date"] for row in date_resp.data))
    if len(dates) < MIN_DAYS_FOR_AI_REPORT:
        raise HTTPException(
            status_code=400,
            detail=f"至少需要 {MIN_DAYS_FOR_AI_REPORT} 天的历史数据才能生成报告，当前只有 {len(dates)} 天",
        )

    overview = compute_overview(user_id)
    categories = compute_category_ranking(user_id)
    products = compute_product_ranking(user_id)
    day_trends = compute_trends(user_id, "day")
    time_slots = compute_time_slots(user_id)
    customer = compute_customer_analysis(user_id)

    cat_lines = []
    for c in categories[:5]:
        cat_lines.append(f"{c['category']}：{c['amount']} 元（占比 {c['share']}%）")
    category_text = "\n".join(cat_lines) if cat_lines else "无数据"

    hot_names = ", ".join(p["product_name"] for p in products.get("hot", [])[:5]) or "无数据"
    cold_names = ", ".join(p["product_name"] for p in products.get("cold", [])[:5]) or "无数据"

    trend_lines = []
    for t in day_trends[-7:]:
        trend_lines.append(f"{t['period']}：{t['amount']} 元（{t['orders']} 单）")
    trend_text = "\n".join(trend_lines) if trend_lines else "无数据"

    slot_lines = []
    for s in time_slots:
        slot_lines.append(f"{s['slot']}：{s['amount']} 元（{s['orders']} 单）")
    time_slot_text = "\n".join(slot_lines) if slot_lines else "无数据"

    stats = {
        **overview,
        "category_text": category_text,
        "hot_products": hot_names,
        "cold_products": cold_names,
        "trend_text": trend_text,
        "time_slot_text": time_slot_text,
        **customer,
    }

    data_range_start = dates[0]
    data_range_end = dates[-1]

    try:
        report = await generate_report(stats)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"AI 报告生成失败: {str(e)}")

    title = f"经营分析报告（{data_range_start} ~ {data_range_end}）"
    resp = supabase.table("reports").insert({
        "user_id": user_id,
        "title": title,
        "markdown_content": report["markdown"],
        "structured_json": report["structured"],
        "date_range_start": data_range_start,
        "date_range_end": data_range_end,
    }).execute()

    report_id = resp.data[0]["id"]

    return {
        "code": 0,
        "data": {
            "id": report_id,
            "title": title,
            "markdown": report["markdown"],
            "structured": report["structured"],
            "date_range_start": data_range_start,
            "date_range_end": data_range_end,
        },
        "message": "ok",
    }

@router.get("")
def list_reports(request: Request):
    user_id = request.state.user_id
    resp = supabase.table("reports") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(20) \
        .execute()
    return {"code": 0, "data": resp.data, "message": "ok"}

@router.get("/{report_id}")
def get_report(request: Request, report_id: str):
    user_id = request.state.user_id
    resp = supabase.table("reports") \
        .select("*") \
        .eq("user_id", user_id) \
        .eq("id", report_id) \
        .maybe_single() \
        .execute()
    if not resp.data:
        raise HTTPException(status_code=404, detail="报告不存在")
    return {"code": 0, "data": resp.data, "message": "ok"}
