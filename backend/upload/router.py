import io
from typing import Optional
from datetime import datetime

import pandas as pd
from fastapi import APIRouter, UploadFile, File, Request, HTTPException, Query
from pydantic import BaseModel

from database.client import supabase
from config import FREE_TIER_MONTHLY_LIMIT
from upload.cleaner import clean, auto_detect_columns

router = APIRouter(prefix="/api", tags=["数据上传"])

@router.post("/upload")
async def upload_file(request: Request, file: UploadFile = File(...)):
    user_id = request.state.user_id
    ext = file.filename.rsplit(".", 1)[-1].lower() if "." in file.filename else ""
    if ext not in ("xls", "xlsx", "csv"):
        raise HTTPException(status_code=400, detail="仅支持 xls/xlsx/csv 文件")

    content = await file.read()
    file_size = len(content)

    current_month = datetime.utcnow().strftime("%Y-%m")
    count_resp = supabase.table("sales_data") \
        .select("id", count="exact") \
        .eq("user_id", user_id) \
        .gte("created_at", f"{current_month}-01") \
        .execute()

    current_count = count_resp.count if hasattr(count_resp, "count") else 0

    try:
        if ext == "csv":
            df = pd.read_csv(io.BytesIO(content))
        else:
            df = pd.read_excel(io.BytesIO(content))
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"文件解析失败: {str(e)}")

    if df.empty:
        raise HTTPException(status_code=400, detail="文件中没有数据")

    column_map = auto_detect_columns(df)
    df = clean(df, column_map)

    if df.empty:
        raise HTTPException(status_code=400, detail="清洗后无有效数据")

    row_count = len(df)
    remaining = FREE_TIER_MONTHLY_LIMIT - current_count
    if row_count + current_count > FREE_TIER_MONTHLY_LIMIT:
        raise HTTPException(
            status_code=400,
            detail=f"本月还可上传 {remaining} 条（上限 {FREE_TIER_MONTHLY_LIMIT} 条/月）",
        )

    upload_resp = supabase.table("uploads").insert({
        "user_id": user_id,
        "filename": file.filename,
        "file_size": file_size,
        "row_count": row_count,
        "status": "processing",
    }).execute()
    upload_id = upload_resp.data[0]["id"]

    try:
        records = df.where(df.notna(), None).to_dict(orient="records")
        for r in records:
            r["user_id"] = user_id
            r["upload_id"] = upload_id
            for key in ("order_date", "order_time"):
                if key in r and r[key] is not None:
                    r[key] = r[key].isoformat() if hasattr(r[key], "isoformat") else r[key]

        batch_size = 500
        for i in range(0, len(records), batch_size):
            batch = records[i:i + batch_size]
            supabase.table("sales_data").insert(batch).execute()

        supabase.table("uploads").update({"status": "done"}).eq("id", upload_id).execute()
    except Exception as e:
        supabase.table("uploads").update({"status": "error", "error_message": str(e)}).eq("id", upload_id).execute()
        raise HTTPException(status_code=500, detail=f"入库失败: {str(e)}")

    return {
        "code": 0,
        "data": {
            "upload_id": upload_id,
            "row_count": row_count,
            "columns": list(df.columns),
        },
        "message": "ok",
    }

@router.get("/upload/history")
def upload_history(request: Request):
    user_id = request.state.user_id
    resp = supabase.table("uploads") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("created_at", desc=True) \
        .limit(50) \
        .execute()
    return {"code": 0, "data": resp.data, "message": "ok"}

@router.get("/data/export")
def data_export(request: Request, fmt: str = Query("csv", pattern="^(csv|xlsx)$")):
    user_id = request.state.user_id
    resp = supabase.table("sales_data") \
        .select("*") \
        .eq("user_id", user_id) \
        .order("order_date", desc=True) \
        .execute()

    df = pd.DataFrame(resp.data)
    if df.empty:
        raise HTTPException(status_code=404, detail="没有数据可导出")

    cols_drop = ["id", "user_id", "upload_id", "created_at"]
    df = df.drop(columns=[c for c in cols_drop if c in df.columns], errors="ignore")

    buffer = io.BytesIO()
    if fmt == "csv":
        df.to_csv(buffer, index=False, encoding="utf-8-sig")
        media_type = "text/csv"
        filename = "export.csv"
    else:
        df.to_excel(buffer, index=False)
        media_type = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        filename = "export.xlsx"

    buffer.seek(0)
    from starlette.responses import StreamingResponse
    return StreamingResponse(
        buffer,
        media_type=media_type,
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
